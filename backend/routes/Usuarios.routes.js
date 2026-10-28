const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');
const verificarSuperAdmin = require('../middleware/superAdmin');

const ROLES = ['cliente', 'admin', 'superAdmin'];

function responderError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID no válido' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
}

// GET /api/usuarios — listar usuarios (admin y superAdmin), sin contraseñas
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

// PUT /api/usuarios/:id/rol — cambiar el rol de un usuario (SOLO superAdmin)
router.put('/:id/rol', verificarToken, verificarSuperAdmin, async (req, res) => {
    try {
        const { rol } = req.body;

        if (!ROLES.includes(rol)) {
            return res.status(400).json({ error: 'El rol debe ser cliente, admin o superAdmin' });
        }

        // Nadie cambia su propio rol: así el sistema nunca se queda sin superAdmin
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
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

// DELETE /api/usuarios/:id - eliminar un usuario (solo superAdmin)
router.delete('/:id', verificarToken, verificarSuperAdmin, async (req, res) => {
    try {
        if (req.params.id === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (err) {
        responderError(res, err);
    }
});

module.exports = router;