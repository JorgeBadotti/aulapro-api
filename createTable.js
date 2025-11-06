// createTable.js
const db = require('./database');

(async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS alunos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        whatsapp VARCHAR(20)
      );
    `;
    await db.query(sql);
    console.log('✅ Tabela "alunos" criada ou já existente.');
  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err.message);
  } finally {
    db.end();
  }
})();
