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
const comprasRoutes = require('./routes/compras.routes');
app.use('/api/auth', authRoutes);

app.use('/api/compras', comprasRoutes);


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});