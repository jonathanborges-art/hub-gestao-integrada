import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getDB } from '../db.js';
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
  }
  const db = await getDB();
  const emailNorm = email.trim().toLowerCase();
  const existente = db.data.users.find(u => (u.email || '').toLowerCase() === emailNorm);
  if (existente) {
    return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
  }
  const passwordHash = await bcrypt.hash(senha, 10);
  const user = {
    id: uuid(),
    nome,
    email: emailNorm,
    passwordHash,
    perfil: db.data.users.length === 0 ? 'Administrador' : 'Recepção',
    ativo: true,
    criadoEm: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });
  const db = await getDB();
  const emailNorm = email.trim().toLowerCase();
  const user = db.data.users.find(u => (u.email || '').toLowerCase() === emailNorm);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }
  const ok = await bcrypt.compare(senha, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  if (user.ativo === false) return res.status(403).json({ error: 'Este usuário está desativado.' });
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', authMiddleware, async (req, res) => {
  const db = await getDB();
  const user = db.data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(user) });
});

export default router;
