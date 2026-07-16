const serviceController = require('../controllers/ServiceController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'service_' + Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

module.exports = (app) => {
    app.post('/api/services', serviceController.create);
    app.post('/api/services/with-image', upload.array('image', 1), serviceController.createWithImage);
    app.get('/api/services', serviceController.getAll);
    app.get('/api/services/:id', serviceController.getById);
    app.put('/api/services/:id', serviceController.update);
    app.put('/api/services/:id/with-image', upload.array('image', 1), serviceController.updateWithImage);
    app.delete('/api/services/:id', serviceController.delete);
};
