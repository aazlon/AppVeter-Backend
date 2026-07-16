const usersController = require('../controllers/UsersController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Asegurarse de que el directorio de subidas exista
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer para guardar en disco
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, 'image_' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

module.exports = (app) => {
    app.post('/api/users/register', usersController.register);
    app.post('/api/users/register_with_image', upload.array('image', 1), usersController.registerWithImage);
    app.post('/api/users/login', usersController.login);
    app.post('/api/users/forgot-password', usersController.forgotPassword);
    app.post('/api/users/verify-reset-code', usersController.verifyResetCode);
    app.post('/api/users/reset-password', usersController.resetPassword);
    app.get('/api/users/receptionists', usersController.getReceptionists);
    app.get('/api/users/veterinarians', usersController.getVeterinarians);
    app.get('/api/users/:id', usersController.getProfile);
    app.post('/api/users/register-receptionist', upload.array('image', 1), usersController.registerReceptionist);
    app.post('/api/users/register-veterinarian', upload.array('image', 1), usersController.registerVeterinarian);
    app.delete('/api/users/:id', usersController.deleteUser);

}   