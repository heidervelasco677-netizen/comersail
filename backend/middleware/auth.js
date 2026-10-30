// middleware/auth.js
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del formato "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Inyecta los datos del usuario decodificados (id, rol)
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
}

module.exports = verificarToken;