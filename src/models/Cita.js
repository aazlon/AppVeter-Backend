const db = require('../config/Config');

const Cita = {};

Cita.create = async (cita, result) => {
    const sql = `
        INSERT INTO
        citas(
        user_id,
        nombre_propietario,
        ci,
        telefono,
        direccion,
        correo_electronico,
        motivo_cita,
        estado,
        fecha_solicitud,
        created_at,
        updated_at
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            cita.user_id,
            cita.nombre_propietario,
            cita.ci,
            cita.telefono,
            cita.direccion,
            cita.correo_electronico,
            cita.motivo_cita,
            cita.estado || 'PENDIENTE',
            cita.fecha_solicitud,
            new Date(),
            new Date()
        ],
        (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
            }
            else {
                console.log('Id de la nueva cita:', res.insertId);
                result(null, res.insertId);
            }
        }
    );
};

Cita.getAll = (result) => {
    const sql = `
        SELECT
            c.*,
            u.name as user_name,
            u.email as user_email
        FROM
            citas AS c
        LEFT JOIN
            users AS u ON c.user_id = u.id
        ORDER BY
            c.created_at DESC
    `;

    db.query(sql, (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Cita.getById = (id, result) => {
    const sql = `
        SELECT
            c.*,
            u.name as user_name,
            u.email as user_email
        FROM
            citas AS c
        LEFT JOIN
            users AS u ON c.user_id = u.id
        WHERE
            c.id = ?
    `;

    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res[0]);
        }
    });
};

Cita.updateStatus = (id, estado, fecha_cita, result) => {
    const sql = `
        UPDATE
            citas
        SET
            estado = ?,
            fecha_cita = ?,
            updated_at = ?
        WHERE
            id = ?
    `;

    db.query(sql, [estado, fecha_cita || null, new Date(), id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Cita.updateDate = (id, fecha_cita, result) => {
    const sql = `
        UPDATE
            citas
        SET
            fecha_cita = ?,
            updated_at = ?
        WHERE
            id = ?
    `;

    db.query(sql, [fecha_cita, new Date(), id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Cita.getByUserId = (userId, result) => {
    const sql = `
        SELECT
            *
        FROM
            citas
        WHERE
            user_id = ?
        ORDER BY
            created_at DESC
    `;

    db.query(sql, [userId], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Cita.getAllPending = (result) => {
    const sql = `
        SELECT
            c.*,
            u.name as user_name,
            u.email as user_email
        FROM
            citas AS c
        LEFT JOIN
            users AS u ON c.user_id = u.id
        WHERE
            c.estado = 'PENDIENTE'
        ORDER BY
            c.created_at DESC
    `;

    db.query(sql, (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Cita;
