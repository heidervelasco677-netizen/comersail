const mongoose = require('mongoose');

const productoCompraSchema = new mongoose.Schema(
    {
        producto: {
            type: String,
            required: [true, 'El producto es obligatorio'],
            enum: ['cafe', 'cacao']
        },
        peso: {
            type: Number,
            required: [true, 'El peso es obligatorio'],
            min: [0, 'El peso no puede ser negativo']
        },
        precioKG: {
            type: Number,
            required: [true, 'El precio por KG es obligatorio'],
            min: [0, 'El precio no puede ser negativo']
        },
        valor: {
            type: Number,
            default: 0
        },
        valorTotal: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const compraSchema = new mongoose.Schema(
    {
        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: [true, 'El cliente es obligatorio']
        },

        creadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: [true, 'El usuario creador es obligatorio']
        },

        productos: {
            type: [productoCompraSchema],
            required: true,
            validate: {
                validator: function (productos) {
                    return productos.length > 0;
                },
                message: 'Debe agregar al menos un producto'
            }
        },

        valor: {
            type: Number,
            default: 0
        },

        valorTotal: {
            type: Number,
            default: 0
        },

        fecha: {
            type: Date,
            default: Date.now
        },

        hora: {
            type: String
        },

        estado: {
            type: String,
            enum: ['pendiente', 'pagada', 'cancelada'],
            default: 'pagada'
        },

        observaciones: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Compra', compraSchema);