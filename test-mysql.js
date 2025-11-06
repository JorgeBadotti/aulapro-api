require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
    });

    const [rows] = await conn.query('SELECT NOW() AS hora');
    console.log('✅ Conectado ao MySQL com sucesso!');
    console.log('🕒 Hora no servidor MySQL:', rows[0].hora);
    await conn.end();
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
  }
})();
