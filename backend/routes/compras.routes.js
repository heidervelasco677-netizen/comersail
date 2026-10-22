const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');
const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// valor exacto y total redondeado a la centena más cercana
function calcularValores(peso, precioKG) {
    const valor = peso * precioKG;
    const valorTotal = Math.round(valor / 100) * 100;
    return { valor, valorTotal };
}

function responderError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID no válido' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
}

// GET todas las compras — con token
router.get('/', verificarToken, async (req, res) => {
    try {
        const compras = await Compra.find().sort({ createdAt: -1 });
        res.json(compras);
    } catch (err) {
        responderError(res, err);
    }
});

// GET una compra por ID — con token
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const compra = await Compra.findById(req.params.id);
        if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json(compra);
    } catch (err) {
        responderError(res, err);
    }
});

// POST registrar una compra — admin
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { cliente, producto, peso, precioKG } = req.body;

        if (!(peso > 0) || !(precioKG > 0)) {
            return res.status(400).json({ error: 'peso y precioKG deben ser números mayores a 0' });
        }

        const nuevaCompra = new Compra({
            cliente,
            producto,
            peso,
            precioKG,
            ...calcularValores(peso, precioKG),
            creadoPor: req.usuario.id
        });

        const compraGuardada = await nuevaCompra.save();
        res.status(201).json({ mensaje: 'Guardada exitosamente', data: compraGuardada });
    } catch (err) {
        responderError(res, err);
    }
});

// PUT actualizar una compra — admin
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const compra = await Compra.findById(req.params.id);
        if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

        // Solo se pueden cambiar estos campos; valor y valorTotal siempre se recalculan
        const { cliente, producto, peso, precioKG } = req.body;
        if (cliente !== undefined)  compra.cliente = cliente;
        if (producto !== undefined) compra.producto = producto;
        if (peso !== undefined)     compra.peso = peso;
        if (precioKG !== undefined) compra.precioKG = precioKG;

        const { valor, valorTotal } = calcularValores(compra.peso, compra.precioKG);
        compra.valor = valor;
        compra.valorTotal = valorTotal;

        const compraActualizada = await compra.save();
        res.json({ mensaje: 'Actualizada exitosamente', data: compraActualizada });
    } catch (err) {
        responderError(res, err);
    }
});

// DELETE eliminar una compra — admin
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const compraEliminada = await Compra.findByIdAndDelete(req.params.id);
        if (!compraEliminada) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json({ mensaje: 'Eliminada correctamente' });
    } catch (err) {
        responderError(res, err);
    }
});

module.exports = router;