function verificarSuperAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'superAdmin') {
        return res.status(403).json({ error: 'Acceso denegado - se requiere rol superAdmin' });
    }
    next();
}

module.exports = verificarSuperAdmin;