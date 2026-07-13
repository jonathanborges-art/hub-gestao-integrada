import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[aviso] DATABASE_URL não configurada. Configure essa variável de ambiente apontando para o Postgres do Supabase.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
});

export async function query(text, params) {
  return pool.query(text, params);
}
