const Cita = require('../models/Cita');
const Notificacion = require('../models/Notificacion');

const CitaController = {};

function formatDateStr(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
}

CitaController.createCita = async (req, res) => {
    try {
        const cita = req.body;
        const db = require('../config/Config');
        
        Cita.create(cita, (err, citaId) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear la cita',
                    error: err
                });
            }

            // Notificar a todos los recepcionistas sobre la nueva solicitud
            const nombreUsuario = cita.nombre_propietario || 'Un cliente';
            const titulo = 'Nueva Solicitud de Cita';
            const mensaje = `El usuario ${nombreUsuario} te ha enviado una nueva solicitud de cita veterinaria`;

            db.query(
                `SELECT U.id, U.name, U.lastname FROM users AS U INNER JOIN user_has_roles AS UHR ON UHR.id_user = U.id INNER JOIN roles AS R ON UHR.id_rol = R.id WHERE R.name = 'RECEPCIONISTA'`,
                (errRole, recepcionistas) => {
                    if (errRole) {
                        console.error('Error al buscar recepcionistas:', errRole);
                    } else if (recepcionistas && recepcionistas.length > 0) {
                        recepcionistas.forEach(rec => {
                            Notificacion.create({
                                user_id: rec.id,
                                titulo: titulo,
                                mensaje: mensaje,
                                tipo: 'CITA',
                                cita_id: citaId
                            }, (errNotif) => {
                                if (errNotif) console.error('Error al notificar recepcionista:', errNotif);
                            });
                        });
                    } else {
                        // Depuración: mostrar todos los roles existentes
                        db.query(`SELECT * FROM user_has_roles`, (errD, rows) => {
                            if (!errD) console.log('DEBUG - user_has_roles:', JSON.stringify(rows));
                        });
                        db.query(`SELECT * FROM roles`, (errD, rows) => {
                            if (!errD) console.log('DEBUG - roles:', JSON.stringify(rows));
                        });
                    }
                }
            );
            
            res.status(201).json({
                success: true,
                message: 'Cita creada exitosamente',
                data: { id: citaId }
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

CitaController.getAllCitas = async (req, res) => {
    try {
        Cita.getAll((err, citas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener las citas',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                data: citas
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

CitaController.getCitaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        Cita.getById(id, (err, cita) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener la cita',
                    error: err
                });
            }
            
            if (!cita) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }
            
            res.status(200).json({
                success: true,
                data: cita
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

CitaController.updateCitaStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, fecha_cita } = req.body;
        
        if (!['APROBADA', 'RECHAZADA'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido. Debe ser APROBADA o RECHAZADA'
            });
        }
        
        if (estado === 'APROBADA' && !fecha_cita) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una fecha para la cita'
            });
        }
        
        // Primero obtener la cita para tener los datos del usuario
        Cita.getById(id, async (err, cita) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener la cita',
                    error: err
                });
            }
            
            if (!cita) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }
            
            // Actualizar el estado de la cita
            Cita.updateStatus(id, estado, fecha_cita, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error al actualizar la cita',
                        error: err
                    });
                }
                
                // Crear notificación para el cliente
                const titulo = estado === 'APROBADA' ? 'Cita Aprobada' : 'Cita Rechazada';
                const fechaFormateada = formatDateStr(fecha_cita);
                const mensaje = estado === 'APROBADA' 
                    ? `Tu solicitud de cita veterinaria ha sido aprobada para el día ${fechaFormateada}`
                    : `Tu solicitud de cita veterinaria ha sido rechazada`;
                
                const notificacion = {
                    user_id: cita.user_id,
                    titulo: titulo,
                    mensaje: mensaje,
                    tipo: 'CITA',
                    cita_id: cita.id
                };
                
                Notificacion.create(notificacion, (err, notifId) => {
                    if (err) {
                        console.error('Error al crear notificación:', err);
                    }
                });
                
                res.status(200).json({
                    success: true,
                    message: `Cita ${estado.toLowerCase()} exitosamente`,
                    data: result
                });
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

CitaController.getCitasByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        Cita.getByUserId(userId, (err, citas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener las citas del usuario',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                data: citas
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

CitaController.updateCitaDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_cita } = req.body;

        if (!fecha_cita) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una fecha para la cita'
            });
        }

        Cita.updateDate(id, fecha_cita, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la fecha de la cita',
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                message: 'Fecha de la cita actualizada exitosamente',
                data: result
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

CitaController.getAllPending = async (req, res) => {
    try {
        Cita.getAllPending((err, citas) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener las citas pendientes',
                    error: err
                });
            }
            
            res.status(200).json({
                success: true,
                data: citas
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

module.exports = CitaController;
