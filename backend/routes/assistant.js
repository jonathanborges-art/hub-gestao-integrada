import { Router } from 'express';
import dayjs from 'dayjs';
import { getDB } from '../db.js';

const router = Router();

// Assistente baseado em regras que analisa os dados reais da clínica.
// Não depende de nenhuma API externa, então funciona totalmente offline.
router.post('/query', async (req, res) => {
  const { message } = req.body;
  const db = await getDB();
  const { patients, appointments, financialTransactions, professionals } = db.data;
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const msg = (message || '').toLowerCase();

  const isThisMonth = (d) => dayjs(d).isAfter(startOfMonth.subtract(1, 'day'));

  let resposta = '';

  if (msg.includes('fatur') || msg.includes('receita')) {
    const receitasMes = financialTransactions.filter(t => t.tipo === 'receita' && t.status === 'pago' && isThisMonth(t.data));
    const total = receitasMes.reduce((s, t) => s + t.valor, 0);
    const meta = db.data.clinic.metaFaturamentoMensal;
    const pct = Math.round((total / meta) * 100);
    resposta = `O faturamento deste mês está em R$ ${total.toLocaleString('pt-BR')}, o que representa ${pct}% da meta de R$ ${meta.toLocaleString('pt-BR')}. ${pct >= 100 ? 'Meta batida! 🎉' : `Faltam R$ ${(meta - total).toLocaleString('pt-BR')} para bater a meta do mês.`}`;
  } else if (msg.includes('falta') || msg.includes('no-show') || msg.includes('não compareceu')) {
    const concluidos = appointments.filter(a => isThisMonth(a.data) && (a.status === 'concluido' || a.status === 'faltou'));
    const faltas = concluidos.filter(a => a.status === 'faltou');
    const taxa = concluidos.length ? Math.round((faltas.length / concluidos.length) * 100) : 0;
    resposta = `A taxa de faltas deste mês é de ${taxa}% (${faltas.length} faltas em ${concluidos.length} atendimentos concluídos). ${taxa > 15 ? 'Isso está acima do ideal — considere ativar confirmação automática por WhatsApp 24h antes da consulta.' : 'Isso está dentro de um patamar saudável.'}`;
  } else if (msg.includes('inativ') || msg.includes('recupera')) {
    const idsComConsultaRecente = new Set(appointments.filter(a => dayjs(a.data).isAfter(today.subtract(60, 'day'))).map(a => a.pacienteId));
    const inativos = patients.filter(p => p.ativo && !idsComConsultaRecente.has(p.id));
    resposta = `Encontrei ${inativos.length} pacientes sem consultas nos últimos 60 dias. Recomendo uma campanha de reativação via WhatsApp oferecendo retorno ou avaliação gratuita.${inativos.length ? ' Alguns nomes: ' + inativos.slice(0, 5).map(p => p.nome).join(', ') + '.' : ''}`;
  } else if (msg.includes('profission') || msg.includes('ranking') || msg.includes('desempenho')) {
    const receitasMes = financialTransactions.filter(t => t.tipo === 'receita' && t.status === 'pago' && isThisMonth(t.data));
    const ranking = professionals.map(p => ({
      nome: p.nome,
      total: receitasMes.filter(t => t.profissionalId === p.id).reduce((s, t) => s + t.valor, 0),
    })).sort((a, b) => b.total - a.total);
    resposta = `Ranking de faturamento do mês:\n${ranking.map((r, i) => `${i + 1}. ${r.nome} — R$ ${r.total.toLocaleString('pt-BR')}`).join('\n')}`;
  } else if (msg.includes('previs') || msg.includes('próximo mês') || msg.includes('projeção')) {
    const receitasMes = financialTransactions.filter(t => t.tipo === 'receita' && t.status === 'pago' && isThisMonth(t.data));
    const diasPassados = today.date();
    const diasNoMes = today.daysInMonth();
    const total = receitasMes.reduce((s, t) => s + t.valor, 0);
    const projecao = Math.round((total / diasPassados) * diasNoMes);
    resposta = `Com base no ritmo atual de faturamento (R$ ${total.toLocaleString('pt-BR')} em ${diasPassados} dias), a projeção para o fechamento do mês é de aproximadamente R$ ${projecao.toLocaleString('pt-BR')}.`;
  } else if (msg.includes('agenda') || msg.includes('hoje') || msg.includes('consulta')) {
    const hoje = appointments.filter(a => a.data === today.format('YYYY-MM-DD'));
    resposta = `Hoje há ${hoje.length} agendamento(s) na clínica. ${hoje.length ? 'Horários: ' + hoje.map(a => a.horaInicio).sort().join(', ') + '.' : 'Nenhum agendamento para hoje.'}`;
  } else {
    resposta = 'Posso ajudar com: faturamento do mês, taxa de faltas, pacientes inativos para recuperação, ranking de profissionais, previsão de faturamento e agenda do dia. O que você gostaria de saber?';
  }

  res.json({ resposta });
});

export default router;
