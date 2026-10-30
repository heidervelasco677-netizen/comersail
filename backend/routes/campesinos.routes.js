// POST /api/campesinos - Registra los datos del campesino sin crear usuario ni login
router.post('/campesinos', verificarToken, async (req, res) => {
    try {
        const { documento, nombre, telefono, municipio } = req.body;

        let campesino = await Campesino.findOne({ documento });
        if (campesino) {
            return res.status(400).json({ mensaje: 'El campesino ya está registrado' });
        }

        campesino = new campesino({
            documento,
            nombre,
            telefono,
            municipio
        });

        await campesino.save();
        res.status(201).json({ mensaje: 'Campesino registrado con éxito', campesino });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});