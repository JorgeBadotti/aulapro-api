require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
    });

    console.log('✅ Conectado ao MySQL! Criando tabela...');

    const sql = `
      CREATE TABLE IF NOT EXISTS alunos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        whatsapp VARCHAR(20),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.query(sql);
    console.log('🎉 Tabela "alunos" criada com sucesso!');
    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
  }
})();
