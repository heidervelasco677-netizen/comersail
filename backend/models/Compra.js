const mongoose = require('mongoose');

// Schema
const productoSchema = new mongoose.Schema({
  cliente: {
    type: String,
    required: [true, 'Cliente']
  },
  producto: {
    type: String,
    required: [true, 'Producto'],
    enum: ['cafe', 'cacao']
  },
  peso: {
    type: Number,
    required: [true, 'Cantidad']
  },
  precioKG: {
    type: Number,
    required: [true, 'Precio por KG']
  },
  valor: {
    type: Number,
    required: true
  },
  valorTotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true // Se coloca como segundo argumento del esquema
});

// Exportación del modelo
module.exports = mongoose.model('compra', productoSchema);