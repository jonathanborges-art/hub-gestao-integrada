import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { toCamel, toCamelRows } from '../db/case.js';

const router = Router();

// ---------- Clínicas ----------
router.get('/clinicas', async (req, res) => {
  const { rows } = await pool.query(`
    select
      c.*,
      (select count(*) from patients p where p.clinic_id = c.id) as total_pacientes,
      (select count(*) from users u where u.clinic_id = c.id and u.ativo = true) as total_usuarios,
      (select coalesce(sum(valor),0) from financial_transactions t where t.clinic_id = c.id and t.tipo='receita' and t.status='pago') as faturamento_total,
      (select max(created_at) from appointments a where a.clinic_id = c.id) as ultima_atividade
    from clinics c
    order by c.created_at desc
  `);
  res.json(toCamelRows(rows));
});

router.put('/clinicas/:id', async (req, res) => {
  const { ativo, plano } = req.body;
  const sets = [];
  const values = [req.params.id];
  if (ativo !== undefined) { values.push(ativo); sets.push(`ativo = $${values.length}`); }
  if (plano !== undefined) { values.push(plano); sets.push(`plano = $${values.length}`); }
  if (sets.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
  const { rows } = await pool.query(`update clinics set ${sets.join(', ')} where id = $1 returning *`, values);
  if (!rows[0]) return res.status(404).json({ error: 'Clínica não encontrada' });
  res.json(toCamel(rows[0]));
});

// ---------- Usuários (todas as clínicas) ----------
router.get('/usuarios', async (req, res) => {
  const { rows } = await pool.query(`
    select u.id, u.clinic_id, u.nome, u.email, u.perfil, u.ativo, u.created_at, c.nome as clinica_nome
    from users u left join clinics c on c.id = u.clinic_id
    order by u.created_at desc
  `);
  res.json(toCamelRows(rows));
});

router.put('/usuarios/:id', async (req, res) => {
  const { ativo, perfil } = req.body;
  const sets = [];
  const values = [req.params.id];
  if (ativo !== undefined) { values.push(ativo); sets.push(`ativo = $${values.length}`); }
  if (perfil !== undefined) { values.push(perfil); sets.push(`perfil = $${values.length}`); }
  if (sets.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
  const { rows } = await pool.query(`update users set ${sets.join(', ')} where id = $1 returning id, clinic_id, nome, email, perfil, ativo`, values);
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(toCamel(rows[0]));
});

router.post('/usuarios', async (req, res) => {
  const { nome, email, senha, perfil, clinicId } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
  const emailNorm = email.trim().toLowerCase();
  const existente = await pool.query('select id from users where email = $1', [emailNorm]);
  if (existente.rows[0]) return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
  const passwordHash = await bcrypt.hash(senha, 10);
  const { rows } = await pool.query(
    `insert into users (clinic_id, nome, email, password_hash, perfil, ativo) values ($1,$2,$3,$4,$5,true)
     returning id, clinic_id, nome, email, perfil, ativo`,
    [clinicId || null, nome, emailNorm, passwordHash, perfil || 'Master']
  );
  res.status(201).json(toCamel(rows[0]));
});

// ---------- Notificações (banner nas clínicas) ----------
router.get('/notificacoes', async (req, res) => {
  const { rows } = await pool.query(`select * from notifications order by created_at desc limit 50`);
  res.json(toCamelRows(rows));
});

router.post('/notificacoes', async (req, res) => {
  const { titulo, mensagem } = req.body;
  if (!titulo || !mensagem) return res.status(400).json({ error: 'Preencha título e mensagem.' });
  const { rows } = await pool.query(
    `insert into notifications (titulo, mensagem, criado_por, ativa) values ($1,$2,$3,true) returning *`,
    [titulo, mensagem, req.userId]
  );
  res.status(201).json(toCamel(rows[0]));
});

router.put('/notificacoes/:id', async (req, res) => {
  const { ativa } = req.body;
  const { rows } = await pool.query(`update notifications set ativa=$1 where id=$2 returning *`, [ativa, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Não encontrada' });
  res.json(toCamel(rows[0]));
});

// ---------- Visão geral (KPIs do topo do painel Master) ----------
router.get('/resumo', async (req, res) => {
  const [clinicas, usuarios, faturamento, pacientes] = await Promise.all([
    pool.query(`select count(*) qtd, count(*) filter (where ativo) ativas from clinics`),
    pool.query(`select count(*) qtd from users where clinic_id is not null and ativo=true`),
    pool.query(`select coalesce(sum(valor),0) total from financial_transactions where tipo='receita' and status='pago'`),
    pool.query(`select count(*) qtd from patients`),
  ]);
  res.json({
    totalClinicas: Number(clinicas.rows[0].qtd),
    clinicasAtivas: Number(clinicas.rows[0].ativas),
    totalUsuarios: Number(usuarios.rows[0].qtd),
    faturamentoTotalPlataforma: Number(faturamento.rows[0].total),
    totalPacientes: Number(pacientes.rows[0].qtd),
  });
});

export default router;
