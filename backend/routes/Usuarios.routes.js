const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');


const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');
const verificarSuperAdmin = require('../middleware/superAdmin');

const ROLES = ['cliente', 'admin'];

function responderError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID no válido' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
}

// GET /api/usuarios — listar usuarios (solo admin), sin contraseñas
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (err) {
        responderError(res, err);
    }
});

// PUT /api/usuarios/:id/rol — cambiar el rol de un usuario (solo admin)
router.put('/:id/rol', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { rol } = req.body;

        if (!ROLES.includes(rol)) {
            return res.status(400).json({ error: 'El rol debe ser cliente o admin' });
        }

        // Evita que el único admin se quite el rol a sí mismo y quede sin acceso
        if (req.params.id === req.usuario.id && rol !== 'admin') {
            return res.status(400).json({ error: 'No puedes quitarte tu propio rol de admin' });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            { rol },
            { new: true, runValidators: true }
        ).select('-password');

        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ mensaje: 'Rol actualizado exitosamente', data: usuario });
    } catch (err) {
        responderError(res, err);
    }
});

// DELETE /api/usuarios/:id - eliminar un usuario (solo superadmin)
router.delete('/:id', verificarToken, verificarSuperAdmin, async (req, res) => {
    try {
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado'});

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (err) {
        responderError(res, err);
    }
});

module.exports = router;