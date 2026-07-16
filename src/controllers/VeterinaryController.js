const Veterinary = require('../models/Veterinary');

module.exports = {

    getDoctors(req, res) {
        Veterinary.getAllDoctors((err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error al obtener la lista de doctores',
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                data: data
            });
        });
    },

    registerHistory(req, res) {
        const historyData = req.body;
        
        // Validar datos mínimos obligatorios
        if (!historyData.client || !historyData.client.nombre_propietario || !historyData.client.ci || !historyData.client.telefono) {
            return res.status(400).json({
                success: false,
                message: 'Los datos del cliente (nombre, C.I., teléfono) son requeridos'
            });
        }
        if (!historyData.pet || !historyData.pet.nombre_mascota || !historyData.pet.especie || !historyData.pet.raza) {
            return res.status(400).json({
                success: false,
                message: 'Los datos de la mascota (nombre, especie, raza) son requeridos'
            });
        }

        Veterinary.create(historyData, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error al registrar la historia clínica',
                    error: err
                });
            }
            return res.status(201).json({
                success: true,
                message: 'La historia clínica se registró correctamente',
                data: data
            });
        });
    },

    getHistories(req, res) {
        const filters = {
            search: req.query.search || '',
            especie: req.query.especie || '',
            doctor_nombre: req.query.doctor_nombre || '',
            fecha_inicio: req.query.fecha_inicio || '',
            fecha_fin: req.query.fecha_fin || ''
        };

        Veterinary.getAll(filters, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error al consultar las historias clínicas',
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                data: data
            });
        });
    },

    updateHistory(req, res) {
        const mascotaId = req.params.id;
        const historyData = req.body;

        if (!mascotaId) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la mascota es necesario para actualizar'
            });
        }

        Veterinary.update(mascotaId, historyData, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error al actualizar la historia clínica',
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                message: 'La historia clínica se modificó exitosamente',
                data: data
            });
        });
    },

    deleteHistory(req, res) {
        const mascotaId = req.params.id;

        if (!mascotaId) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la mascota es requerido para eliminar'
            });
        }

        Veterinary.delete(mascotaId, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error al eliminar el registro',
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                message: 'El registro se eliminó exitosamente',
                data: data
            });
        });
    }
};
