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
