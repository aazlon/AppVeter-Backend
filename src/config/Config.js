const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'root123',
    database: 'appveter',
    multipleStatements: true
});

db.connect(function (err) {
    if (err) throw err;
    console.log('DATABASE CONNECTED!');

    // Automatización para crear tablas
    const sqlScript = fs.readFileSync(path.join(__dirname, '../db/Db.sql')).toString();
    db.query(sqlScript, (err, results) => {
        if (err) {
            console.error('Error ejecutando Db.sql:', err);
        } else {
            console.log('Tablas verificadas/creadas automáticamente.');
            
            // Intentar agregar las columnas cedula y username en caso de que la tabla ya existiera antes
            db.query("ALTER TABLE users ADD COLUMN cedula VARCHAR(90) NULL UNIQUE;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });
            db.query("ALTER TABLE users ADD COLUMN username VARCHAR(90) NULL UNIQUE;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });

            // Migrar doctor_id a doctor_nombre en caso de que la tabla mascotas ya exista
            db.query("ALTER TABLE mascotas ADD COLUMN doctor_nombre VARCHAR(255) NULL;", (errAlter) => {
                // Se ignora el error si la columna ya existe
                // Si se agregó exitosamente, copiar datos de doctors.nombre a doctor_nombre
                if (!errAlter) {
                    db.query("UPDATE mascotas m INNER JOIN doctors d ON m.doctor_id = d.id SET m.doctor_nombre = d.nombre;", (errUpdate) => {
                        // Se ignora el error si no hay datos o la columna doctor_id ya no existe
                    });
                }
            });
            db.query("ALTER TABLE mascotas DROP FOREIGN KEY mascotas_ibfk_2;", (errAlter) => {
                // Se ignora el error si la foreign key ya no existe
            });
            db.query("ALTER TABLE mascotas DROP COLUMN doctor_id;", (errAlter) => {
                // Se ignora el error si la columna ya no existe
            });

            // Migrar para agregar fecha_cita a la tabla citas
            db.query("ALTER TABLE citas ADD COLUMN fecha_cita DATE NULL;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });

            // Agregar columna direccion a la tabla users
            db.query("ALTER TABLE users ADD COLUMN direccion TEXT NULL;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });

            // Agregar columnas para recuperacion de contrasena
            db.query("ALTER TABLE users ADD COLUMN reset_code VARCHAR(6) NULL;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });
            db.query("ALTER TABLE users ADD COLUMN reset_code_expires DATETIME NULL;", (errAlter) => {
                // Se ignora el error si la columna ya existe
            });
        }
    });
});

module.exports = db;