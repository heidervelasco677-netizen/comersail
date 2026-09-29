const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');

// obtener todas las compras (GET)
router.get('/', async (req, res) => {
    try {
        const compra = await Compra.findById();
        res.json(compras);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
    }
});

// obtener una compra por ID (GET)
router.get('/:id', async)