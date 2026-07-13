import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { toCamel } from '../db/case.js';

const router = Router();

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return toCamel(rest);
}

// Cria uma clínica nova + o usuário como Administrador dela.
// (Cada cadastro é uma clínica nova e independente — isolamento total de dados.)
router.post('/register', async (req, res) => {
  const { nome, email, senha, nomeClinica } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
  }
  const emailNorm = email.trim().toLowerCase();

  const existente = await pool.query('select id from users where email = $1', [emailNorm]);
  if (existente.rows[0]) {
    return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const clinica = await client.query(
      'insert into clinics (nome) values ($1) returning id',
      [nomeClinica || `Clínica de ${nome}`]
    );
    const clinicId = clinica.rows[0].id;
    const passwordHash = await bcrypt.hash(senha, 10);
    const user = await client.query(
      `insert into users (clinic_id, nome, email, password_hash, perfil, ativo)
       values ($1, $2, $3, $4, 'Administrador', true) returning *`,
      [clinicId, nome, emailNorm, passwordHash]
    );
    await client.query('COMMIT');
    const token = signToken(user.rows[0].id);
    res.status(201).json({ token, user: publicUser(user.rows[0]) });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Não foi possível criar a conta. Tente novamente.' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });
  const emailNorm = email.trim().toLowerCase();
  const { rows } = await pool.query('select * from users where email = $1', [emailNorm]);
  const user = rows[0];
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }
  const ok = await bcrypt.compare(senha, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  if (user.ativo === false) return res.status(403).json({ error: 'Este usuário está desativado.' });
  const token = signToken(user.id);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query('select * from users where id = $1', [req.userId]);
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(rows[0]) });
});

export default router;
