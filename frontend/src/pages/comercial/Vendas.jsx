import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import KPICard from '../../components/KPICard.jsx';
import { ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { fmtBRL } from './utils.js';

export default function Vendas() {
  const [leads, setLeads] = useState([]);

  useEffect(() => { api.get('/leads').then(res => setLeads(res.data)); }, []);

  const vendas = useMemo(() => leads.filter(l => l.fechou).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), [leads]);
  const total = vendas.reduce((s, l) => s + (l.valorFechado || 0), 0);
  const ticketMedio = vendas.length ? Math.round(total / vendas.length) : 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Vendas</h1>
          <p className="page-sub">Negócios fechados a partir do funil comercial.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KPICard label="Vendas fechadas" value={vendas.length} icon={ShoppingBag} color="#C77D2E" bg="#FBEEDD" />
        <KPICard label="Total vendido" value={fmtBRL(total)} icon={DollarSign} color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Ticket médio" value={fmtBRL(ticketMedio)} icon={TrendingUp} color="#2E6FC7" bg="#E7EFFB" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Lead</th><th>Canal</th><th>Fechado em</th><th>Valor</th></tr></thead>
          <tbody>
            {vendas.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.nome}</td>
                <td>{l.origem}</td>
                <td>{dayjs(l.criadoEm).format('DD/MM/YYYY')}</td>
                <td style={{ fontWeight: 700, color: 'var(--verde-700)' }}>{fmtBRL(l.valorFechado)}</td>
              </tr>
            ))}
            {vendas.length === 0 && <tr><td colSpan={4}><div className="empty-state">Nenhuma venda fechada ainda.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
