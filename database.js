// database.js
// Adapter que usa MySQL (mysql2/promise) quando variáveis MYSQL* ou DATABASE_URL estiverem presentes
// Caso contrário, cai para SQLite local (arquivo ./aulapro.db)
require('dotenv').config();

const {
  DATABASE_URL,
  MYSQL_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE
} = process.env;

const hasMySQL = !!(DATABASE_URL || MYSQL_URL || MYSQLHOST || MYSQLUSER || MYSQLPASSWORD);

if (hasMySQL) {
  const mysql = require('mysql2/promise');

  const pool = DATABASE_URL || MYSQL_URL
    ? mysql.createPool(DATABASE_URL || MYSQL_URL)
    : mysql.createPool({
        host: MYSQLHOST || 'localhost',
        port: Number(MYSQLPORT || 3306),
        user: MYSQLUSER || 'root',
        password: MYSQLPASSWORD || '',
        database: MYSQLDATABASE || 'railway',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

  // Adapter compatível com a API usada no server.js (sqlite3-like callbacks)
  const adapter = {
    all(sql, params, cb) {
      // params can be omitted
      if (typeof params === 'function') { cb = params; params = []; }
      pool.query(sql, params)
        .then(([rows]) => cb(null, rows))
        .catch((err) => cb(err));
    },
    run(sql, params, cb) {
      if (typeof params === 'function') { cb = params; params = []; }
      pool.execute(sql, params)
        .then(([result]) => {
          // create a context object similar to sqlite's 'this'
          const info = { lastID: result.insertId || null, changes: result.affectedRows || 0 };
          if (cb) cb.call(info, null);
        })
        .catch((err) => { if (cb) cb(err); });
    },
    query: async (sql, params) => {
      return pool.query(sql, params);
    },
    end: async () => pool.end(),
  };

  // Teste rápido (loga host/port quando possível)
  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Conectado ao MySQL:', conn.config.host, '(porta', conn.config.port, ')');
      conn.release();
    } catch (err) {
      console.error('❌ Erro ao conectar ao MySQL:', err.message);
    }
  })();

  module.exports = adapter;

} else {
  // Fallback para SQLite quando MySQL não configurado
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./aulapro.db', (err) => {
    if (err) {
      console.error('❌ Erro ao abrir banco SQLite:', err.message);
    } else {
      console.log('✅ Banco SQLite aberto em ./aulapro.db');
    }
  });

  // Garante a criação da tabela (compatível com SQLite)
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT UNIQUE NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Erro ao criar tabela alunos (SQLite):', err.message);
    else console.log('✅ Tabela alunos pronta (SQLite).');
  });

  // Exporta a própria instância (já compatível com .all e .run)
  module.exports = db;
}
