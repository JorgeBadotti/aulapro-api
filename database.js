// database.js
// Auto-selects MySQL (when MYSQLHOST / DATABASE_URL present) or falls back to SQLite local file.

const path = require('path');

if (process.env.MYSQLHOST || process.env.DATABASE_URL || process.env.MYSQLDATABASE) {
  // Use mysql2 (promise) pool
  const mysql = require('mysql2/promise');

  const pool = mysql.createPool({
    host: process.env.MYSQLHOST || undefined,
    user: process.env.MYSQLUSER || undefined,
    password: process.env.MYSQLPASSWORD || undefined,
    database: process.env.MYSQLDATABASE || undefined,
    port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Export the pool (mysql2 promise pool exposes query that returns [rows, fields])
  module.exports = pool;

} else {
  // Fallback to SQLite with a small promise wrapper matching mysql2 promise API
  const sqlite3 = require('sqlite3').verbose();
  const dbFile = path.join(__dirname, 'aulapro.db');
  const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('❌ Erro ao abrir SQLite:', err.message);
    else console.log('✅ SQLite conectado em', dbFile);
  });

  function query(sql, params = []) {
    return new Promise((resolve, reject) => {
      const sqlTrim = (sql || '').trim().split(/\s+/)[0].toUpperCase();
      if (sqlTrim === 'SELECT' || sqlTrim === 'PRAGMA') {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows]);
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          // emulate mysql2 result shape partially
          const result = { insertId: this.lastID, affectedRows: this.changes };
          resolve([result]);
        });
      }
    });
  }

  function end() {
    return new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())));
  }

  module.exports = { query, end };
}
