const db = require('./database');

db.run(`ALTER TABLE alunos ADD COLUMN whatsapp TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('⚠️ A coluna whatsapp já existe.');
    } else {
      console.error('❌ Erro ao alterar tabela:', err.message);
    }
  } else {
    console.log('✅ Coluna whatsapp adicionada com sucesso!');
  }
});
