// routes/compras.routes.js — crear una compra al campesino
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Compra = require('../models/Compra');
const Campesino = require('../models/campesino');
const verificarToken = require('../middleware/auth');
const verificarUsuario = require('../middleware/usuario'); // usuario, admin o superAdmin

// Busca al campesino por id/documento; si no existe por documento, lo crea automáticamente
async function buscarOCrearCampesino(campesinoId, campesinoDocumento, campesinoNombre, municipio, telefono) {
  let campesino = null;

  if (campesinoId) {
    if (!mongoose.Types.ObjectId.isValid(campesinoId)) {
      throw new Error("campesinoId inválido");
    }
    campesino = await Campesino.findById(campesinoId);
  } else if (campesinoDocumento) {
    const docLimpio = String(campesinoDocumento).trim();
    campesino = await Campesino.findOne({ documento: docLimpio });

    // Si no existe, lo crea automáticamente sin requerir login/usuario
    if (!campesino) {
      campesino = new Campesino({
        documento: docLimpio,
        nombre: campesinoNombre || `Campesino (${docLimpio})`,
        telefono: telefono || '',
        municipio: municipio || 'Garzón'
      });
      await campesino.save();
    }
  } else {
    throw new Error("Debes enviar campesinoId o campesinoDocumento");
  }

  if (campesino.activo === false) throw new Error("El campesino está inactivo");
  return campesino;
}

function normalizarProductos(productos) {
  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error('Debes enviar al menos un producto');
  }

  return productos.map((item, index) => {
    const producto = item.producto;
    const pesoKg = Number(item.pesoKg);
    const precioKg = Number(item.precioKg);

    if (!['cafe', 'cacao'].includes(producto)) {
      throw new Error(`El producto ${index + 1} debe ser cafe o cacao`);
    }
    if (Number.isNaN(pesoKg) || pesoKg <= 0) {
      throw new Error(`El peso del producto ${index + 1} debe ser mayor a 0`);
    }
    if (Number.isNaN(precioKg) || precioKg <= 0) {
      throw new Error(`El precio/kg del producto ${index + 1} debe ser mayor a 0`);
    }

    return { producto, pesoKg, precioKg, valor: Math.round(pesoKg * precioKg) };
  });
}

// POST: el usuario de caja registra la compra al campesino
router.post('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const { 
      campesinoId, 
      campesinoDocumento, 
      campesinoNombre, 
      municipio, 
      telefono, 
      productos, 
      estado, 
      medioPago, 
      observaciones, 
      fecha, 
      hora 
    } = req.body;

    const campesino = await buscarOCrearCampesino(campesinoId, campesinoDocumento, campesinoNombre, municipio, telefono);
    const normalizados = normalizarProductos(productos);
    const valor = normalizados.reduce((sum, p) => sum + p.valor, 0);

    const compra = await Compra.create({
      campesino: campesino._id,
      registradoPor: req.usuario.id || req.usuario._id,
      productos: normalizados,
      valor,
      valorTotal: Math.round(valor / 100) * 100,
      estado: estado || 'pendiente',
      medioPago: medioPago || 'efectivo',
      observaciones: observaciones || '',
      fecha: fecha ? new Date(fecha) : new Date(),
      hora,
    });

    const completa = await Compra.findById(compra._id)
      .populate('campesino', 'nombre documento telefono municipio')
      .populate('registradoPor', 'nombre email rol');

    res.status(201).json({ mensaje: 'Compra registrada exitosamente', data: completa });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: usuario ve las que registró; admin y superAdmin ven todas
router.get('/', verificarToken, async (req, res) => {
  try {
    const filtro =
      req.usuario.rol === 'usuario' ? { registradoPor: req.usuario.id || req.usuario._id } : {};

    const compras = await Compra.find(filtro)
      .populate('campesino', 'nombre documento telefono municipio')
      .populate('registradoPor', 'nombre email rol')
      .sort({ fecha: -1 });

    res.json({ total: compras.length, compras });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: marcar pagada o corregir datos (usuario, admin y superAdmin)
router.put('/:id', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

    const { 
      campesinoId, 
      campesinoDocumento, 
      campesinoNombre, 
      productos, 
      estado, 
      medioPago, 
      observaciones, 
      fecha, 
      hora 
    } = req.body;

    if (campesinoId || campesinoDocumento) {
      const campesino = await buscarOCrearCampesino(campesinoId, campesinoDocumento, campesinoNombre);
      compra.campesino = campesino._id;
    }
    if (productos) compra.productos = normalizarProductos(productos);
    if (estado !== undefined) compra.estado = estado;
    if (medioPago !== undefined) compra.medioPago = medioPago;
    if (observaciones !== undefined) compra.observaciones = observaciones;
    if (fecha !== undefined) compra.fecha = new Date(fecha);
    if (hora !== undefined) compra.hora = hora;

    await compra.save(); // recalcula valor y valorTotal
    res.json({ mensaje: 'Actualizada exitosamente', data: compra });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;