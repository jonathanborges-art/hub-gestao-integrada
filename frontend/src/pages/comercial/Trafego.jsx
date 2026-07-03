import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import KPICard from '../../components/KPICard.jsx';
import { Globe, DollarSign } from 'lucide-react';
import { fmtBRL, canalIcon } from './utils.js';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Trafego() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/trafego').then(res => setData(res.data)); }, []);

  if (!data) return <div className="empty-state">Carregando tráfego...</div>;

  const totalVisitantes = data.trafficDaily.reduce((s, d) => s + d.visitantes, 0);
  const chartData = data.trafficDaily.map(d => ({ dia: d.data.slice(8, 10) + '/' + d.data.slice(5, 7), Visitantes: d.visitantes, Leads: d.leadsGerados }));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Tráfego</h1>
          <p className="page-sub">De onde vêm os visitantes e quanto cada canal custa.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KPICard label="Visitantes (14 dias)" value={totalVisitantes.toLocaleString('pt-BR')} icon={Globe} color="#2E6FC7" bg="#E7EFFB" />
        <KPICard label="Investimento do mês" value={fmtBRL(data.marketingSpend.total)} icon={DollarSign} color="#C77D2E" bg="#FBEEDD" />
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title">Visitantes e leads gerados</div>
        <div className="section-sub">Últimos 14 dias.</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gVis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#017A5B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#017A5B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9E7" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E4E9E7', fontSize: 12.5 }} />
            <Area type="monotone" dataKey="Visitantes" stroke="#017A5B" fill="url(#gVis)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card card-pad">
        <div className="section-title">Investimento por canal</div>
        <div className="section-sub">Verba de mídia paga no mês atual.</div>
        <table className="data-table">
          <thead><tr><th>Canal</th><th>Investimento</th></tr></thead>
          <tbody>
            {Object.entries(data.marketingSpend.porCanal).map(([canal, valor]) => (
              <tr key={canal}>
                <td>{canalIcon[canal] || ''} {canal}</td>
                <td style={{ fontWeight: 600 }}>{fmtBRL(valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
