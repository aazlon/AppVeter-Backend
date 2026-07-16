const veterinaryController = require('../controllers/VeterinaryController');

module.exports = (app) => {
    app.post('/api/veterinary/register', veterinaryController.registerHistory);
    app.get('/api/veterinary/records', veterinaryController.getHistories);
    app.put('/api/veterinary/records/:id', veterinaryController.updateHistory);
    app.delete('/api/veterinary/records/:id', veterinaryController.deleteHistory);
    app.get('/api/veterinary/doctors', veterinaryController.getDoctors);
};
