const db = require('../config/Config');
const bcrypt = require('bcrypt');

const User = {};

User.create = async (user, result) => {

    const hash = await bcrypt.hash(user.password, 10);

    const sql = `
        INSERT INTO
        users(
        username,
        email,
        cedula,
        name,
        lastname,
        phone,
        image,
        password,
        created_at,
        updated_at
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user.username,
            user.email,
            user.cedula,
            user.name,
            user.lastname,
            user.phone,
            user.image,
            hash,
            new Date(),
            new Date()
        ],
        (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
            }
            else {
                console.log('Id del nuevo usuario:', res.insertId);
                result(null, res.insertId);
            }

        }
    );
}

User.findById = (id, result) => {
    const sql = `
        SELECT
            id,
            username,
            email,
            cedula,
            name,
            lastname,
            image,
            phone,
            password
        FROM
            users
        WHERE
            id = ?
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

User.findByUsernameOrEmail = (identifier, result) => {
    const sql = `
        SELECT
            U.id,
            U.username,
            U.email,
            U.cedula,
            U.name,
            U.lastname,
            U.image,
            U.phone,
            U.password,
            R.id AS rol_id,
            R.name AS rol_name,
            R.image AS rol_image,
            R.route AS rol_route
        FROM
            users AS U
        INNER JOIN
            user_has_roles AS UHR
        ON
            UHR.id_user = U.id
        INNER JOIN
            roles AS R
        ON
            UHR.id_rol = R.id
        WHERE
            U.email = ? OR U.username = ?
    `;

    db.query(sql, [identifier, identifier], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            if (res.length === 0) {
                result(null, null);
                return;
            }

            // Agrupar roles en un solo objeto de usuario
            const user = {
                id: res[0].id,
                username: res[0].username,
                email: res[0].email,
                name: res[0].name,
                lastname: res[0].lastname,
                image: res[0].image,
                phone: res[0].phone,
                password: res[0].password,
                roles: res.map(row => ({
                    id: row.rol_id ? row.rol_id.toString() : null,
                    name: row.rol_name,
                    image: row.rol_image,
                    route: row.rol_route
                }))
            };

            result(null, user);
        }
    });
};

User.findByEmail = (email, result) => {
    const sql = "SELECT id, email, name FROM users WHERE email = ?";

    db.query(sql, [email], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res.length > 0 ? res[0] : null);
        }
    });
};

User.findByUsername = (username, result) => {
    const sql = "SELECT id, username FROM users WHERE username = ?";

    db.query(sql, [username], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res.length > 0 ? res[0] : null);
        }
    });
};

User.findByCedula = (cedula, result) => {
    const sql = "SELECT id, cedula FROM users WHERE cedula = ?";

    db.query(sql, [cedula], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res.length > 0 ? res[0] : null);
        }
    });
};

User.findByPhone = (phone, result) => {
    const sql = "SELECT id, phone FROM users WHERE phone = ?";

    db.query(sql, [phone], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res.length > 0 ? res[0] : null);
        }
    });
};

User.saveResetCode = (email, code, expires, result) => {
    const sql = "UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE email = ?";

    db.query(sql, [code, expires, email], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

User.findByResetCode = (email, code, result) => {
    const sql = "SELECT id, email, reset_code, reset_code_expires FROM users WHERE email = ? AND reset_code = ?";

    db.query(sql, [email, code], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res.length > 0 ? res[0] : null);
        }
    });
};

User.updatePassword = (id, hashedPassword, result) => {
    const sql = "UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL, updated_at = ? WHERE id = ?";

    db.query(sql, [hashedPassword, new Date(), id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

User.getAllByRole = (roleId, result) => {
    const sql = `
        SELECT
            U.id,
            U.username,
            U.email,
            U.cedula,
            U.name,
            U.lastname,
            U.image,
            U.phone,
            U.created_at
        FROM
            users AS U
        INNER JOIN
            user_has_roles AS UHR ON UHR.id_user = U.id
        WHERE
            UHR.id_rol = ?
        ORDER BY
            U.created_at DESC
    `;

    db.query(sql, [roleId], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

User.delete = (id, result) => {
    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('Error:', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

User.update = (id, user, result) => {
    const sql = `
        UPDATE users
        SET
            username = ?,
            phone = ?,
            image = ?,
            updated_at = ?
        WHERE
            id = ?
    `;

    db.query(
        sql,
        [
            user.username,
            user.phone,
            user.image,
            new Date(),
            id
        ],
        (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
            } else {
                result(null, res);
            }
        }
    );
};

module.exports = User;