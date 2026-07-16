const db = require('../config/Config');

const Notificacion = {};

Notificacion.create = async (notificacion, result) => {
    const sql = `
        INSERT INTO
        notificaciones(
        user_id,
        titulo,
        mensaje,
        tipo,
        leida,
        cita_id,
        created_at
        )
        VALUES(?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            notificacion.user_id,
            notificacion.titulo,
            notificacion.mensaje,
            notificacion.tipo,
            notificacion.leida || 0,
            notificacion.cita_id || null,
            new Date()
        ],
        (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
            }
            else {
                console.log('Id de la nueva notificación:', res.insertId);
                result(null, res.insertId);
            }
        }
    );
};

Notificacion.getByUserId = (userId, result) => {
    const sql = `
        SELECT
            *
        FROM
            notificaciones
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

Notificacion.markAsRead = (id, result) => {
    const sql = `
        UPDATE
            notificaciones
        SET
            leida = 1
        WHERE
            id = ?
    `;

    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Notificacion.markAllAsRead = (userId, result) => {
    const sql = `
        UPDATE
            notificaciones
        SET
            leida = 1
        WHERE
            user_id = ?
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

Notificacion.delete = (id, result) => {
    const sql = `
        DELETE FROM
            notificaciones
        WHERE
            id = ?
    `;

    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Notificacion.getUnreadCount = (userId, result) => {
    const sql = `
        SELECT
            COUNT(*) as count
        FROM
            notificaciones
        WHERE
            user_id = ? AND leida = 0
    `;

    db.query(sql, [userId], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res[0].count);
        }
    });
};

module.exports = Notificacion;
