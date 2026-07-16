const db = require('../config/Config');

const Service = {};

Service.create = (data, result) => {
    const sql = `
        INSERT INTO services(titulo, descripcion, image, user_id, created_at, updated_at)
        VALUES(?, ?, ?, ?, NOW(), NOW())
    `;
    db.query(sql, [data.titulo, data.descripcion, data.image || null, data.user_id], (err, res) => {
        if (err) {
            console.error('Error al crear servicio:', err);
            result(err, null);
        } else {
            result(null, { id: res.insertId, ...data });
        }
    });
};

Service.getAll = (result) => {
    const sql = `
        SELECT id, titulo, descripcion, image, user_id, created_at, updated_at
        FROM services
        ORDER BY created_at DESC
    `;
    db.query(sql, (err, res) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Service.getById = (id, result) => {
    const sql = `SELECT id, titulo, descripcion, image, user_id, created_at, updated_at FROM services WHERE id = ?`;
    db.query(sql, [id], (err, res) => {
        if (err) {
            console.error('Error al obtener servicio:', err);
            result(err, null);
        } else {
            result(null, res[0] || null);
        }
    });
};

Service.update = (id, data, result) => {
    let sql, params;
    if (data.image) {
        sql = `UPDATE services SET titulo = ?, descripcion = ?, image = ?, updated_at = NOW() WHERE id = ?`;
        params = [data.titulo, data.descripcion, data.image, id];
    } else {
        sql = `UPDATE services SET titulo = ?, descripcion = ?, updated_at = NOW() WHERE id = ?`;
        params = [data.titulo, data.descripcion, id];
    }
    db.query(sql, params, (err, res) => {
        if (err) {
            console.error('Error al actualizar servicio:', err);
            result(err, null);
        } else {
            result(null, res.affectedRows > 0 ? { id, ...data } : null);
        }
    });
};

Service.delete = (id, result) => {
    const sql = `DELETE FROM services WHERE id = ?`;
    db.query(sql, [id], (err, res) => {
        if (err) {
            console.error('Error al eliminar servicio:', err);
            result(err, null);
        } else {
            result(null, res.affectedRows > 0);
        }
    });
};

module.exports = Service;
