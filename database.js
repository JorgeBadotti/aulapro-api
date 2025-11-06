// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Lê as variáveis do ambiente
const {
  MYSQL_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE
} = process.env;

// ⚙️ Detecta se está rodando no Railway (produção)
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME !== undefined;

// Configuração automática:
const pool = MYSQL_URL
  ? mysql.createPool(MYSQL_URL)
  : mysql.createPool({
      host: isRailway ? (MYSQLHOST || 'mysql.railway.internal') : (MYSQLHOST || 'localhost'),
      port: Number(MYSQLPORT || (isRailway ? 3306 : 22864)),
      user: MYSQLUSER || 'root',
      password: MYSQLPASSWORD || '',
      database: MYSQLDATABASE || 'aulapro',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

// Teste rápido de conexão (opcional)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado ao MySQL:', conn.config.host, '(porta', conn.config.port, ')');
    conn.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco MySQL:', err.message);
  }
})();

module.exports = pool;
