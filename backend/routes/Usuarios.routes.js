// routes/Usuarios.routes.js — completo
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

const verificarToken = require('../middleware/usuario');
const verificarSuperAdmin = require('../middleware/superAdmin');

const ROLES = ['usuario', 'admin', 'superAdmin'];

// GET — listar cuentas (quien revisa quién tiene acceso)
router.get('/', verificarToken, verificarSuperAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/rol — cambiar rol de una cuenta
router.put('/:id/rol', verificarToken, verificarSuperAdmin, async (req, res) => {
  try {
    const { rol } = req.body;

    if (!ROLES.includes(rol)) {
      return res.status(400).json({ error: 'El rol debe ser usuario, admin o superAdmin' });
    }
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
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id/estado — bloquear o desbloquear
router.put('/:id/estado', verificarToken, verificarSuperAdmin, async (req, res) => {
  try {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'activo debe ser true o false' });
    }
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes bloquear tu propia cuenta' });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true }
    ).select('-password');

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({
      mensaje: activo ? 'Cuenta desbloqueada' : 'Cuenta bloqueada',
      data: usuario,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — eliminar cuenta
router.delete('/:id', verificarToken, verificarSuperAdmin, async (req, res) => {
  try {
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;