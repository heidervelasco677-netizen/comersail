const rolesPermitidos = ['admin', 'superAdmin']

function verificarAdmin(req, res, next) {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
            error: 'Acceso denegado - se requiere rol admin'
        });
    }
    next();
}

module.exports = verificarAdmin;