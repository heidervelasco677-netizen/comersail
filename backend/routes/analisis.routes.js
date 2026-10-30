const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');
const verificarToken = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// GET /api/analisis?desde=2026-01-01&hasta=2026-12-31&campesinoId=...
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { desde, hasta, campesinoId } = req.query;

    const filtro = { estado: { $ne: 'cancelada' } };
    if (desde || hasta) filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde);
    if (hasta) filtro.fecha.$lte = new Date(hasta);
    if (campesinoId) filtro.campesino = campesinoId;

    const porDia = await Compra.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          pesosKg: { $sum: { $sum: '$productos.pesoKg' } },
          dinero: { $sum: '$valorTotal' },
          compras: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const porMes = await Compra.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          pesosKg: { $sum: { $sum: '$productos.pesoKg' } },
          dinero: { $sum: '$valorTotal' },
          compras: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const porAnio = await Compra.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: { $dateToString: { format: '%Y', date: '$fecha' } },
          pesosKg: { $sum: { $sum: '$productos.pesoKg' } },
          dinero: { $sum: '$valorTotal' },
          compras: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const porProducto = await Compra.aggregate([
      { $match: filtro },
      { $unwind: '$productos' },
      {
        $group: {
          _id: '$productos.producto',
          pesosKg: { $sum: '$productos.pesoKg' },
          dinero: { $sum: '$productos.valor' },
        },
      },
      { $sort: { pesosKg: -1 } },
    ]);

    res.json({
      filtros: { desde: desde || null, hasta: hasta || null, campesinoId: campesinoId || null },
      porDia,
      porMes,
      porAnio,
      porProducto,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;