import { Router } from 'express';
import dayjs from 'dayjs';
import { pool } from '../db/pool.js';

const router = Router();

router.post('/query', async (req, res) => {
  const { message } = req.body;
  const clinicId = req.clinicId;
  const today = dayjs();
  const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
  const msg = (message || '').toLowerCase();
  let resposta = '';

  if (msg.includes('fatur') || msg.includes('receita')) {
    const { rows } = await pool.query(`select coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='receita' and status='pago' and data >= $2`, [clinicId, startOfMonth]);
    const { rows: clinicaRows } = await pool.query('select meta_faturamento_mensal from clinics where id=$1', [clinicId]);
    const total = Number(rows[0].total);
    const meta = Number(clinicaRows[0]?.meta_faturamento_mensal || 0);
    const pct = meta ? Math.round((total / meta) * 100) : 0;
    resposta = `O faturamento deste mês está em R$ ${total.toLocaleString('pt-BR')}, o que representa ${pct}% da meta de R$ ${meta.toLocaleString('pt-BR')}. ${pct >= 100 ? 'Meta batida! 🎉' : `Faltam R$ ${(meta - total).toLocaleString('pt-BR')} para bater a meta do mês.`}`;
  } else if (msg.includes('falta') || msg.includes('no-show') || msg.includes('não compareceu')) {
    const { rows } = await pool.query(`select status from appointments where clinic_id=$1 and data >= $2 and status in ('concluido','faltou')`, [clinicId, startOfMonth]);
    const faltas = rows.filter(r => r.status === 'faltou').length;
    const taxa = rows.length ? Math.round((faltas / rows.length) * 100) : 0;
    resposta = `A taxa de faltas deste mês é de ${taxa}% (${faltas} faltas em ${rows.length} atendimentos concluídos). ${taxa > 15 ? 'Isso está acima do ideal — considere ativar confirmação automática por WhatsApp 24h antes da consulta.' : 'Isso está dentro de um patamar saudável.'}`;
  } else if (msg.includes('inativ') || msg.includes('recupera')) {
    const { rows } = await pool.query(
      `select nome from patients where clinic_id=$1 and ativo=true and id not in (
         select paciente_id from appointments where clinic_id=$1 and data >= $2 and paciente_id is not null
       )`,
      [clinicId, today.subtract(60, 'day').format('YYYY-MM-DD')]
    );
    resposta = `Encontrei ${rows.length} pacientes sem consultas nos últimos 60 dias. Recomendo uma campanha de reativação via WhatsApp oferecendo retorno ou avaliação gratuita.${rows.length ? ' Alguns nomes: ' + rows.slice(0, 5).map(r => r.nome).join(', ') + '.' : ''}`;
  } else if (msg.includes('profission') || msg.includes('ranking') || msg.includes('desempenho')) {
    const { rows } = await pool.query(
      `select p.nome, coalesce(sum(t.valor),0) total from professionals p
       left join financial_transactions t on t.profissional_id = p.id and t.tipo='receita' and t.status='pago' and t.data >= $2 and t.clinic_id = $1
       where p.clinic_id = $1 group by p.nome order by total desc`,
      [clinicId, startOfMonth]
    );
    resposta = `Ranking de faturamento do mês:\n${rows.map((r, i) => `${i + 1}. ${r.nome} — R$ ${Number(r.total).toLocaleString('pt-BR')}`).join('\n')}`;
  } else if (msg.includes('previs') || msg.includes('próximo mês') || msg.includes('projeção')) {
    const { rows } = await pool.query(`select coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='receita' and status='pago' and data >= $2`, [clinicId, startOfMonth]);
    const total = Number(rows[0].total);
    const diasPassados = today.date();
    const diasNoMes = today.daysInMonth();
    const projecao = Math.round((total / diasPassados) * diasNoMes);
    resposta = `Com base no ritmo atual de faturamento (R$ ${total.toLocaleString('pt-BR')} em ${diasPassados} dias), a projeção para o fechamento do mês é de aproximadamente R$ ${projecao.toLocaleString('pt-BR')}.`;
  } else if (msg.includes('agenda') || msg.includes('hoje') || msg.includes('consulta')) {
    const { rows } = await pool.query(`select hora_inicio from appointments where clinic_id=$1 and data=$2 order by hora_inicio`, [clinicId, today.format('YYYY-MM-DD')]);
    resposta = `Hoje há ${rows.length} agendamento(s) na clínica. ${rows.length ? 'Horários: ' + rows.map(r => r.hora_inicio).join(', ') + '.' : 'Nenhum agendamento para hoje.'}`;
  } else {
    resposta = 'Posso ajudar com: faturamento do mês, taxa de faltas, pacientes inativos para recuperação, ranking de profissionais, previsão de faturamento e agenda do dia. O que você gostaria de saber?';
  }

  res.json({ resposta });
});

export default router;
