const Novedad = require('../models/Novedad');

module.exports = {
    create(req, res) {
        const data = {
            descripcion: req.body.descripcion,
            image: req.body.image || null,
            user_id: req.body.user_id
        };

        if (!data.descripcion || !data.user_id) {
            return res.status(400).json({
                success: false,
                message: 'Los campos descripcion y user_id son requeridos'
            });
        }

        Novedad.create(data, (err, result) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al crear la novedad',
                    error: err
                });
            }
            return res.status(201).json({
                success: true,
                message: 'Novedad creada correctamente',
                data: result
            });
        });
    },

    createWithImage(req, res) {
        try {
            const files = req.files;
            const data = {
                descripcion: req.body.descripcion,
                image: null,
                user_id: req.body.user_id
            };

            if (!data.descripcion || !data.user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos descripcion y user_id son requeridos'
                });
            }

            if (files && files.length > 0) {
                data.image = `http://localhost:3000/uploads/${files[0].filename}`;
            }

            Novedad.create(data, (err, result) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Error al crear la novedad',
                        error: err
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: 'Novedad creada correctamente',
                    data: result
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general creando novedad',
                error
            });
        }
    },

    getAll(req, res) {
        Novedad.getAll((err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al obtener las novedades',
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
        Novedad.getById(id, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al obtener la novedad',
                    error: err
                });
            }
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Novedad no encontrada'
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
            descripcion: req.body.descripcion,
            image: req.body.image || null
        };

        if (!data.descripcion) {
            return res.status(400).json({
                success: false,
                message: 'El campo descripcion es requerido'
            });
        }

        Novedad.update(id, data, (err, result) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al actualizar la novedad',
                    error: err
                });
            }
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Novedad no encontrada'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Novedad actualizada correctamente',
                data: result
            });
        });
    },

    updateWithImage(req, res) {
        try {
            const { id } = req.params;
            const files = req.files;
            const data = {
                descripcion: req.body.descripcion,
                image: null
            };

            if (!data.descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo descripcion es requerido'
                });
            }

            if (files && files.length > 0) {
                data.image = `http://localhost:3000/uploads/${files[0].filename}`;
            }

            Novedad.update(id, data, (err, result) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Error al actualizar la novedad',
                        error: err
                    });
                }
                if (!result) {
                    return res.status(404).json({
                        success: false,
                        message: 'Novedad no encontrada'
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Novedad actualizada correctamente',
                    data: result
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general actualizando novedad',
                error
            });
        }
    },

    delete(req, res) {
        const { id } = req.params;
        Novedad.delete(id, (err, success) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Error al eliminar la novedad',
                    error: err
                });
            }
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Novedad no encontrada'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Novedad eliminada correctamente'
            });
        });
    }
};
