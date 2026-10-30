// middleware/usuario.js — deja pasar a usuario, admin y superAdmin
const rolesPermitidos = ['cliente', 'usuario', 'admin', 'superAdmin'];

function verificarUsuario(req, res, next) {
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado - se requiere una cuenta de la app' });
  }
  next();
}

module.exports = verificarUsuario;
