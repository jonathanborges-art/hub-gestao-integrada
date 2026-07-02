import { Router } from 'express';
import dayjs from 'dayjs';
import { getDB } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = await getDB();
  const { patients, appointments, financialTransactions, professionals } = db.data;

  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');

  const isThisMonth = (d) => dayjs(d).isAfter(startOfMonth.subtract(1, 'day')) && dayjs(d).isBefore(endOfMonth.add(1, 'day'));

  const receitasMes = financialTransactions.filter(t => t.tipo === 'receita' && t.status === 'pago' && isThisMonth(t.data));
  const despesasMes = financialTransactions.filter(t => t.tipo === 'despesa' && t.status === 'pago' && isThisMonth(t.data));
  const faturamentoMes = receitasMes.reduce((s, t) => s + t.valor, 0);
  const despesaMesTotal = despesasMes.reduce((s, t) => s + t.valor, 0);

  const contasReceber = financialTransactions.filter(t => t.tipo === 'receita' && t.status === 'pendente').reduce((s, t) => s + t.valor, 0);
  const contasPagar = financialTransactions.filter(t => t.tipo === 'despesa' && t.status === 'pendente').reduce((s, t) => s + t.valor, 0);

  const consultasHoje = appointments.filter(a => a.data === today.format('YYYY-MM-DD'));
  const pacientesAtivos = patients.filter(p => p.ativo).length;
  const pacientesNovosMes = patients.filter(p => isThisMonth(p.criadoEm)).length;

  const concluidosMes = appointments.filter(a => isThisMonth(a.data) && (a.status === 'concluido' || a.status === 'faltou'));
  const faltasMes = concluidosMes.filter(a => a.status === 'faltou').length;
  const taxaFaltas = concluidosMes.length ? Math.round((faltasMes / concluidosMes.length) * 100) : 0;

  const ticketMedio = receitasMes.length ? Math.round(faturamentoMes / receitasMes.length) : 0;

  // Ranking de profissionais por faturamento no mês
  const rankingProfissionais = professionals.map(p => {
    const total = receitasMes.filter(t => t.profissionalId === p.id).reduce((s, t) => s + t.valor, 0);
    return { id: p.id, nome: p.nome, especialidade: p.especialidade, total };
  }).sort((a, b) => b.total - a.total);

  // Ranking de procedimentos/categorias
  const categoriaMap = {};
  receitasMes.forEach(t => { categoriaMap[t.categoria] = (categoriaMap[t.categoria] || 0) + t.valor; });
  const rankingProcedimentos = Object.entries(categoriaMap).map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total);

  // Fluxo financeiro últimos 14 dias
  const fluxo = [];
  for (let i = 13; i >= 0; i--) {
    const day = today.subtract(i, 'day').format('YYYY-MM-DD');
    const receitasDia = financialTransactions.filter(t => t.tipo === 'receita' && t.data === day && t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    const despesasDia = financialTransactions.filter(t => t.tipo === 'despesa' && t.data === day && t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    fluxo.push({ data: dayjs(day).format('DD/MM'), receitas: receitasDia, despesas: despesasDia });
  }

  res.json({
    faturamentoMes,
    despesaMesTotal,
    consultasHoje: consultasHoje.length,
    pacientesAtivos,
    pacientesNovosMes,
    ticketMedio,
    taxaFaltas,
    contasReceber,
    contasPagar,
    rankingProfissionais,
    rankingProcedimentos,
    fluxo,
    consultasHojeLista: consultasHoje,
  });
});

export default router;
