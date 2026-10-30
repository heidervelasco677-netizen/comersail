// models/Compra.js — versión acorde a tu negocio
const mongoose = require('mongoose');

const productoCompraSchema = new mongoose.Schema(
  {
    producto: { type: String, required: true, enum: ['cafe', 'cacao'] },
    pesoKg: { type: Number, required: true, min: [0.01, 'El peso debe ser mayor a 0'] },
    precioKg: { type: Number, required: true, min: [1, 'El precio debe ser mayor a 0'] },
    valor: { type: Number, default: 0 },
  },
  { _id: false }
);

const compraSchema = new mongoose.Schema(
  {
    // Quien VENDE: el campesino (ficha, sin cuenta de usuario)
    campesino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campesino',
      required: [true, 'El campesino es obligatorio'],
    },
    // Quien REGISTRA: el usuario de bodega y caja
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario que registra es obligatorio'],
    },
    productos: {
      type: [productoCompraSchema],
      required: true,
      validate: {
        validator: (p) => p.length > 0,
        message: 'Debe agregar al menos un producto',
      },
    },
    valor: { type: Number, default: 0 },
    valorTotal: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'pagada', 'cancelada'],
      default: 'pendiente',
    },
    medioPago: { type: String, enum: ['efectivo', 'transferencia'], default: 'efectivo' },
    observaciones: { type: String, default: '' },
    fecha: { type: Date, default: Date.now },
    hora: { type: String },
  },
  { timestamps: true }
);

// Totales calculados por el servidor, nunca por el cliente
compraSchema.pre('validate', function () {
  this.productos.forEach((p) => {
    p.valor = Math.round(p.pesoKg * p.precioKg);
  });
  this.valor = this.productos.reduce((sum, p) => sum + p.valor, 0);
  this.valorTotal = Math.round(this.valor / 100) * 100;
});

module.exports = mongoose.model('Compra', compraSchema);