const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
console.log('cargadas rutas nuevas de compras:', __filename);

const Compra = require('../models/Compra');
const Usuario = require('../models/Usuario');

const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// valor exacto y total redondeado a la centena más cercana
function calcularValores(peso, precioKG) {
    const valor = peso * precioKG;
    const valorTotal = Math.round(valor / 100) * 100;

    return { valor, valorTotal };
}

function obtenerIdUsuario(req) {
    return req.usuario.id || req.usuario._id;
}

function responderError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID no válido' });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
}

function normalizarProductos(productos) {
    if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error('Debes enviar al menos un producto');
    }

    return productos.map((item, index) => {
        const producto = item.producto;
        const peso = Number(item.peso);
        const precioKG = Number(item.precioKG);

        if (!producto) {
            throw new Error(`El producto ${index + 1} necesita nombre`);
        }

        if (!['cafe', 'cacao'].includes(producto)) {
            throw new Error(`El producto ${index + 1} debe ser cafe o cacao`);
        }

        if (Number.isNaN(peso) || peso <= 0) {
            throw new Error(`El peso del producto ${index + 1} debe ser mayor a 0`);
        }

        if (Number.isNaN(precioKG) || precioKG <= 0) {
            throw new Error(`El precioKG del producto ${index + 1} debe ser mayor a 0`);
        }

        const { valor, valorTotal } = calcularValores(peso, precioKG);

        return {
            producto,
            peso,
            precioKG,
            valor,
            valorTotal
        };
    });
}

async function buscarCliente(clienteId, clienteEmail) {
    let cliente = null;

    if (clienteId) {
        if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            throw new Error('clienteId inválido');
        }

        cliente = await Usuario.findById(clienteId);
    } else if (clienteEmail) {
        cliente = await Usuario.findOne({
            email: clienteEmail.toLowerCase()
        });
    } else {
        throw new Error('Debes enviar clienteId o clienteEmail');
    }

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    if (cliente.rol !== 'cliente') {
        throw new Error('El usuario seleccionado no tiene rol cliente');
    }

    return cliente;
}

// GET todas las compras
// Cliente: solo ve sus compras
// Admin y superadmin: ven todas
router.get('/', verificarToken, async (req, res) => {
    try {
        const usuarioId = obtenerIdUsuario(req);

        const filtro =
            req.usuario.rol === 'cliente'
                ? { cliente: usuarioId }
                : {};

        const compras = await Compra.find(filtro)
            .populate('cliente', 'nombre email rol')
            .populate('creadoPor', 'nombre email rol')
            .sort({ createdAt: -1 });

        res.json({
            total: compras.length,
            compras
        });
    } catch (err) {
        responderError(res, err);
    }
});

// GET una compra por ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = obtenerIdUsuario(req);

        const compra = await Compra.findById(req.params.id)
            .populate('cliente', 'nombre email rol')
            .populate('creadoPor', 'nombre email rol');

        if (!compra) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        if (
            req.usuario.rol === 'cliente' &&
            compra.cliente._id.toString() !== usuarioId.toString()
        ) {
            return res.status(403).json({
                error: 'No puedes ver compras de otro cliente'
            });
        }

        res.json(compra);
    } catch (err) {
        responderError(res, err);
    }
});

// POST registrar una compra
// Solo admin y superadmin
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    console.log('Entro a la ruta nueva de compras');
    console.log(req.body);
    
    try {
        const {
            clienteId,
            clienteEmail,
            productos,
            estado,
            observaciones,
            fecha,
            hora
        } = req.body;

        const cliente = await buscarCliente(clienteId, clienteEmail);
        const productosNormalizados = normalizarProductos(productos);

        const valor = productosNormalizados.reduce((sum, item) => {
            return sum + item.valor;
        }, 0);

        const valorTotal = Math.round(valor / 100) * 100;

        const nuevaCompra = new Compra({
            cliente: cliente._id,
            creadoPor: obtenerIdUsuario(req),
            productos: productosNormalizados,
            valor,
            valorTotal,
            estado: estado || 'pagada',
            observaciones: observaciones || '',
            fecha: fecha ? new Date(fecha) : new Date(),
            hora
        });

        const compraGuardada = await nuevaCompra.save();

        const compraCompleta = await Compra.findById(compraGuardada._id)
            .populate('cliente', 'nombre email rol')
            .populate('creadoPor', 'nombre email rol');

        res.status(201).json({
            mensaje: 'Guardada exitosamente',
            data: compraCompleta
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

// PUT actualizar una compra
// Solo admin y superadmin
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const compra = await Compra.findById(req.params.id);

        if (!compra) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        const {
            clienteId,
            clienteEmail,
            productos,
            estado,
            observaciones,
            fecha,
            hora
        } = req.body;

        if (clienteId || clienteEmail) {
            const cliente = await buscarCliente(clienteId, clienteEmail);
            compra.cliente = cliente._id;
        }

        if (productos) {
            const productosNormalizados = normalizarProductos(productos);

            const valor = productosNormalizados.reduce((sum, item) => {
                return sum + item.valor;
            }, 0);

            const valorTotal = Math.round(valor / 100) * 100;

            compra.productos = productosNormalizados;
            compra.valor = valor;
            compra.valorTotal = valorTotal;
        }

        if (estado !== undefined) {
            compra.estado = estado;
        }

        if (observaciones !== undefined) {
            compra.observaciones = observaciones;
        }

        if (fecha !== undefined) {
            compra.fecha = new Date(fecha);
        }

        if (hora !== undefined) {
            compra.hora = hora;
        }

        const compraActualizada = await compra.save();

        await compraActualizada.populate('cliente', 'nombre email rol');
        await compraActualizada.populate('creadoPor', 'nombre email rol');

        res.json({
            mensaje: 'Actualizada exitosamente',
            data: compraActualizada
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

// DELETE eliminar una compra
// Solo admin y superadmin
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const compraEliminada = await Compra.findByIdAndDelete(req.params.id);

        if (!compraEliminada) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        res.json({
            mensaje: 'Eliminada correctamente',
            data: compraEliminada
        });
    } catch (err) {
        responderError(res, err);
    }
});

module.exports = router;