import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db/pool.js';
import { crudRouter } from './db/crud.js';
import { toCamel } from './db/case.js';
import { authMiddleware, requireClinic, masterOnly } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import comercialRouter from './routes/comercial.js';
import assistantRouter from './routes/assistant.js';
import masterRouter from './routes/master.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Rotas públicas ----------
app.use('/api/auth', authRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// A partir daqui, tudo exige login
app.use('/api', authMiddleware);

// Notificações ativas: qualquer usuário autenticado (clínica ou Master) pode ver
app.get('/api/notificacoes/ativas', async (req, res) => {
  const { rows } = await pool.query(`select * from notifications where ativa = true order by created_at desc limit 10`);
  res.json(rows.map(toCamel));
});

// ---------- Painel Master (não é escopado por clínica) ----------
app.use('/api/master', masterOnly, masterRouter);

// ---------- A partir daqui, rotas de clínica: exige clinic_id válido ----------
app.use('/api', requireClinic);

app.use('/api/pacientes', crudRouter('patients', [
  'nome', 'foto_url', 'data_nascimento', 'cpf', 'telefone', 'email', 'endereco', 'convenio', 'tags', 'lgpd_aceite', 'lgpd_data', 'ativo',
]));
app.use('/api/profissionais', crudRouter('professionals', [
  'nome', 'especialidade', 'comissao_percentual', 'cor', 'ativo', 'email', 'telefone',
]));
app.use('/api/agendamentos', crudRouter('appointments', [
  'paciente_id', 'profissional_id', 'data', 'hora_inicio', 'duracao_minutos', 'tipo', 'status', 'valor', 'observacoes',
]));
app.use('/api/financeiro', crudRouter('financial_transactions', [
  'tipo', 'categoria', 'descricao', 'valor', 'data', 'status', 'forma_pagamento', 'profissional_id',
]));
app.use('/api/prontuarios', crudRouter('clinical_records', [
  'paciente_id', 'profissional_id', 'data', 'evolucao',
]));
app.use('/api/leads', crudRouter('leads', [
  'nome', 'telefone', 'origem', 'criado_em', 'agendou', 'compareceu', 'propos', 'fechou', 'valor_fechado',
]));
app.use('/api/comercial-agendamentos', crudRouter('comercial_activities', [
  'hora', 'tipo', 'com', 'status',
]));

app.get('/api/usuarios', async (req, res) => {
  const { rows } = await pool.query('select id, nome, email, perfil, ativo, created_at from users where clinic_id = $1 order by created_at', [req.clinicId]);
  res.json(rows.map(toCamel));
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/comercial', comercialRouter);
app.use('/api/assistente', assistantRouter);

app.get('/api/trafego', async (req, res) => {
  const [traffic, spend] = await Promise.all([
    pool.query('select * from traffic_daily where clinic_id=$1 order by data', [req.clinicId]),
    pool.query('select * from marketing_spend where clinic_id=$1 order by mes desc limit 1', [req.clinicId]),
  ]);
  res.json({
    trafficDaily: traffic.rows.map(toCamel),
    marketingSpend: spend.rows[0] ? toCamel(spend.rows[0]) : { total: 0, porCanal: {} },
  });
});

app.get('/api/metas', async (req, res) => {
  const { rows } = await pool.query('select * from metas_comerciais where clinic_id=$1', [req.clinicId]);
  res.json(rows[0] ? toCamel(rows[0]) : { leadsAlvo: 0, agendamentosAlvo: 0, vendasAlvo: 0, faturamentoAlvo: 0, cacAlvo: 0 });
});

app.put('/api/metas', async (req, res) => {
  const { leadsAlvo, agendamentosAlvo, vendasAlvo, faturamentoAlvo, cacAlvo } = req.body;
  const { rows } = await pool.query(
    `insert into metas_comerciais (clinic_id, leads_alvo, agendamentos_alvo, vendas_alvo, faturamento_alvo, cac_alvo)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (clinic_id) do update set leads_alvo=$2, agendamentos_alvo=$3, vendas_alvo=$4, faturamento_alvo=$5, cac_alvo=$6
     returning *`,
    [req.clinicId, leadsAlvo, agendamentosAlvo, vendasAlvo, faturamentoAlvo, cacAlvo]
  );
  res.json(toCamel(rows[0]));
});

app.get('/api/clinica', async (req, res) => {
  const { rows } = await pool.query('select * from clinics where id=$1', [req.clinicId]);
  if (!rows[0]) return res.status(404).json({ error: 'Clínica não encontrada' });
  res.json(toCamel(rows[0]));
});

app.put('/api/clinica', async (req, res) => {
  const { nome, cnpj, endereco, telefone, whatsapp, corPrimaria, metaFaturamentoMensal } = req.body;
  const { rows } = await pool.query(
    `update clinics set nome=coalesce($2,nome), cnpj=coalesce($3,cnpj), endereco=coalesce($4,endereco),
     telefone=coalesce($5,telefone), whatsapp=coalesce($6,whatsapp), cor_primaria=coalesce($7,cor_primaria),
     meta_faturamento_mensal=coalesce($8,meta_faturamento_mensal)
     where id=$1 returning *`,
    [req.clinicId, nome, cnpj, endereco, telefone, whatsapp, corPrimaria, metaFaturamentoMensal]
  );
  res.json(toCamel(rows[0]));
});

// ---------- Em produção, o backend também serve o frontend já buildado ----------
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => { if (err) next(); });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Hub Gestão Integrada - API rodando em http://localhost:${PORT}`);
});
