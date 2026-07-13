import { Router } from 'express';
import dayjs from 'dayjs';
import { pool } from '../db/pool.js';
import { toCamelRows } from '../db/case.js';

const router = Router();

router.get('/', async (req, res) => {
  const clinicId = req.clinicId;
  const startWindow = dayjs().subtract(30, 'day').toISOString();

  const [leadsRes, trafficRes, spendRes, activitiesRes, professionalsRes] = await Promise.all([
    pool.query(`select * from leads where clinic_id=$1 and criado_em >= $2`, [clinicId, startWindow]),
    pool.query(`select * from traffic_daily where clinic_id=$1 order by data`, [clinicId]),
    pool.query(`select * from marketing_spend where clinic_id=$1 order by mes desc limit 1`, [clinicId]),
    pool.query(`select * from comercial_activities where clinic_id=$1 order by hora`, [clinicId]),
    pool.query(`select * from professionals where clinic_id=$1`, [clinicId]),
  ]);

  const leads = toCamelRows(leadsRes.rows);
  const leadsRecebidos = leads.length;
  const agendamentos = leads.filter(l => l.agendou).length;
  const comparecimentos = leads.filter(l => l.compareceu).length;
  const propostas = leads.filter(l => l.propos).length;
  const vendasFechadas = leads.filter(l => l.fechou).length;
  const valorVendas = leads.filter(l => l.fechou).reduce((s, l) => s + Number(l.valorFechado || 0), 0);

  const taxaConversao = leadsRecebidos ? Math.round((vendasFechadas / leadsRecebidos) * 1000) / 10 : 0;
  const showRate = agendamentos ? Math.round((comparecimentos / agendamentos) * 1000) / 10 : 0;

  const trafficDaily = toCamelRows(trafficRes.rows);
  const traficoTotal = trafficDaily.reduce((s, d) => s + d.visitantes, 0);
  const marketingSpend = spendRes.rows[0] ? toCamelRows(spendRes.rows)[0] : { total: 0, porCanal: {} };
  const investimento = Number(marketingSpend.total || 0);
  const cpl = leadsRecebidos ? Math.round(investimento / leadsRecebidos) : 0;
  const cac = vendasFechadas ? Math.round(investimento / vendasFechadas) : 0;
  const roas = investimento ? Math.round((valorVendas / investimento) * 10) / 10 : 0;

  const funil = [
    { etapa: 'Tráfego', valor: traficoTotal },
    { etapa: 'Leads', valor: leadsRecebidos },
    { etapa: 'Agendamentos', valor: agendamentos },
    { etapa: 'Comparecimentos', valor: comparecimentos },
    { etapa: 'Propostas', valor: propostas },
    { etapa: 'Fechamentos', valor: vendasFechadas },
  ];

  const canaisMap = {};
  leads.forEach(l => {
    if (!canaisMap[l.origem]) canaisMap[l.origem] = { canal: l.origem, leads: 0, agendados: 0, compareceram: 0, vendas: 0 };
    canaisMap[l.origem].leads += 1;
    if (l.agendou) canaisMap[l.origem].agendados += 1;
    if (l.compareceu) canaisMap[l.origem].compareceram += 1;
    if (l.fechou) canaisMap[l.origem].vendas += 1;
  });
  const origemLeads = Object.values(canaisMap)
    .map(c => ({ ...c, conversao: c.leads ? Math.round((c.vendas / c.leads) * 1000) / 10 : 0 }))
    .sort((a, b) => b.leads - a.leads);

  const scoreConversao = Math.min(taxaConversao / 10, 1) * 40;
  const scoreShowRate = Math.min(showRate / 85, 1) * 35;
  const scoreRoas = Math.min(roas / 5, 1) * 25;
  const indiceEficiencia = Math.round(scoreConversao + scoreShowRate + scoreRoas);

  const alertas = [];
  if (taxaConversao >= 8) alertas.push({ tipo: 'positivo', texto: `Conversão em ${taxaConversao}% — acima da média do setor.` });
  if (showRate < 70 && agendamentos > 0) alertas.push({ tipo: 'atencao', texto: `Show rate em ${showRate}% — considere confirmação automática por WhatsApp.` });
  if (cac > 0 && roas < 2) alertas.push({ tipo: 'critico', texto: `ROAS em ${roas}x — CAC pode estar acima do ideal para o ticket médio.` });
  if (propostas > 0 && vendasFechadas / propostas < 0.4) alertas.push({ tipo: 'atencao', texto: 'Queda entre Propostas e Fechamentos — revisar follow-up comercial.' });
  if (alertas.length === 0) alertas.push({ tipo: 'positivo', texto: 'Funil comercial saudável neste período.' });

  res.json({
    leadsRecebidos, agendamentos, comparecimentos, propostas, vendasFechadas, valorVendas,
    taxaConversao, showRate, traficoTotal, cpl, cac, roas, funil, origemLeads,
    indiceEficiencia, alertas, trafficDaily, agendaComercialHoje: toCamelRows(activitiesRes.rows),
  });
});

export default router;
