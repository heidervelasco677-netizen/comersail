const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

function generarToken(usuario) {
    return jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );
}

// Registro — siempre crea usuarios con rol "cliente"
router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password, departamento, municipio } = req.body;

        if (!nombre || !email || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({
                mensaje: 'nombre, email y una contraseña de mínimo 6 caracteres son obligatorios'
            });
        }

        const emailNormalizado = email.toLowerCase().trim();

        const usuarioExiste = await Usuario.findOne({ email: emailNormalizado });
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // La contraseña se envía en texto plano: el modelo Usuario la encripta al guardar.
        // (Si se encripta aquí también, queda encriptada dos veces y el login nunca coincide.)
        const nuevoUsuario = new Usuario({
            nombre,
            email: emailNormalizado,
            password,
            departamento,
            municipio,
            rol: 'cliente'
        });

        await nuevoUsuario.save();

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            token: generarToken(nuevoUsuario),
            usuario: { nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || typeof password !== 'string') {
            return res.status(400).json({ mensaje: 'email y password son obligatorios' });
        }

        const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: generarToken(usuario),
            usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;