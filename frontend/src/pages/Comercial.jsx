import { useEffect, useState } from 'react';
import api from '../api/client.js';
import KPICard from '../components/KPICard.jsx';
import {
  Users, CalendarCheck, CheckCircle2, ShoppingBag, Percent, Globe, DollarSign, Target, TrendingUp,
  AlertTriangle, CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const funnelColors = ['#017A5B', '#049C74', '#2E6FC7', '#6D5AE6', '#C77D2E', '#C74B3E'];
const alertIcon = { positivo: CheckCircle, atencao: AlertTriangle, critico: AlertCircle };

export default function Comercial() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/comercial').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="empty-state">Carregando desempenho comercial...</div>;

  const maxFunil = data.funil[0]?.valor || 1;
  const gaugeDeg = Math.min(data.indiceEficiencia, 100) * 3.6;
  const gaugeColor = data.indiceEficiencia >= 70 ? '#017A5B' : data.indiceEficiencia >= 45 ? '#C77D2E' : '#C74B3E';

  const trafficData = data.trafficDaily.map(d => ({
    dia: d.data.slice(8, 10) + '/' + d.data.slice(5, 7),
    Visitantes: d.visitantes,
    Leads: d.leadsGerados,
    Conversões: d.conversoes,
  }));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Visão comercial</div>
          <h1 className="page-title">Desempenho comercial e de tráfego</h1>
          <p className="page-sub">Transforme contatos em pacientes com um processo comercial organizado.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard label="Leads recebidos" value={data.leadsRecebidos} icon={Users} hint="Neste mês" hintTone="neutral" color="#2E6FC7" bg="#E7EFFB" />
        <KPICard label="Agendamentos" value={data.agendamentos} icon={CalendarCheck} hint={`${data.leadsRecebidos ? Math.round((data.agendamentos / data.leadsRecebidos) * 100) : 0}% dos leads`} hintTone="neutral" color="#6D5AE6" bg="#EDEBFB" />
        <KPICard label="Comparecimentos" value={data.comparecimentos} icon={CheckCircle2} hint={`Show rate ${data.showRate}%`} hintTone={data.showRate >= 70 ? 'pos' : 'neg'} color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Vendas fechadas" value={data.vendasFechadas} icon={ShoppingBag} hint={fmtBRL(data.valorVendas) + ' em vendas'} hintTone="pos" color="#C77D2E" bg="#FBEEDD" />
        <KPICard label="Taxa de conversão" value={`${data.taxaConversao}%`} icon={Percent} hint="Lead → venda" hintTone="neutral" color="#C74B3E" bg="#FBEAE7" />
        <KPICard label="Tráfego total" value={data.traficoTotal.toLocaleString('pt-BR')} icon={Globe} hint="Visitantes no período" hintTone="neutral" color="#2E6FC7" bg="#E7EFFB" />
        <KPICard label="CPL" value={fmtBRL(data.cpl)} icon={DollarSign} hint="Custo por lead" hintTone="neutral" color="#6D5AE6" bg="#EDEBFB" />
        <KPICard label="CAC" value={fmtBRL(data.cac)} icon={Target} hint="Custo por cliente" hintTone="neutral" color="#C77D2E" bg="#FBEEDD" />
        <KPICard label="ROAS" value={`${data.roas}x`} icon={TrendingUp} hint="Retorno sobre investimento" hintTone={data.roas >= 3 ? 'pos' : 'neutral'} color="#017A5B" bg="#E4F5EF" />
      </div>

      <div className="content-grid">
        <div className="card card-pad">
          <div className="section-title">Funil comercial</div>
          <div className="section-sub">Acompanhe a conversão em cada etapa do funil.</div>
          <div className="funnel">
            {data.funil.map((f, i) => {
              const largura = Math.max((f.valor / maxFunil) * 100, f.valor > 0 ? 8 : 0);
              const anterior = i > 0 ? data.funil[i - 1].valor : null;
              const queda = anterior ? Math.round((1 - f.valor / anterior) * 100) : null;
              return (
                <div key={f.etapa}>
                  <div className="funnel-row">
                    <div className="funnel-label">{f.etapa}</div>
                    <div className="funnel-bar-track">
                      <div className="funnel-bar-fill" style={{ width: `${largura}%`, background: funnelColors[i] }}>
                        {f.valor.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  {queda !== null && queda > 25 && (
                    <div className="funnel-drop">⚠ Queda de {queda}% em relação à etapa anterior</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title">Índice de eficiência comercial</div>
          <div className="section-sub">Sua operação comercial em um único score.</div>
          <div className="gauge-wrap">
            <div className="gauge-circle" style={{ background: `conic-gradient(${gaugeColor} ${gaugeDeg}deg, var(--cinza-100) 0deg)` }}>
              <div className="gauge-inner">
                <div className="gauge-score">{data.indiceEficiencia}</div>
                <div className="gauge-max">/ 100</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {data.alertas.map((a, i) => {
              const Icon = alertIcon[a.tipo];
              return (
                <div key={i} className={`alert-item ${a.tipo}`}>
                  <Icon size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span>{a.texto}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="content-grid" style={{ marginTop: 16 }}>
        <div className="card card-pad">
          <div className="section-title">Performance de tráfego (últimos 14 dias)</div>
          <div className="section-sub">Visitantes, leads gerados e conversões.</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E9E7" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E4E9E7', fontSize: 12.5 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Visitantes" stroke="#017A5B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Leads" stroke="#2E6FC7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Conversões" stroke="#6D5AE6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <div className="section-title">Agenda comercial de hoje</div>
          <div className="section-sub">Reuniões e calls agendadas.</div>
          {data.agendaComercialHoje.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginBottom: 12 }}>
              <span className="badge badge-green">{a.hora}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{a.tipo}</div>
                <div style={{ fontSize: 11.5, color: 'var(--tinta-500)' }}>Com {a.com}</div>
              </div>
              <span className={`badge ${a.status === 'confirmado' ? 'badge-green' : a.status === 'pendente' ? 'badge-amber' : 'badge-grey'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="section-title">Origem dos leads</div>
        <div className="section-sub">Desempenho por canal de aquisição.</div>
        <table className="data-table">
          <thead><tr><th>Canal</th><th>Leads</th><th>Agendados</th><th>Compareceram</th><th>Vendas</th><th>Conversão</th></tr></thead>
          <tbody>
            {data.origemLeads.map(c => (
              <tr key={c.canal}>
                <td>{c.canal}</td>
                <td>{c.leads}</td>
                <td>{c.agendados}</td>
                <td>{c.compareceram}</td>
                <td>{c.vendas}</td>
                <td style={{ fontWeight: 600, color: c.conversao >= 5 ? 'var(--verde-700)' : 'var(--tinta-700)' }}>{c.conversao}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
