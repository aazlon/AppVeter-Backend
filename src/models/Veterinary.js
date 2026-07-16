const db = require('../config/Config');

const Veterinary = {};

// Obtener todos los doctores
Veterinary.getAllDoctors = (result) => {
    const sql = `SELECT id, nombre FROM doctors ORDER BY nombre ASC`;
    db.query(sql, (err, res) => {
        if (err) {
            console.error('Error al obtener doctores:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

// Crear historia clínica completa (Cliente, Mascota, Estado, Examen Físico, Paraclinicos)
Veterinary.create = (data, result) => {
    // 1. Iniciar transacción o control secuencial
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar transacción:', err);
            return result(err, null);
        }

        const clientData = data.client;
        const petData = data.pet;
        const stateData = data.state;
        const physicalData = data.physical;
        const paraclinicalData = data.paraclinical;

        // Buscar si el cliente ya existe por CI
        const checkClientSql = `SELECT id FROM clients WHERE ci = ?`;
        db.query(checkClientSql, [clientData.ci], (err, clientRes) => {
            if (err) {
                return db.rollback(() => {
                    result(err, null);
                });
            }

            const proceedWithPet = (clientId) => {
                // Insertar mascota
                const petSql = `
                    INSERT INTO mascotas(client_id, doctor_nombre, nombre_mascota, especie, raza, edad, sexo, dieta, peso, microchip, created_at, updated_at)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;
                const petParams = [
                    clientId,
                    petData.doctor_nombre || null,
                    petData.nombre_mascota,
                    petData.especie,
                    petData.raza,
                    petData.edad,
                    petData.sexo,
                    petData.dieta,
                    petData.peso,
                    petData.microchip || null
                ];

                db.query(petSql, petParams, (err, petRes) => {
                    if (err) {
                        return db.rollback(() => {
                            result(err, null);
                        });
                    }

                    const mascotaId = petRes.insertId;

                    // Insertar estado (Anamnesis)
                    const stateSql = `
                        INSERT INTO mascota_estado(mascota_id, comportamiento, apetito, defecacion, diarrea, prenez, cirugia, inmunizaciones, desparasitacion, ingesta_agua, miccion, vomitos, celos, partos, created_at, updated_at)
                        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `;
                    const stateParams = [
                        mascotaId,
                        stateData.comportamiento || null,
                        stateData.apetito || null,
                        stateData.defecacion || null,
                        stateData.diarrea || null,
                        stateData.prenez || null,
                        stateData.cirugia || null,
                        stateData.inmunizaciones || null,
                        stateData.desparasitacion || null,
                        stateData.ingesta_agua || null,
                        stateData.miccion || null,
                        stateData.vomitos || null,
                        stateData.celos || null,
                        stateData.partos || null
                    ];

                    db.query(stateSql, stateParams, (err) => {
                        if (err) {
                            return db.rollback(() => {
                                result(err, null);
                            });
                        }

                        // Insertar examen físico
                        const physicalSql = `
                            INSERT INTO mascota_examen_fisico(mascota_id, temperatura, campo_pulmonar, tiempo_perfusion_capilar, membrana_mucosa, frecuencia_cardiaca, reflejo_deglutorio, frecuencia_pulso, reflejo_tusigeno, frecuencia_respiratoria, palpacion_abdominal, nodulos_linfaticos, antecedentes_clinicos, observaciones, created_at, updated_at)
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        `;
                        const physicalParams = [
                            mascotaId,
                            physicalData.temperatura || null,
                            physicalData.campo_pulmonar || null,
                            physicalData.tiempo_perfusion_capilar || null,
                            physicalData.membrana_mucosa || null,
                            physicalData.frecuencia_cardiaca || null,
                            physicalData.reflejo_deglutorio || null,
                            physicalData.frecuencia_pulso || null,
                            physicalData.reflejo_tusigeno || null,
                            physicalData.frecuencia_respiratoria || null,
                            physicalData.palpacion_abdominal || null,
                            physicalData.nodulos_linfaticos || null,
                            physicalData.antecedentes_clinicos || null,
                            physicalData.observaciones || null
                        ];

                        db.query(physicalSql, physicalParams, (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    result(err, null);
                                });
                            }

                            // Insertar exámenes paraclínicos
                            const paraclinicalSql = `
                                INSERT INTO mascota_examenes_paraclinicos(mascota_id, perfil_quimico, hematologia, coprologia, uroanalisis, hemoparasitos, otro, diagnostico_presuntivo, tratamiento, created_at, updated_at)
                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                            `;
                            const paraclinicalParams = [
                                mascotaId,
                                paraclinicalData.perfil_quimico ? 1 : 0,
                                paraclinicalData.hematologia ? 1 : 0,
                                paraclinicalData.coprologia ? 1 : 0,
                                paraclinicalData.uroanalisis ? 1 : 0,
                                paraclinicalData.hemoparasitos ? 1 : 0,
                                paraclinicalData.otro ? 1 : 0,
                                paraclinicalData.diagnostico_presuntivo || null,
                                paraclinicalData.tratamiento || null
                            ];

                            db.query(paraclinicalSql, paraclinicalParams, (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        result(err, null);
                                    });
                                }

                                // Todo guardado con éxito
                                db.commit((errCommit) => {
                                    if (errCommit) {
                                        return db.rollback(() => {
                                            result(errCommit, null);
                                        });
                                    }
                                    result(null, { success: true, clientId, mascotaId });
                                });
                            });
                        });
                    });
                });
            };

            if (clientRes.length > 0) {
                // Cliente ya existe: actualizar datos de dirección y teléfono si cambiaron
                const existingClientId = clientRes[0].id;
                const updateClientSql = `
                    UPDATE clients 
                    SET nombre_propietario = ?, direccion = ?, telefono = ?, fecha = ?, updated_at = NOW() 
                    WHERE id = ?
                `;
                db.query(updateClientSql, [clientData.nombre_propietario, clientData.direccion, clientData.telefono, clientData.fecha, existingClientId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            result(err, null);
                        });
                    }
                    proceedWithPet(existingClientId);
                });
            } else {
                // Cliente nuevo: registrar
                const insertClientSql = `
                    INSERT INTO clients(nombre_propietario, ci, direccion, telefono, fecha, created_at, updated_at)
                    VALUES(?, ?, ?, ?, ?, NOW(), NOW())
                `;
                db.query(insertClientSql, [clientData.nombre_propietario, clientData.ci, clientData.direccion, clientData.telefono, clientData.fecha], (err, insertRes) => {
                    if (err) {
                        return db.rollback(() => {
                            result(err, null);
                        });
                    }
                    proceedWithPet(insertRes.insertId);
                });
            }
        });
    });
};

// Obtener todas las historias con filtros dinámicos
Veterinary.getAll = (filters, result) => {
    let sql = `
        SELECT 
            C.id AS client_id, C.nombre_propietario, C.ci, C.direccion, C.telefono, DATE_FORMAT(C.fecha, '%Y-%m-%d') AS fecha,
            M.id AS mascota_id, M.nombre_mascota, M.especie, M.raza, M.edad, M.sexo, M.dieta, M.peso, M.microchip,
            M.doctor_nombre,
            ME.comportamiento, ME.apetito, ME.defecacion, ME.diarrea, ME.prenez, ME.cirugia, ME.inmunizaciones, ME.desparasitacion, ME.ingesta_agua, ME.miccion, ME.vomitos, ME.celos, ME.partos,
            MF.temperatura, MF.campo_pulmonar, MF.tiempo_perfusion_capilar, MF.membrana_mucosa, MF.frecuencia_cardiaca, MF.reflejo_deglutorio, MF.frecuencia_pulso, MF.reflejo_tusigeno, MF.frecuencia_respiratoria, MF.palpacion_abdominal, MF.nodulos_linfaticos, MF.antecedentes_clinicos, MF.observaciones,
            MP.perfil_quimico, MP.hematologia, MP.coprologia, MP.uroanalisis, MP.hemoparasitos, MP.otro, MP.diagnostico_presuntivo, MP.tratamiento
        FROM mascotas AS M
        INNER JOIN clients AS C ON M.client_id = C.id
        LEFT JOIN mascota_estado AS ME ON ME.mascota_id = M.id
        LEFT JOIN mascota_examen_fisico AS MF ON MF.mascota_id = M.id
        LEFT JOIN mascota_examenes_paraclinicos AS MP ON MP.mascota_id = M.id
        WHERE 1 = 1
    `;

    const params = [];

    if (filters.search) {
        sql += ` AND (C.nombre_propietario LIKE ? OR C.ci LIKE ? OR M.nombre_mascota LIKE ? OR M.raza LIKE ?)`;
        const searchVal = `%${filters.search}%`;
        params.push(searchVal, searchVal, searchVal, searchVal);
    }

    if (filters.especie) {
        sql += ` AND M.especie = ?`;
        params.push(filters.especie);
    }

    if (filters.doctor_nombre) {
        sql += ` AND M.doctor_nombre LIKE ?`;
        params.push(`%${filters.doctor_nombre}%`);
    }

    if (filters.fecha_inicio && filters.fecha_fin) {
        sql += ` AND C.fecha BETWEEN ? AND ?`;
        params.push(filters.fecha_inicio, filters.fecha_fin);
    }

    sql += ` ORDER BY M.created_at DESC`;

    db.query(sql, params, (err, res) => {
        if (err) {
            console.error('Error al consultar historias clínicas:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

// Actualizar una historia clínica
Veterinary.update = (mascotaId, data, result) => {
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar transacción en actualización:', err);
            return result(err, null);
        }

        const clientData = data.client;
        const petData = data.pet;
        const stateData = data.state;
        const physicalData = data.physical;
        const paraclinicalData = data.paraclinical;

        // 1. Obtener client_id de la mascota a actualizar
        const getClientIdSql = `SELECT client_id FROM mascotas WHERE id = ?`;
        db.query(getClientIdSql, [mascotaId], (err, mascotaRes) => {
            if (err || mascotaRes.length === 0) {
                return db.rollback(() => {
                    result(err || new Error('Mascota no encontrada'), null);
                });
            }

            const clientId = mascotaRes[0].client_id;

            // 2. Actualizar cliente
            const updateClientSql = `
                UPDATE clients 
                SET nombre_propietario = ?, ci = ?, direccion = ?, telefono = ?, fecha = ?, updated_at = NOW()
                WHERE id = ?
            `;
            db.query(updateClientSql, [clientData.nombre_propietario, clientData.ci, clientData.direccion, clientData.telefono, clientData.fecha, clientId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        result(err, null);
                    });
                }

                // 3. Actualizar mascota
                const updatePetSql = `
                    UPDATE mascotas 
                    SET doctor_nombre = ?, nombre_mascota = ?, especie = ?, raza = ?, edad = ?, sexo = ?, dieta = ?, peso = ?, microchip = ?, updated_at = NOW()
                    WHERE id = ?
                `;
                db.query(updatePetSql, [
                    petData.doctor_nombre || null,
                    petData.nombre_mascota,
                    petData.especie,
                    petData.raza,
                    petData.edad,
                    petData.sexo,
                    petData.dieta,
                    petData.peso,
                    petData.microchip || null,
                    mascotaId
                ], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            result(err, null);
                        });
                    }

                    // 4. Actualizar estado (Anamnesis)
                    const updateStateSql = `
                        UPDATE mascota_estado 
                        SET comportamiento = ?, apetito = ?, defecacion = ?, diarrea = ?, prenez = ?, cirugia = ?, inmunizaciones = ?, desparasitacion = ?, ingesta_agua = ?, miccion = ?, vomitos = ?, celos = ?, partos = ?, updated_at = NOW()
                        WHERE mascota_id = ?
                    `;
                    db.query(updateStateSql, [
                        stateData.comportamiento || null,
                        stateData.apetito || null,
                        stateData.defecacion || null,
                        stateData.diarrea || null,
                        stateData.prenez || null,
                        stateData.cirugia || null,
                        stateData.inmunizaciones || null,
                        stateData.desparasitacion || null,
                        stateData.ingesta_agua || null,
                        stateData.miccion || null,
                        stateData.vomitos || null,
                        stateData.celos || null,
                        stateData.partos || null,
                        mascotaId
                    ], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                result(err, null);
                            });
                        }

                        // 5. Actualizar examen físico
                        const updatePhysicalSql = `
                            UPDATE mascota_examen_fisico 
                            SET temperatura = ?, campo_pulmonar = ?, tiempo_perfusion_capilar = ?, membrana_mucosa = ?, frecuencia_cardiaca = ?, reflejo_deglutorio = ?, frecuencia_pulso = ?, reflejo_tusigeno = ?, frecuencia_respiratoria = ?, palpacion_abdominal = ?, nodulos_linfaticos = ?, antecedentes_clinicos = ?, observaciones = ?, updated_at = NOW()
                            WHERE mascota_id = ?
                        `;
                        db.query(updatePhysicalSql, [
                            physicalData.temperatura || null,
                            physicalData.campo_pulmonar || null,
                            physicalData.tiempo_perfusion_capilar || null,
                            physicalData.membrana_mucosa || null,
                            physicalData.frecuencia_cardiaca || null,
                            physicalData.reflejo_deglutorio || null,
                            physicalData.frecuencia_pulso || null,
                            physicalData.reflejo_tusigeno || null,
                            physicalData.frecuencia_respiratoria || null,
                            physicalData.palpacion_abdominal || null,
                            physicalData.nodulos_linfaticos || null,
                            physicalData.antecedentes_clinicos || null,
                            physicalData.observaciones || null,
                            mascotaId
                        ], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    result(err, null);
                                });
                            }

                            // 6. Actualizar exámenes paraclínicos
                            const updateParaclinicalSql = `
                                UPDATE mascota_examenes_paraclinicos 
                                SET perfil_quimico = ?, hematologia = ?, coprologia = ?, uroanalisis = ?, hemoparasitos = ?, otro = ?, diagnostico_presuntivo = ?, tratamiento = ?, updated_at = NOW()
                                WHERE mascota_id = ?
                            `;
                            db.query(updateParaclinicalSql, [
                                paraclinicalData.perfil_quimico ? 1 : 0,
                                paraclinicalData.hematologia ? 1 : 0,
                                paraclinicalData.coprologia ? 1 : 0,
                                paraclinicalData.uroanalisis ? 1 : 0,
                                paraclinicalData.hemoparasitos ? 1 : 0,
                                paraclinicalData.otro ? 1 : 0,
                                paraclinicalData.diagnostico_presuntivo || null,
                                paraclinicalData.tratamiento || null,
                                mascotaId
                            ], (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        result(err, null);
                                    });
                                }

                                // Guardar cambios
                                db.commit((errCommit) => {
                                    if (errCommit) {
                                        return db.rollback(() => {
                                            result(errCommit, null);
                                        });
                                    }
                                    result(null, { success: true });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

// Eliminar una historia clínica
Veterinary.delete = (mascotaId, result) => {
    // Al eliminar la mascota, gracias al ON DELETE CASCADE en las tablas:
    // mascota_estado, mascota_examen_fisico, mascota_examenes_paraclinicos se eliminarán automáticamente.
    // También podemos eliminar al cliente si no tiene más mascotas registradas
    const getClientIdSql = `SELECT client_id FROM mascotas WHERE id = ?`;
    db.query(getClientIdSql, [mascotaId], (err, res) => {
        if (err) {
            console.error('Error al obtener client_id para eliminar:', err);
            return result(err, null);
        }
        if (res.length === 0) {
            return result(new Error('Registro no encontrado'), null);
        }

        const clientId = res[0].client_id;

        // Borrar la mascota
        const deletePetSql = `DELETE FROM mascotas WHERE id = ?`;
        db.query(deletePetSql, [mascotaId], (err) => {
            if (err) {
                console.error('Error al eliminar mascota:', err);
                return result(err, null);
            }

            // Comprobar si al cliente le quedan más mascotas
            const checkOtherPetsSql = `SELECT id FROM mascotas WHERE client_id = ?`;
            db.query(checkOtherPetsSql, [clientId], (err, petsRes) => {
                if (!err && petsRes.length === 0) {
                    // Si el cliente ya no tiene mascotas, borrar también al cliente para mantener limpia la BD
                    db.query(`DELETE FROM clients WHERE id = ?`, [clientId], (errClient) => {
                        if (errClient) console.error('Error al eliminar cliente huérfano:', errClient);
                    });
                }
                result(null, { success: true });
            });
        });
    });
};

module.exports = Veterinary;
