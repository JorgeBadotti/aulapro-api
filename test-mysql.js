require('dotenv').config();
const mysql = require('mysql2/promise');

async function testarConexao() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT
    });
    console.log('✅ Conectado ao MySQL com sucesso!');
    const [rows] = await conn.query('SELECT NOW() AS agora');
    console.log('🕒 Hora no servidor MySQL:', rows[0].agora);
    await conn.end();
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
  }
}

testarConexao();
