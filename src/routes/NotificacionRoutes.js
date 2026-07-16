const notificacionController = require('../controllers/NotificacionController');

module.exports = (app) => {
    app.post('/api/notificaciones/create', notificacionController.createNotificacion);
    app.get('/api/notificaciones/user/:userId', notificacionController.getNotificacionesByUserId);
    app.put('/api/notificaciones/:id/read', notificacionController.markNotificacionAsRead);
    app.put('/api/notificaciones/user/:userId/read-all', notificacionController.markAllAsRead);
    app.get('/api/notificaciones/user/:userId/unread-count', notificacionController.getUnreadCount);
    app.delete('/api/notificaciones/:id', notificacionController.deleteNotificacion);
};
