// backend/config/database.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Creamos un "pool" de conexiones
// Un pool es como tener varios empleados listos para atender
// en vez de uno solo que se cansa
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Dónde está MySQL (en tu computador = localhost)
  user: process.env.DB_USER,         // Tu usuario de MySQL
  password: process.env.DB_PASSWORD, // Tu contraseña de MySQL
  database: process.env.DB_NAME,     // El nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,               // Máximo 10 conexiones simultáneas
  queueLimit: 0
});

// Convertimos el pool a versión "promise" para usar async/await
// (más fácil de leer que los callbacks)
const db = pool.promise();

// Verificamos que la conexión funciona
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
  } else {
    console.log('✅ Conexión a MySQL exitosa');
    connection.release(); // Liberamos la conexión
  }
});

// Exportamos para usar en otros archivos
module.exports = db;