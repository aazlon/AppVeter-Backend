const novedadController = require('../controllers/NovedadController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'novedad_' + Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

module.exports = (app) => {
    app.post('/api/novedades', novedadController.create);
    app.post('/api/novedades/with-image', upload.array('image', 1), novedadController.createWithImage);
    app.get('/api/novedades', novedadController.getAll);
    app.get('/api/novedades/:id', novedadController.getById);
    app.put('/api/novedades/:id', novedadController.update);
    app.put('/api/novedades/:id/with-image', upload.array('image', 1), novedadController.updateWithImage);
    app.delete('/api/novedades/:id', novedadController.delete);
};
