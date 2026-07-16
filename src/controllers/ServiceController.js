const Service = require('../models/Service');

module.exports = {
    create(req, res) {
        const data = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            image: req.body.image || null,
            user_id: req.body.user_id
        };

        if (!data.titulo || !data.descripcion || !data.user_id) {
            return res.status(400).json({
                success: false,
                message: 'Los campos titulo, descripcion y user_id son requeridos'
            });
        }

        Service.create(data, (err, result) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al crear el servicio',
                    error: err
                });
            }
            return res.status(201).json({
                success: true,
                message: 'Servicio creado correctamente',
                data: result
            });
        });
    },

    createWithImage(req, res) {
        try {
            const files = req.files;
            const data = {
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                image: null,
                user_id: req.body.user_id
            };

            if (!data.titulo || !data.descripcion || !data.user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos titulo, descripcion y user_id son requeridos'
                });
            }

            if (files && files.length > 0) {
                data.image = `http://localhost:3000/uploads/${files[0].filename}`;
            }

            Service.create(data, (err, result) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Error al crear el servicio',
                        error: err
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: 'Servicio creado correctamente',
                    data: result
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general creando servicio',
                error
            });
        }
    },

    getAll(req, res) {
        Service.getAll((err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al obtener los servicios',
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                data
            });
        });
    },

    getById(req, res) {
        const { id } = req.params;
        Service.getById(id, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al obtener el servicio',
                    error: err
                });
            }
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }
            return res.status(200).json({
                success: true,
                data
            });
        });
    },

    update(req, res) {
        const { id } = req.params;
        const data = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            image: req.body.image || null
        };

        if (!data.titulo || !data.descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Los campos titulo y descripcion son requeridos'
            });
        }

        Service.update(id, data, (err, result) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al actualizar el servicio',
                    error: err
                });
            }
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Servicio actualizado correctamente',
                data: result
            });
        });
    },

    updateWithImage(req, res) {
        try {
            const { id } = req.params;
            const files = req.files;
            const data = {
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                image: null
            };

            if (!data.titulo || !data.descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos titulo y descripcion son requeridos'
                });
            }

            if (files && files.length > 0) {
                data.image = `http://localhost:3000/uploads/${files[0].filename}`;
            }

            Service.update(id, data, (err, result) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Error al actualizar el servicio',
                        error: err
                    });
                }
                if (!result) {
                    return res.status(404).json({
                        success: false,
                        message: 'Servicio no encontrado'
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Servicio actualizado correctamente',
                    data: result
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general actualizando servicio',
                error
            });
        }
    },

    delete(req, res) {
        const { id } = req.params;
        Service.delete(id, (err, success) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al eliminar el servicio',
                    error: err
                });
            }
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Servicio eliminado correctamente'
            });
        });
    }
};
