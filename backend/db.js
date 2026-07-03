import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'data', 'db.json');

const defaultData = {
  clinic: {
    id: 'clinic-001',
    nome: 'Clínica Vitória Saúde Integrada',
    cnpj: '28.114.987/0001-52',
    endereco: 'Av. Nossa Senhora dos Navegantes, 955 - Enseada do Suá, Vitória - ES',
    telefone: '(27) 3345-8820',
    whatsapp: '(27) 99811-4477',
    logoUrl: '',
    corPrimaria: '#017A5B',
    metaFaturamentoMensal: 185000,
  },
  professionals: [],
  patients: [],
  appointments: [],
  financialTransactions: [],
  clinicalRecords: [],
  leads: [],
  trafficDaily: [],
  marketingSpend: { mes: '', total: 0, porCanal: {} },
  comercialActivities: [],
  metasComerciais: { leadsAlvo: 0, agendamentosAlvo: 0, vendasAlvo: 0, faturamentoAlvo: 0, cacAlvo: 0 },
  users: [],
  activityLogs: [],
};

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await JSONFilePreset(dbFile, defaultData);
  return dbInstance;
}
