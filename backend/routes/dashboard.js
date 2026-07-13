import { Router } from 'express';
import dayjs from 'dayjs';
import { pool } from '../db/pool.js';
import { toCamelRows } from '../db/case.js';

const router = Router();

router.get('/', async (req, res) => {
  const clinicId = req.clinicId;
  const today = dayjs();
  const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
  const endOfMonth = today.endOf('month').format('YYYY-MM-DD');
  const todayStr = today.format('YYYY-MM-DD');

  const [
    receitasMes, despesasMes, contasReceber, contasPagar,
    consultasHojeLista, pacientesAtivos, pacientesNovosMes,
    concluidosMes, profissionais, transacoesPorProfMes,
  ] = await Promise.all([
    pool.query(`select coalesce(sum(valor),0) total, count(*) qtd from financial_transactions where clinic_id=$1 and tipo='receita' and status='pago' and data between $2 and $3`, [clinicId, startOfMonth, endOfMonth]),
    pool.query(`select coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='despesa' and status='pago' and data between $2 and $3`, [clinicId, startOfMonth, endOfMonth]),
    pool.query(`select coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='receita' and status='pendente'`, [clinicId]),
    pool.query(`select coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='despesa' and status='pendente'`, [clinicId]),
    pool.query(`select * from appointments where clinic_id=$1 and data=$2 order by hora_inicio`, [clinicId, todayStr]),
    pool.query(`select count(*) qtd from patients where clinic_id=$1 and ativo=true`, [clinicId]),
    pool.query(`select count(*) qtd from patients where clinic_id=$1 and created_at between $2 and $3`, [clinicId, startOfMonth, endOfMonth]),
    pool.query(`select status from appointments where clinic_id=$1 and data between $2 and $3 and status in ('concluido','faltou')`, [clinicId, startOfMonth, endOfMonth]),
    pool.query(`select * from professionals where clinic_id=$1`, [clinicId]),
    pool.query(`select profissional_id, coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='receita' and status='pago' and data between $2 and $3 group by profissional_id`, [clinicId, startOfMonth, endOfMonth]),
  ]);

  const faturamentoMes = Number(receitasMes.rows[0].total);
  const despesaMesTotal = Number(despesasMes.rows[0].total);
  const faltasMes = concluidosMes.rows.filter(r => r.status === 'faltou').length;
  const taxaFaltas = concluidosMes.rows.length ? Math.round((faltasMes / concluidosMes.rows.length) * 100) : 0;
  const ticketMedio = Number(receitasMes.rows[0].qtd) ? Math.round(faturamentoMes / Number(receitasMes.rows[0].qtd)) : 0;

  const totaisPorProf = {};
  transacoesPorProfMes.rows.forEach(r => { if (r.profissional_id) totaisPorProf[r.profissional_id] = Number(r.total); });
  const rankingProfissionais = toCamelRows(profissionais.rows).map(p => ({
    id: p.id, nome: p.nome, especialidade: p.especialidade, total: totaisPorProf[p.id] || 0,
  })).sort((a, b) => b.total - a.total);

  const { rows: receitasCategorias } = await pool.query(
    `select categoria, coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and tipo='receita' and status='pago' and data between $2 and $3 group by categoria order by total desc`,
    [clinicId, startOfMonth, endOfMonth]
  );
  const rankingProcedimentos = receitasCategorias.map(r => ({ categoria: r.categoria, total: Number(r.total) }));

  const fluxo = [];
  for (let i = 13; i >= 0; i--) {
    const day = today.subtract(i, 'day').format('YYYY-MM-DD');
    const { rows } = await pool.query(
      `select tipo, coalesce(sum(valor),0) total from financial_transactions where clinic_id=$1 and status='pago' and data=$2 group by tipo`,
      [clinicId, day]
    );
    const receitasDia = Number(rows.find(r => r.tipo === 'receita')?.total || 0);
    const despesasDia = Number(rows.find(r => r.tipo === 'despesa')?.total || 0);
    fluxo.push({ data: dayjs(day).format('DD/MM'), receitas: receitasDia, despesas: despesasDia });
  }

  res.json({
    faturamentoMes,
    despesaMesTotal,
    consultasHoje: consultasHojeLista.rows.length,
    pacientesAtivos: Number(pacientesAtivos.rows[0].qtd),
    pacientesNovosMes: Number(pacientesNovosMes.rows[0].qtd),
    ticketMedio,
    taxaFaltas,
    contasReceber: Number(contasReceber.rows[0].total),
    contasPagar: Number(contasPagar.rows[0].total),
    rankingProfissionais,
    rankingProcedimentos,
    fluxo,
    consultasHojeLista: toCamelRows(consultasHojeLista.rows),
  });
});

export default router;
