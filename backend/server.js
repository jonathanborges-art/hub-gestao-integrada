import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from './db.js';
import { crudRouter } from './routes/crud.js';
import dashboardRouter from './routes/dashboard.js';
import assistantRouter from './routes/assistant.js';
import authRouter from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Rotas públicas de autenticação (cadastro/login não exigem token)
app.use('/api/auth', authRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// A partir daqui, tudo em /api exige login
app.use('/api', authMiddleware);

app.use('/api/pacientes', crudRouter('patients'));
app.use('/api/profissionais', crudRouter('professionals'));
app.use('/api/agendamentos', crudRouter('appointments'));
app.use('/api/financeiro', crudRouter('financialTransactions'));
app.use('/api/prontuarios', crudRouter('clinicalRecords'));
app.use('/api/leads', crudRouter('leads'));
app.use('/api/usuarios', crudRouter('users', ['passwordHash']));

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

// Em produção, o próprio backend serve o frontend já buildado (frontend/dist),
// assim o deploy vira um serviço único (sem precisar de 2 hospedagens + CORS).
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Hub Gestão Integrada - API rodando em http://localhost:${PORT}`);
});
