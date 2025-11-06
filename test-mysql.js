const mysql = require('mysql2/promise');

async function test() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('Nenhuma variável DATABASE_URL encontrada. Defina $env:DATABASE_URL antes de executar.');
      process.exit(1);
    }

    console.log('Tentando conectar usando DATABASE_URL:', url);
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('Conexão OK, resultado:', rows);
    await conn.end();
  } catch (err) {
    console.error('Falha ao conectar ao MySQL:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

test();
