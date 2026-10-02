require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Compra = require('./models/Compra');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta get /api/productos
app.get('/api/productos', (req, res) => {
    const productos = require('../frontend/data/productos.json');
    res.json(productos);
});


// Conexion a mongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log( 'Conectado exitosamente a MongoDB Atlas'))
.catch((err) => console.error(' Error al conectar a MongoDB:', err));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de CÒMERSAIL funcionando ');
});

// ================================
// RUTAS DE LA API CON MONGOOSE
// ================================

// Importar en integrar rutas de autenticacion
const authRoutes = require('./routes/auth.Routes');
app.use('/api/auth', authRoutes);

// 1 obtener todas las compras
app.get('/api/compras', async (req, res) => {
    try {
        const compras = await Compra.find();
        res.json(compras);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
    }
});

// 2 registrar una nueva compra 
app.post('/api/compras', async (req, res) => {
    try {
        const { cliente, producto, peso, precioKG } = req.body;

        // calcular el valor exacto y el total redondeado
        const valorExacto = peso * precioKG;
        const totalRedondeado = Math.round(valorExacto / 100) * 100;

        const nuevaCompra = new Compra({
            cliente,
            producto,
            peso,
            precioKG,
            valor: valorExacto,
            valorTotal: totalRedondeado
        });

        const compraGuardada = await nuevaCompra.save();
        res.status(201).json({ mensaje: 'Guardada exitosamente', data: compraGuardada });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error', error: error.message });
    }
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});