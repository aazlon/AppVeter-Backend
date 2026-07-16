const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos para servir las imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const usersRoutes = require('./src/routes/UserRoutes');
const veterinaryRoutes = require('./src/routes/VeterinaryRoutes');
const citaRoutes = require('./src/routes/CitaRoutes');
const notificacionRoutes = require('./src/routes/NotificacionRoutes');
const serviceRoutes = require('./src/routes/ServiceRoutes');

app.get('/', (req, res) => {
    res.send('¡Proyecto Node.js iniciado con éxito!');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// llamado de las rutas
usersRoutes(app);
veterinaryRoutes(app);
citaRoutes(app);
notificacionRoutes(app);
serviceRoutes(app);

module.exports = {
    app: app
}