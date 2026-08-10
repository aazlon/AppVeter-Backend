const db = require('../config/Config');

const Novedad = {};

Novedad.create = (data, result) => {
    const sql = `
        INSERT INTO novedades(descripcion, image, user_id, created_at, updated_at)
        VALUES(?, ?, ?, NOW(), NOW())
    `;
    db.query(sql, [data.descripcion, data.image || null, data.user_id], (err, res) => {
        if (err) {
            console.error('Error al crear novedad:', err);
            result(err, null);
        } else {
            result(null, { id: res.insertId, ...data });
        }
    });
};

Novedad.getAll = (result) => {
    const sql = `
        SELECT id, descripcion, image, user_id, created_at, updated_at
        FROM novedades
        ORDER BY created_at DESC
    `;
    db.query(sql, (err, res) => {
        if (err) {
            console.error('Error al obtener novedades:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Novedad.getById = (id, result) => {
    const sql = `SELECT id, descripcion, image, user_id, created_at, updated_at FROM novedades WHERE id = ?`;
    db.query(sql, [id], (err, res) => {
        if (err) {
            console.error('Error al obtener novedad:', err);
            result(err, null);
        } else {
            result(null, res[0] || null);
        }
    });
};

Novedad.update = (id, data, result) => {
    let sql, params;
    if (data.image) {
        sql = `UPDATE novedades SET descripcion = ?, image = ?, updated_at = NOW() WHERE id = ?`;
        params = [data.descripcion, data.image, id];
    } else {
        sql = `UPDATE novedades SET descripcion = ?, updated_at = NOW() WHERE id = ?`;
        params = [data.descripcion, id];
    }
    db.query(sql, params, (err, res) => {
        if (err) {
            console.error('Error al actualizar novedad:', err);
            result(err, null);
        } else {
            result(null, res.affectedRows > 0 ? { id, ...data } : null);
        }
    });
};

Novedad.delete = (id, result) => {
    const sql = `DELETE FROM novedades WHERE id = ?`;
    db.query(sql, [id], (err, res) => {
        if (err) {
            console.error('Error al eliminar novedad:', err);
            result(err, null);
        } else {
            result(null, res.affectedRows > 0);
        }
    });
};

module.exports = Novedad;
