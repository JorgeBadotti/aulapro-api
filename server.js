// server.js
const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080; // ✅ Railway define PORT automaticamente

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para <form>
app.use(express.static('public')); // serve index.html, api.html, etc.

// --- ROTAS ---
// Rota raiz — mostra status da API
app.get('/', (req, res) => {
  res.send('AulaPro API ✅ Servidor ativo no Railway!');
});

app.get('/sobre', (req, res) => {
  res.send('Servidor AulaPro — criado por Jorge!');
});

// ---------- ALUNOS ----------

// LISTAR
app.get('/alunos', (req, res) => {
  const sql = 'SELECT id, nome, email, whatsapp FROM alunos ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'erro ao listar alunos' });
    res.json(rows);
  });
});

// CRIAR
app.post('/alunos', (req, res) => {
  const { nome, email, whatsapp } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email são obrigatórios' });
  }

  const sql = 'INSERT INTO alunos (nome, email, whatsapp) VALUES (?, ?, ?)';
  db.run(sql, [nome, email, whatsapp || null], function (err) {
    if (err) {
      if (err.message?.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'email já cadastrado' });
      }
      return res.status(500).json({ erro: 'erro ao inserir aluno' });
    }
    res.status(201).json({ id: this.lastID, nome, email, whatsapp: whatsapp || null });
  });
});

// EDITAR
app.put('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, whatsapp } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email são obrigatórios' });
  }

  const sql = 'UPDATE alunos SET nome = ?, email = ?, whatsapp = ? WHERE id = ?';
  db.run(sql, [nome, email, whatsapp || null, id], function (err) {
    if (err) {
      if (err.message?.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'email já cadastrado' });
      }
      return res.status(500).json({ erro: 'erro ao atualizar aluno' });
    }
    if (this.changes === 0) return res.status(404).json({ erro: 'aluno não encontrado' });
    res.json({ id: Number(id), nome, email, whatsapp: whatsapp || null });
  });
});

// DELETAR
app.delete('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM alunos WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ erro: 'erro ao deletar aluno' });
    if (this.changes === 0) return res.status(404).json({ erro: 'aluno não encontrado' });
    res.json({ ok: true, id: Number(id) });
  });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => { // ✅ precisa usar 0.0.0.0 no Railway
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
