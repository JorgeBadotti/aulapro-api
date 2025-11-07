const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rotas básicas
app.get('/', (req, res) => res.send('AulaPro API ✅'));
app.get('/sobre', (req, res) => res.send('Servidor AulaPro — criado por Jorge!'));

// Atalho: servir a página CRUD sem a extensão
app.get('/crud', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crud.html'));
});

// Healthcheck route for platforms / load balancers
app.get('/health', (req, res) => res.sendStatus(200));

// ---------- ALUNOS ----------

// LISTAR
app.get('/alunos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, whatsapp FROM alunos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar alunos:', err);
    res.status(500).json({ erro: 'erro ao listar alunos' });
  }
});

// CRIAR
app.post('/alunos', async (req, res) => {
  const { nome, email, whatsapp } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email são obrigatórios' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO alunos (nome, email, whatsapp) VALUES (?, ?, ?)',
      [nome, email, whatsapp || null]
    );
    res.status(201).json({ id: result.insertId, nome, email, whatsapp });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'email já cadastrado' });
    }
    console.error('Erro ao inserir aluno:', err);
    res.status(500).json({ erro: 'erro ao inserir aluno' });
  }
});

// EDITAR
app.put('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, whatsapp } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email são obrigatórios' });
  }

  try {
    const [result] = await db.query(
      'UPDATE alunos SET nome = ?, email = ?, whatsapp = ? WHERE id = ?',
      [nome, email, whatsapp || null, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ erro: 'aluno não encontrado' });

    res.json({ id: Number(id), nome, email, whatsapp });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'email já cadastrado' });
    }
    console.error('Erro ao atualizar aluno:', err);
    res.status(500).json({ erro: 'erro ao atualizar aluno' });
  }
});

// DELETAR
app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM alunos WHERE id = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ erro: 'aluno não encontrado' });

    res.json({ ok: true, id: Number(id) });
  } catch (err) {
    console.error('Erro ao deletar aluno:', err);
    res.status(500).json({ erro: 'erro ao deletar aluno' });
  }
});

// Start server (capture the server instance so we can log actual bind address and close gracefully)
const server = app.listen(PORT, () => {
  const addr = server.address();
  const host = addr && addr.address ? addr.address : '0.0.0.0';
  const port = addr && addr.port ? addr.port : PORT;
  // If host is an IPv6 address (contains ':'), wrap it in [] for proper URL display
  const hostDisplay = String(host).includes(':') ? `[${host}]` : host;
  console.log(`Servidor rodando em http://${hostDisplay}:${port} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// Make EADDRINUSE and other listen errors explicit in logs
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`EADDRINUSE: a porta ${PORT} já está em uso. Verifique processos que possam estar escutando e tente novamente.`);
    process.exit(1);
  }
  console.error('Erro no servidor:', err);
});

// Handle graceful shutdown and errors to aid debugging on platforms like Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido: fechando servidor...');
  server.close(() => {
    console.log('Servidor fechado com sucesso. Saindo.');
    process.exit(0);
  });
  // If after 10s the server didn't close, force exit
  setTimeout(() => {
    console.error('Timeout ao fechar servidor, forçando exit.');
    process.exit(1);
  }, 10000).unref();
});

process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  // optional: give a moment to flush logs
  setTimeout(() => process.exit(1), 1000).unref();
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
});
