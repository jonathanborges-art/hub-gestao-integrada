import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('[aviso] DATABASE_URL não configurada. Configure essa variável de ambiente apontando para o Postgres do Supabase.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 8000, // desiste de conectar em 8s, em vez de travar pra sempre
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[pg pool] erro inesperado em conexão ociosa:', err.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}
