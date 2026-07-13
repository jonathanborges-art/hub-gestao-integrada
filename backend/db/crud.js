import { Router } from 'express';
import { pool } from './pool.js';
import { toCamel, toCamelRows, camelToSnake } from './case.js';

/**
 * Cria um router CRUD para uma tabela, sempre filtrando por clinic_id
 * (isolamento entre clínicas). `allowedColumns` é a lista (em snake_case)
 * de colunas que podem ser lidas/gravadas via essa rota — nunca aceitamos
 * nomes de coluna vindos direto do corpo da requisição sem checar essa lista.
 */
export function crudRouter(table, allowedColumns, { orderBy = null } = {}) {
  const router = Router();

  router.get('/', async (req, res) => {
    const sql = `select * from ${table} where clinic_id = $1${orderBy ? ` order by ${orderBy}` : ''}`;
    const { rows } = await pool.query(sql, [req.clinicId]);
    res.json(toCamelRows(rows));
  });

  router.get('/:id', async (req, res) => {
    const { rows } = await pool.query(`select * from ${table} where id = $1 and clinic_id = $2`, [req.params.id, req.clinicId]);
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' });
    res.json(toCamel(rows[0]));
  });

  router.post('/', async (req, res) => {
    const entries = Object.entries(req.body).filter(([k]) => allowedColumns.includes(camelToSnake(k)));
    const cols = ['clinic_id', ...entries.map(([k]) => camelToSnake(k))];
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const values = [req.clinicId, ...entries.map(([, v]) => v)];
    const sql = `insert into ${table} (${cols.join(', ')}) values (${placeholders.join(', ')}) returning *`;
    const { rows } = await pool.query(sql, values);
    res.status(201).json(toCamel(rows[0]));
  });

  router.put('/:id', async (req, res) => {
    const entries = Object.entries(req.body).filter(([k]) => allowedColumns.includes(camelToSnake(k)));
    if (entries.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
    const sets = entries.map(([k], i) => `${camelToSnake(k)} = $${i + 3}`);
    const values = [req.params.id, req.clinicId, ...entries.map(([, v]) => v)];
    const sql = `update ${table} set ${sets.join(', ')} where id = $1 and clinic_id = $2 returning *`;
    const { rows } = await pool.query(sql, values);
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' });
    res.json(toCamel(rows[0]));
  });

  router.delete('/:id', async (req, res) => {
    await pool.query(`delete from ${table} where id = $1 and clinic_id = $2`, [req.params.id, req.clinicId]);
    res.status(204).end();
  });

  return router;
}
