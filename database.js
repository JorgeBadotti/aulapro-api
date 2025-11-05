// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway cria automaticamente as variáveis MYSQL_URL, MYSQLHOST, etc.
const {
  MYSQL_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
} = process.env;

const pool = MYSQL_URL
  ? mysql.createPool(MYSQL_URL)
  : mysql.createPool({
      host: MYSQLHOST || 'localhost',
      port: Number(MYSQLPORT || 3306),
      user: MYSQLUSER || 'root',
      password: MYSQLPASSWORD || '',
      database: MYSQLDATABASE || 'aulapro',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

module.exports = pool;
