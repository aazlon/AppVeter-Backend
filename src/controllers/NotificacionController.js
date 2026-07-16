const Notificacion = require('../models/Notificacion');

const NotificacionController = {};

NotificacionController.createNotificacion = async (req, res) => {
    try {
        const notificacion = req.body;
        
        Notificacion.create(notificacion, (err, notifId) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear la notificación',
                    error: err
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Notificación creada exitosamente',
                data: { id: notifId }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

NotificacionController.getNotificacionesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        Notificacion.getByUserId(userId, (err, notificaciones) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener las notificaciones',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                data: notificaciones
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

NotificacionController.markNotificacionAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        Notificacion.markAsRead(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al marcar la notificación como leída',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Notificación marcada como leída'
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

NotificacionController.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        
        Notificacion.markAllAsRead(userId, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al marcar todas las notificaciones como leídas',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Todas las notificaciones marcadas como leídas'
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

NotificacionController.deleteNotificacion = async (req, res) => {
    try {
        const { id } = req.params;

        Notificacion.delete(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la notificación',
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Notificación no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Notificación eliminada exitosamente'
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

NotificacionController.getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        Notificacion.getUnreadCount(userId, (err, count) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener el contador de notificaciones no leídas',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                data: { count: count }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

module.exports = NotificacionController;
