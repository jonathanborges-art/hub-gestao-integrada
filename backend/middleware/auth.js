import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'hub-gestao-integrada-dev-secret-troque-em-producao';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

// Token especial que o painel Master usa para "acessar como" uma clínica específica.
// Validade curta (4h) porque dá acesso total de leitura/escrita aos dados daquela clínica.
export function signImpersonationToken(masterUserId, clinicId) {
  return jwt.sign({ sub: masterUserId, act: 'impersonate', clinicId }, JWT_SECRET, { expiresIn: '4h' });
}

// Valida o token e carrega clinic_id/perfil atuais do usuário (não confia só no que está no token,
// assim uma conta desativada ou com clínica trocada perde acesso imediatamente).
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado. Faça login novamente.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Token de "acessar como clínica" emitido pelo painel Master
    if (payload.act === 'impersonate') {
      const { rows } = await pool.query('select id, perfil, ativo from users where id = $1', [payload.sub]);
      const master = rows[0];
      if (!master || master.perfil !== 'Master' || master.ativo === false) {
        return res.status(401).json({ error: 'Sessão Master inválida. Faça login novamente.' });
      }
      const { rows: clinicRows } = await pool.query('select id, ativo from clinics where id = $1', [payload.clinicId]);
      if (!clinicRows[0]) return res.status(404).json({ error: 'Clínica não encontrada.' });
      if (clinicRows[0].ativo === false) return res.status(403).json({ error: 'Esta clínica está suspensa.' });

      req.userId = master.id;
      req.clinicId = payload.clinicId;
      req.userPerfil = 'Master';
      req.isImpersonating = true;
      return next();
    }

    // Login normal
    const { rows } = await pool.query('select id, clinic_id, perfil, ativo from users where id = $1', [payload.sub]);
    const user = rows[0];
    if (!user || user.ativo === false) {
      return res.status(401).json({ error: 'Sessão inválida ou usuário desativado. Faça login novamente.' });
    }
    req.userId = user.id;
    req.clinicId = user.clinic_id;
    req.userPerfil = user.perfil;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

// Usado nas rotas /api/*: exige clínica válida (bloqueia contas Master, que não têm clinic_id,
// exceto quando estão "acessando como" uma clínica via impersonation).
export function requireClinic(req, res, next) {
  if (!req.clinicId) return res.status(403).json({ error: 'Esta conta não está vinculada a uma clínica.' });
  next();
}

// Usado nas rotas /api/master/*: exige perfil Master.
export function masterOnly(req, res, next) {
  if (req.userPerfil !== 'Master') return res.status(403).json({ error: 'Acesso restrito à equipe Master.' });
  next();
}
