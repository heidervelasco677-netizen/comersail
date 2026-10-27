const mongoose =require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioShema = new mongoose.Schema({
    nombre: { type: String, required: true, trim:true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true},
    password: { type: String, required: true, },
    departamento: { type: String, default: 'Huila' },
    municipio: { type: String, default: 'Garzon' },
    rol: { type: String, enum: ['cliente', 'admin', 'superAdmin'], default: 'cliente' },
    activo: {type: Boolean, default: true}
}, { timestamps: true });

// enceriptar contraseña antes de guardar
usuarioShema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

// comparar contraseña
usuarioShema.methods.toJSON = function () {
    const usuario = this.toObject();
    delete usuario.password;
    return usuario;
};

module.exports = mongoose.model('Usuario', usuarioShema);