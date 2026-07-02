import express from 'express';
import cors from 'cors';
import { getDB } from './db.js';
import { crudRouter } from './routes/crud.js';
import dashboardRouter from './routes/dashboard.js';
import assistantRouter from './routes/assistant.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/pacientes', crudRouter('patients'));
app.use('/api/profissionais', crudRouter('professionals'));
app.use('/api/agendamentos', crudRouter('appointments'));
app.use('/api/financeiro', crudRouter('financialTransactions'));
app.use('/api/prontuarios', crudRouter('clinicalRecords'));
app.use('/api/leads', crudRouter('leads'));
app.use('/api/usuarios', crudRouter('users'));

app.use('/api/dashboard', dashboardRouter);
app.use('/api/assistente', assistantRouter);

app.get('/api/clinica', async (req, res) => {
  const db = await getDB();
  res.json(db.data.clinic);
});

app.put('/api/clinica', async (req, res) => {
  const db = await getDB();
  db.data.clinic = { ...db.data.clinic, ...req.body };
  await db.write();
  res.json(db.data.clinic);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Hub Gestão Integrada - API rodando em http://localhost:${PORT}`);
});
