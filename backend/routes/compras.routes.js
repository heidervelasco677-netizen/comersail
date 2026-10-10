const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');

// obtener todas las compras (GET)
router.get('/', async (req, res) => {
    try {
        const compra = await Compra.find();
        res.json(Compra);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
    }
});

// obtener una compra por ID (GET)
router.get('/:id', async (req, res) => {
    try {
       const compra = await Compra.findById(req.params.id);
       if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
       res.json(compra); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: registrar una nueva compra
router.post('/', async (req, res) => {
    try {
        const nuevaCompra = new Compra(req.body);
        const compraGuardada = await nuevaCompra.save();
        res.status(201).json(compraGuardada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT: Actualizar una compra existente por ID
router.put('/:id', async (req, res) => {
    try {
        const compraActualizada = await Compra.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!compraActualizada) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json(compraActualizada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: eliminar una compra por ID
router.delete('/:id', async (req, res) => {
    try {
        const compraEliminada = await Compra.findByIdAndDelete(req.params.id);
        if (!compraEliminada) return res.status(404).json({ error: 'Compra no encontrada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;