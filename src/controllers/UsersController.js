const User = require('../models/User');
const Rol = require('../models/Rol');
const jwt = require('jsonwebtoken');
const Keys = require('../config/Keys');
const bcrypt = require('bcrypt');
const { sendResetCode } = require('../services/MailerService');

function validateUserFields(user) {
    if (!user.name || !user.name.trim()) return 'El nombre es obligatorio.';
    if (!user.lastname || !user.lastname.trim()) return 'El apellido es obligatorio.';
    if (!user.email || !user.email.trim()) return 'El correo electrónico es obligatorio.';
    if (!user.username || !user.username.trim()) return 'El nombre de usuario es obligatorio.';
    if (!user.cedula || !user.cedula.trim()) return 'La cédula es obligatoria.';
    if (!user.phone || !user.phone.trim()) return 'El teléfono es obligatorio.';
    if (!user.password) return 'La contraseña es obligatoria.';
    return null;
}

function checkDuplicateUser(user, callback) {
    User.findByEmail(user.email, (err, existingEmail) => {
        if (existingEmail) {
            return callback({ field: 'email', message: 'El correo electrónico ya está registrado.' });
        }
        User.findByUsername(user.username, (err, existingUsername) => {
            if (existingUsername) {
                return callback({ field: 'username', message: 'El nombre de usuario ya está en uso.' });
            }
            User.findByCedula(user.cedula, (err, existingCedula) => {
                if (existingCedula) {
                    return callback({ field: 'cedula', message: 'La cédula ya está registrada.' });
                }
                User.findByPhone(user.phone, (err, existingPhone) => {
                    if (existingPhone) {
                        return callback({ field: 'phone', message: 'El teléfono ya está registrado.' });
                    }
                    return callback(null);
                });
            });
        });
    });
}

function handleDuplicateError(err) {
    if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('users.email')) return { field: 'email', message: 'El correo electrónico ya está registrado.' };
        if (err.sqlMessage.includes('users.username')) return { field: 'username', message: 'El nombre de usuario ya está en uso.' };
        if (err.sqlMessage.includes('users.cedula')) return { field: 'cedula', message: 'La cédula ya está registrada.' };
        if (err.sqlMessage.includes('users.phone')) return { field: 'phone', message: 'El teléfono ya está registrado.' };
    }
    return null;
}

module.exports = {

    async updateProfileWithImage(req, res) {
        try {
            const { id } = req.params;
            const user = JSON.parse(req.body.user);
            const files = req.files;

            if (files && files.length > 0) {
                const url = `http://localhost:3000/uploads/${files[0].filename}`;
                user.image = url;
            }

            User.update(id, user, (err, data) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error al actualizar el perfil',
                        error: err
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Perfil actualizado correctamente',
                    data: user
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general actualizando perfil',
                error: error
            });
        }
    },

    register(req, res) {
        const user = req.body;

        const validationError = validateUserFields(user);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        checkDuplicateUser(user, (err) => {
            if (err) {
                return res.status(400).json({ success: false, field: err.field, message: err.message });
            }

            User.create(user, (err, data) => {
                if (err) {
                    const dupError = handleDuplicateError(err);
                    if (dupError) {
                        return res.status(400).json({ success: false, field: dupError.field, message: dupError.message });
                    }
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuario',
                        error: err
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: 'El usuario se registró correctamente',
                    data: data
                });
            });
        });
    },

    async registerWithImage(req, res) {
        try {
            const user = JSON.parse(req.body.user);
            const files = req.files;

            const validationError = validateUserFields(user);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            if (files && files.length > 0) {
                const url = `http://localhost:3000/uploads/${files[0].filename}`;
                user.image = url;
            }

            checkDuplicateUser(user, (err) => {
                if (err) {
                    return res.status(400).json({ success: false, field: err.field, message: err.message });
                }

                User.create(user, (err, data) => {
                    if (err) {
                        const dupError = handleDuplicateError(err);
                        if (dupError) {
                            return res.status(400).json({ success: false, field: dupError.field, message: dupError.message });
                        }
                        return res.status(501).json({
                            success: false,
                            message: 'Hubo un error con el registro del usuario',
                            error: err
                        });
                    }

                    user.id = `${data}`;
                    const token = jwt.sign({ id: user.id, email: user.email }, Keys.secretOrKey, {});
                    user.session_token = token;

                    // Asignar rol por defecto (Cliente: id 3)
                    Rol.create(user.id, 3, (errRol, dataRol) => {
                        if (errRol) {
                            return res.status(501).json({
                                success: false,
                                message: 'Hubo un error con el registro del rol de usuario',
                                error: errRol
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message: 'El usuario se registró correctamente',
                            data: user
                        });
                    });
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general registrando usuario',
                error: error
            });
        }
    },

    getProfile(req, res) {
        const { id } = req.params;

        User.findById(id, (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener el perfil del usuario',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            delete user.password;

            // Obtener direccion por separado (por si la columna aun no existe en DB)
            const db = require('../config/Config');
            db.query("SELECT direccion FROM users WHERE id = ?", [id], (err2, rows) => {
                if (!err2 && rows && rows.length > 0 && rows[0].direccion) {
                    user.direccion = rows[0].direccion;
                }

                return res.status(200).json({
                    success: true,
                    data: user
                });
            });
        });
    },

    forgotPassword(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico es requerido'
            });
        }

        User.findByEmail(email, async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar el correo',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No existe una cuenta con ese correo electrónico'
                });
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 15 * 60 * 1000);

            User.saveResetCode(email, code, expires, async (errSave) => {
                if (errSave) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error al guardar el código de recuperación',
                        error: errSave
                    });
                }

                try {
                    await sendResetCode(email, code);
                    return res.status(200).json({
                        success: true,
                        message: 'Código de recuperación enviado a tu correo electrónico'
                    });
                } catch (emailError) {
                    console.error('Error enviando email:', emailError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al enviar el correo electrónico. Verifica la configuración SMTP.',
                        error: emailError.message
                    });
                }
            });
        });
    },

    verifyResetCode(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'El correo y el código son requeridos'
            });
        }

        User.findByResetCode(email, code, (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar el código',
                    error: err
                });
            }

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Código inválido'
                });
            }

            if (new Date() > new Date(user.reset_code_expires)) {
                return res.status(400).json({
                    success: false,
                    message: 'El código ha expirado. Solicita uno nuevo.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Código verificado correctamente'
            });
        });
    },

    resetPassword(req, res) {
        const { email, code, password } = req.body;

        if (!email || !code || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        User.findByResetCode(email, code, async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar el código',
                    error: err
                });
            }

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Código inválido'
                });
            }

            if (new Date() > new Date(user.reset_code_expires)) {
                return res.status(400).json({
                    success: false,
                    message: 'El código ha expirado. Solicita uno nuevo.'
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                User.updatePassword(user.id, hashedPassword, (errUpdate) => {
                    if (errUpdate) {
                        return res.status(500).json({
                            success: false,
                            message: 'Error al actualizar la contraseña',
                            error: errUpdate
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Contraseña actualizada correctamente'
                    });
                });
            } catch (error) {
                console.error('Error en bcrypt:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al procesar la nueva contraseña',
                    error: error
                });
            }
        });
    },

    async registerReceptionist(req, res) {
        try {
            const user = JSON.parse(req.body.user);
            const files = req.files;

            const validationError = validateUserFields(user);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            if (files && files.length > 0) {
                const url = `http://localhost:3000/uploads/${files[0].filename}`;
                user.image = url;
            }

            checkDuplicateUser(user, (err) => {
                if (err) {
                    return res.status(400).json({ success: false, field: err.field, message: err.message });
                }

                User.create(user, (err, data) => {
                    if (err) {
                        const dupError = handleDuplicateError(err);
                        if (dupError) {
                            return res.status(400).json({ success: false, field: dupError.field, message: dupError.message });
                        }
                        return res.status(501).json({
                            success: false,
                            message: 'Hubo un error con el registro del recepcionista',
                            error: err
                        });
                    }

                    user.id = `${data}`;

                    // Asignar rol RECEPCIONISTA (id: 2)
                    Rol.create(user.id, 2, (errRol, dataRol) => {
                        if (errRol) {
                            return res.status(501).json({
                                success: false,
                                message: 'Hubo un error con el registro del rol de recepcionista',
                                error: errRol
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message: 'Recepcionista registrado correctamente',
                            data: user
                        });
                    });
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general registrando recepcionista',
                error: error
            });
        }
    },

    async registerVeterinarian(req, res) {
        try {
            const user = JSON.parse(req.body.user);
            const files = req.files;

            const validationError = validateUserFields(user);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            if (files && files.length > 0) {
                const url = `http://localhost:3000/uploads/${files[0].filename}`;
                user.image = url;
            }

            checkDuplicateUser(user, (err) => {
                if (err) {
                    return res.status(400).json({ success: false, field: err.field, message: err.message });
                }

                User.create(user, (err, data) => {
                    if (err) {
                        const dupError = handleDuplicateError(err);
                        if (dupError) {
                            return res.status(400).json({ success: false, field: dupError.field, message: dupError.message });
                        }
                        return res.status(501).json({
                            success: false,
                            message: 'Hubo un error con el registro del veterinario',
                            error: err
                        });
                    }

                    user.id = `${data}`;

                    // Asignar rol VETERINARIO (id: 4)
                    Rol.create(user.id, 4, (errRol, dataRol) => {
                        if (errRol) {
                            return res.status(501).json({
                                success: false,
                                message: 'Hubo un error con el registro del rol de veterinario',
                                error: errRol
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message: 'Veterinario registrado correctamente',
                            data: user
                        });
                    });
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(501).json({
                success: false,
                message: 'Error general registrando veterinario',
                error: error
            });
        }
    },

    getReceptionists(req, res) {
        User.getAllByRole(2, (err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener los recepcionistas',
                    error: err
                });
            }

            return res.status(200).json({
                success: true,
                data: users
            });
        });
    },

    getVeterinarians(req, res) {
        User.getAllByRole(4, (err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener los veterinarios',
                    error: err
                });
            }

            return res.status(200).json({
                success: true,
                data: users
            });
        });
    },

    deleteUser(req, res) {
        const { id } = req.params;

        User.delete(id, (err, data) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el usuario',
                    error: err
                });
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuario eliminado correctamente'
            });
        });
    },

    login(req, res) {
        const identifier = req.body.username_or_email; // Puede ser username o email
        const password = req.body.password;

        User.findByUsernameOrEmail(identifier, async (err, myUser) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con la autenticación del usuario',
                    error: err
                });
            }

            if (!myUser) {
                return res.status(401).json({
                    success: false,
                    message: 'El usuario o correo no fue encontrado',
                });
            }

            try {
                const isPasswordValid = await bcrypt.compare(password, myUser.password);

                if (isPasswordValid) {
                    const token = jwt.sign({ id: myUser.id, email: myUser.email }, Keys.secretOrKey, {});

                    const data = {
                        id: myUser.id,
                        name: myUser.name,
                        lastname: myUser.lastname,
                        email: myUser.email,
                        username: myUser.username,
                        phone: myUser.phone,
                        cedula: myUser.cedula,
                        image: myUser.image,
                        session_token: `JWT ${token}`,
                        roles: myUser.roles
                    };

                    return res.status(201).json({
                        success: true,
                        message: 'El usuario se autenticó correctamente',
                        data: data
                    });
                } else {
                    return res.status(401).json({
                        success: false,
                        message: 'La contraseña es incorrecta',
                    });
                }
            } catch (error) {
                console.error('Error en bcrypt:', error);
                return res.status(501).json({
                    success: false,
                    message: 'Error procesando la autenticación',
                    error: error
                });
            }
        });
    },
};