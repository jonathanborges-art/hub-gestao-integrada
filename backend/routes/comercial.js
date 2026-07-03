import { Router } from 'express';
import dayjs from 'dayjs';
import { getDB } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = await getDB();
  const { leads, trafficDaily, marketingSpend, comercialActivities } = db.data;

  const startWindow = dayjs().subtract(30, 'day');
  const leadsMes = leads.filter(l => dayjs(l.criadoEm).isAfter(startWindow));

  const leadsRecebidos = leadsMes.length;
  const agendamentos = leadsMes.filter(l => l.agendou).length;
  const comparecimentos = leadsMes.filter(l => l.compareceu).length;
  const propostas = leadsMes.filter(l => l.propos).length;
  const vendasFechadas = leadsMes.filter(l => l.fechou).length;
  const valorVendas = leadsMes.filter(l => l.fechou).reduce((s, l) => s + (l.valorFechado || 0), 0);

  const taxaConversao = leadsRecebidos ? Math.round((vendasFechadas / leadsRecebidos) * 1000) / 10 : 0;
  const showRate = agendamentos ? Math.round((comparecimentos / agendamentos) * 1000) / 10 : 0;

  const traficoTotal = trafficDaily.reduce((s, d) => s + d.visitantes, 0);
  const investimento = marketingSpend.total || 0;
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

  // Origem dos leads (desempenho por canal)
  const canaisMap = {};
  leadsMes.forEach(l => {
    if (!canaisMap[l.origem]) canaisMap[l.origem] = { canal: l.origem, leads: 0, agendados: 0, compareceram: 0, vendas: 0 };
    canaisMap[l.origem].leads += 1;
    if (l.agendou) canaisMap[l.origem].agendados += 1;
    if (l.compareceu) canaisMap[l.origem].compareceram += 1;
    if (l.fechou) canaisMap[l.origem].vendas += 1;
  });
  const origemLeads = Object.values(canaisMap)
    .map(c => ({ ...c, conversao: c.leads ? Math.round((c.vendas / c.leads) * 1000) / 10 : 0 }))
    .sort((a, b) => b.leads - a.leads);

  // Índice de eficiência comercial (0-100), combinando conversão, show rate e ROAS
  const scoreConversao = Math.min(taxaConversao / 10, 1) * 40; // até 10% de conversão = nota máxima
  const scoreShowRate = Math.min(showRate / 85, 1) * 35; // 85% de comparecimento = nota máxima
  const scoreRoas = Math.min(roas / 5, 1) * 25; // ROAS 5x = nota máxima
  const indiceEficiencia = Math.round(scoreConversao + scoreShowRate + scoreRoas);

  // Alertas dinâmicos, calculados a partir dos números acima
  const alertas = [];
  if (taxaConversao >= 8) alertas.push({ tipo: 'positivo', texto: `Conversão em ${taxaConversao}% — acima da média do setor.` });
  if (showRate < 70 && agendamentos > 0) alertas.push({ tipo: 'atencao', texto: `Show rate em ${showRate}% — considere confirmação automática por WhatsApp.` });
  if (cac > 0 && roas < 2) alertas.push({ tipo: 'critico', texto: `ROAS em ${roas}x — CAC pode estar acima do ideal para o ticket médio.` });
  if (propostas > 0 && vendasFechadas / propostas < 0.4) alertas.push({ tipo: 'atencao', texto: 'Queda entre Propostas e Fechamentos — revisar follow-up comercial.' });
  if (alertas.length === 0) alertas.push({ tipo: 'positivo', texto: 'Funil comercial saudável neste período.' });

  res.json({
    leadsRecebidos,
    agendamentos,
    comparecimentos,
    propostas,
    vendasFechadas,
    valorVendas,
    taxaConversao,
    showRate,
    traficoTotal,
    cpl,
    cac,
    roas,
    funil,
    origemLeads,
    indiceEficiencia,
    alertas,
    trafficDaily,
    agendaComercialHoje: comercialActivities,
  });
});

export default router;
