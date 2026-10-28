const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioShema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    departamento: { type: String, default: 'Huila' },
    municipio: { type: String, default: 'Garzon' },
    rol: { type: String, enum: ['cliente', 'admin', 'superAdmin'], default: 'cliente' },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

// Encripta la contraseña antes de guardar.
// Este es el ÚNICO lugar donde se encripta: las rutas deben pasar la contraseña en texto plano.
usuarioShema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Nunca devuelve la contraseña en las respuestas JSON
usuarioShema.methods.toJSON = function () {
    const usuario = this.toObject();
    delete usuario.password;
    return usuario;
};

module.exports = mongoose.model('Usuario', usuarioShema);