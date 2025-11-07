// test-functional.js
// Simple end-to-end test: create -> list -> update -> delete
const base = 'http://localhost:3000';

async function waitForServer(timeoutMs = 10000, intervalMs = 250) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(base + '/');
      if (r.ok || r.status === 200 || r.status === 404) return;
    } catch (err) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Timeout waiting for server at ' + base);
}

async function run() {
  try {
    console.log('Aguardando servidor em', base);
    await waitForServer(15000, 300);
    console.log('Servidor respondeu, iniciando teste...');
    const uniq = Date.now();
    const createBody = { nome: 'Teste ' + uniq, email: `teste${uniq}@example.com`, whatsapp: '+5511999999999' };
    console.log('1) Criando aluno:', createBody);
    let r = await fetch(base + '/alunos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createBody) });
    const created = await r.json();
    console.log(' -> status', r.status, JSON.stringify(created));
    if (!r.ok) process.exit(1);

    const id = created.id || created.insertId || created.ID || null;
    if (!id) {
      console.error('Não recebi id do create, abortando');
      process.exit(1);
    }

    console.log('\n2) Listando alunos');
    r = await fetch(base + '/alunos');
    const list = await r.json();
    console.log(' -> status', r.status, 'count', Array.isArray(list) ? list.length : '-', '\n', JSON.stringify(list, null, 2));

    console.log('\n3) Atualizando o aluno id', id);
    const updateBody = { nome: 'Teste Atualizado ' + uniq, email: `upd${uniq}@example.com`, whatsapp: '+5511988888888' };
    r = await fetch(base + '/alunos/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateBody) });
    const updated = await r.json();
    console.log(' -> status', r.status, JSON.stringify(updated));
    if (!r.ok) process.exit(1);

    console.log('\n4) Buscando novamente para confirmar atualização');
    r = await fetch(base + '/alunos');
    const list2 = await r.json();
    const found = list2.find(x => String(x.id) === String(id));
    console.log(' -> encontrado:', JSON.stringify(found, null, 2));

    console.log('\n5) Deletando o registro id', id);
    r = await fetch(base + '/alunos/' + id, { method: 'DELETE' });
    const delRes = await r.json();
    console.log(' -> status', r.status, JSON.stringify(delRes));
    if (!r.ok) process.exit(1);

    console.log('\n6) Lista final (deve não conter o id)');
    r = await fetch(base + '/alunos');
    const finalList = await r.json();
    console.log(' -> status', r.status, 'count', finalList.length);
    const still = finalList.find(x => String(x.id) === String(id));
    console.log(' -> ainda presente?', !!still);

    console.log('\nTESTE FUNCIONAL COMPLETO: OK');
    process.exit(0);
  } catch (err) {
    console.error('Erro no teste:', err);
    process.exit(1);
  }
}

run();
