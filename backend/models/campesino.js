// models/Campesino.js — ficha del vendedor, sin cuenta de acceso
const mongoose = require('mongoose');

const campesinoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    documento: { type: String, required: true, unique: true, trim: true },
    telefono: { type: String, trim: true },
    departamento: { type: String, default: 'Huila' },
    municipio: { type: String, default: 'Garzon' },
    productos: [{ type: String, enum: ['cafe', 'cacao'] }],
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campesino', campesinoSchema);
