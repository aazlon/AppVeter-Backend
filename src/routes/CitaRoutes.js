const citaController = require('../controllers/CitaController');

module.exports = (app) => {
    app.post('/api/citas/create', citaController.createCita);
    app.get('/api/citas/all', citaController.getAllCitas);
    app.get('/api/citas/pending', citaController.getAllPending);
    app.get('/api/citas/:id', citaController.getCitaById);
    app.put('/api/citas/:id/status', citaController.updateCitaStatus);
    app.put('/api/citas/:id/date', citaController.updateCitaDate);
    app.get('/api/citas/user/:userId', citaController.getCitasByUserId);
};
