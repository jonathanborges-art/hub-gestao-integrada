import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { getDB } from './db.js';

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
  const db = await getDB();

  const professionals = [
    { id: uuid(), nome: 'Dra. Camila Zanotti', especialidade: 'Clínica Geral', comissaoPercentual: 30, cor: '#017A5B', ativo: true, email: 'camila.zanotti@clinicavitoria.com.br', telefone: '(27) 99123-4001' },
    { id: uuid(), nome: 'Dr. Rafael Bringuenti', especialidade: 'Odontologia', comissaoPercentual: 35, cor: '#0EA5A0', ativo: true, email: 'rafael.bringuenti@clinicavitoria.com.br', telefone: '(27) 99123-4002' },
    { id: uuid(), nome: 'Dra. Larissa Comarela', especialidade: 'Dermatologia Estética', comissaoPercentual: 40, cor: '#C77D2E', ativo: true, email: 'larissa.comarela@clinicavitoria.com.br', telefone: '(27) 99123-4003' },
    { id: uuid(), nome: 'Dr. Thiago Salaroli', especialidade: 'Psicologia', comissaoPercentual: 25, cor: '#6D5AE6', ativo: true, email: 'thiago.salaroli@clinicavitoria.com.br', telefone: '(27) 99123-4004' },
  ];

  const nomesPacientes = [
    'Ana Beatriz Xavier', 'Bruno Kruger Loureiro', 'Carla Daflon Siqueira', 'Diego Merçon Falqueto',
    'Elisa Guerra Bissoli', 'Felipe Zandonadi Neves', 'Giovanna Peçanha Rios', 'Henrique Coser Tonon',
    'Isabela Boldrini Marchezi', 'João Vitor Sartório', 'Karina Gama Bastianello', 'Leonardo Persim Vieira',
    'Mariana Cauper Estevam', 'Nicolas Zago Reblin', 'Otávio Lírio Bragança', 'Patrícia Nunes Osório',
    'Rodrigo Almada Freitas', 'Sabrina Tosi Grillo', 'Thales Colnago Vervloet', 'Yasmin Debiasi Rangel',
    'Vinícius Pignaton Corte', 'Camila Loss Barcelos', 'Eduardo Sardenberg Miranda', 'Luiza Falqueto Gomes',
  ];
  const bairrosVix = ['Enseada do Suá', 'Jardim Camburi', 'Praia do Canto', 'Jardim da Penha', 'Mata da Praia', 'Bento Ferreira', 'Santa Lúcia', 'Ilha do Boi'];
  const convenios = ['Particular', 'Unimed Vitória', 'Bradesco Saúde', 'Amil', 'SulAmérica', 'Particular'];
  const tags = [['VIP'], ['Indicação'], ['Retorno frequente'], ['Novo paciente'], [], ['Convênio']];

  const patients = nomesPacientes.map((nome, i) => ({
    id: uuid(),
    nome,
    fotoUrl: '',
    dataNascimento: dayjs().subtract(randInt(18, 75), 'year').subtract(randInt(0, 300), 'day').format('YYYY-MM-DD'),
    cpf: `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`,
    telefone: `(27) 9${randInt(8000, 9999)}-${randInt(1000, 9999)}`,
    email: nome.toLowerCase().replace(/[^a-zãõáéíóúâêôç ]/gi, '').trim().replace(/\s+/g, '.') + '@email.com',
    endereco: `Rua ${rand(['das Palmeiras', 'Aleixo Netto', 'Desembargador Sampaio', 'Sete de Setembro', 'Jerônimo Monteiro'])}, ${randInt(10, 999)} - ${rand(bairrosVix)}, Vitória - ES`,
    convenio: rand(convenios),
    tags: rand(tags),
    lgpdAceite: true,
    lgpdData: dayjs().subtract(randInt(10, 400), 'day').format('YYYY-MM-DD'),
    criadoEm: dayjs().subtract(randInt(5, 500), 'day').toISOString(),
    ativo: true,
  }));

  const statusAppt = ['agendado', 'confirmado', 'concluido', 'faltou', 'cancelado'];
  const tiposAppt = ['Consulta', 'Retorno', 'Avaliação', 'Procedimento', 'Sessão'];
  const appointments = [];
  for (let d = -20; d <= 10; d++) {
    const day = dayjs().add(d, 'day');
    if (day.day() === 0) continue; // sem domingo
    const qtd = randInt(2, 7);
    for (let i = 0; i < qtd; i++) {
      const prof = rand(professionals);
      const hour = randInt(8, 18);
      const isPast = d < 0;
      appointments.push({
        id: uuid(),
        pacienteId: rand(patients).id,
        profissionalId: prof.id,
        data: day.format('YYYY-MM-DD'),
        horaInicio: `${String(hour).padStart(2, '0')}:${rand(['00', '30'])}`,
        duracaoMinutos: rand([30, 45, 60]),
        tipo: rand(tiposAppt),
        status: isPast ? rand(['concluido', 'concluido', 'concluido', 'faltou', 'cancelado']) : rand(['agendado', 'confirmado']),
        valor: randInt(120, 480),
        observacoes: '',
        criadoEm: day.subtract(randInt(1, 15), 'day').toISOString(),
      });
    }
  }

  const categoriasReceita = ['Consulta', 'Procedimento Estético', 'Convênio', 'Pacote de Sessões'];
  const categoriasDespesa = ['Aluguel', 'Folha de Pagamento', 'Insumos', 'Marketing', 'Material Odontológico', 'Contas (água/luz/internet)', 'Software/Assinaturas'];
  const financialTransactions = [];
  for (let m = -2; m <= 0; m++) {
    const baseMonth = dayjs().add(m, 'month');
    for (let i = 0; i < randInt(18, 26); i++) {
      const day = baseMonth.date(randInt(1, baseMonth.daysInMonth()));
      financialTransactions.push({
        id: uuid(),
        tipo: 'receita',
        categoria: rand(categoriasReceita),
        descricao: `${rand(categoriasReceita)} - ${rand(patients).nome}`,
        valor: randInt(150, 650),
        data: day.format('YYYY-MM-DD'),
        status: day.isAfter(dayjs()) ? 'pendente' : 'pago',
        formaPagamento: rand(['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Convênio']),
        profissionalId: rand(professionals).id,
      });
    }
    for (let i = 0; i < randInt(6, 10); i++) {
      const day = baseMonth.date(randInt(1, baseMonth.daysInMonth()));
      financialTransactions.push({
        id: uuid(),
        tipo: 'despesa',
        categoria: rand(categoriasDespesa),
        descricao: rand(categoriasDespesa),
        valor: randInt(200, 8500),
        data: day.format('YYYY-MM-DD'),
        status: day.isAfter(dayjs()) ? 'pendente' : 'pago',
        formaPagamento: rand(['PIX', 'Boleto', 'Débito Automático']),
        profissionalId: null,
      });
    }
  }

  const clinicalRecords = patients.slice(0, 14).map((p) => ({
    id: uuid(),
    pacienteId: p.id,
    profissionalId: rand(professionals).id,
    data: dayjs().subtract(randInt(1, 60), 'day').format('YYYY-MM-DD'),
    evolucao: rand([
      'Paciente relata melhora significativa do quadro. Mantida conduta atual.',
      'Realizada avaliação inicial. Solicitados exames complementares.',
      'Procedimento realizado sem intercorrências. Retorno em 30 dias.',
      'Ajuste de conduta terapêutica conforme evolução clínica.',
    ]),
  }));

  const origensLead = ['Instagram Ads', 'Google Ads', 'Indicação', 'WhatsApp', 'Site'];
  const etapasFunil = ['Novo Contato', 'Qualificado', 'Agendou Avaliação', 'Compareceu', 'Fechou Pacote', 'Perdido'];
  const leads = Array.from({ length: 16 }).map(() => ({
    id: uuid(),
    nome: rand(['Marcos Vidigal', 'Renata Coutinho', 'Diego Fardin', 'Priscila Mattedi', 'Gustavo Randi', 'Fernanda Biazus']),
    telefone: `(27) 9${randInt(8000, 9999)}-${randInt(1000, 9999)}`,
    origem: rand(origensLead),
    etapa: rand(etapasFunil),
    valorPotencial: randInt(200, 3000),
    criadoEm: dayjs().subtract(randInt(0, 30), 'day').toISOString(),
  }));

  const users = [
    { id: uuid(), nome: 'Jonathan Batista', email: 'jonathan@clinicavitoria.com.br', perfil: 'Administrador', ativo: true },
    { id: uuid(), nome: 'Fernanda Recepção', email: 'fernanda@clinicavitoria.com.br', perfil: 'Recepção', ativo: true },
    { id: uuid(), nome: 'Contador Externo', email: 'financeiro@clinicavitoria.com.br', perfil: 'Financeiro', ativo: true },
    ...professionals.map(p => ({ id: uuid(), nome: p.nome, email: p.email, perfil: 'Médico', ativo: true })),
  ];

  db.data.professionals = professionals;
  db.data.patients = patients;
  db.data.appointments = appointments;
  db.data.financialTransactions = financialTransactions;
  db.data.clinicalRecords = clinicalRecords;
  db.data.leads = leads;
  db.data.users = users;
  db.data.activityLogs = [];

  await db.write();
  console.log(`Seed concluído: ${patients.length} pacientes, ${appointments.length} agendamentos, ${financialTransactions.length} lançamentos financeiros.`);
}

seed();
