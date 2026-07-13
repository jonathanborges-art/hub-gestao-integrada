import { useEffect, useState } from 'react';
import api from '../api/client.js';
import KPICard from '../components/KPICard.jsx';
import NotificationBanner from '../components/NotificationBanner.jsx';
import {
  DollarSign, CalendarDays, Users, UserPlus, Receipt, AlertTriangle, TrendingDown, TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [profissionais, setProfissionais] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data));
    api.get('/profissionais').then(res => setProfissionais(res.data));
  }, []);

  if (!data) return <div className="empty-state">Carregando métricas da clínica…</div>;

  return (
    <div>
      <NotificationBanner />
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Visão geral</div>
          <h1 className="page-title">Bom dia, equipe Vitória Saúde 👋</h1>
          <p className="page-sub">Aqui está a previsibilidade financeira e o desempenho da clínica hoje.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard label="Faturamento do mês" value={fmtBRL(data.faturamentoMes)} icon={DollarSign}
          hint="Só receitas já pagas" hintTone="neutral" color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Consultas hoje" value={data.consultasHoje} icon={CalendarDays}
          hint="Aproveite cada horário da agenda" hintTone="neutral" color="#2E6FC7" bg="#E7EFFB" />
        <KPICard label="Pacientes ativos" value={data.pacientesAtivos} icon={Users}
          hint={`+${data.pacientesNovosMes} novos este mês`} hintTone="pos" color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Ticket médio" value={fmtBRL(data.ticketMedio)} icon={Receipt}
          hint="Por atendimento pago" hintTone="neutral" color="#C77D2E" bg="#FBEEDD" />
        <KPICard label="Taxa de faltas" value={`${data.taxaFaltas}%`} icon={AlertTriangle}
          hint={data.taxaFaltas > 15 ? 'Ative confirmação automática' : 'Sob controle'}
          hintTone={data.taxaFaltas > 15 ? 'neg' : 'pos'} color="#C74B3E" bg="#FBEAE7" />
        <KPICard label="Contas a receber" value={fmtBRL(data.contasReceber)} icon={TrendingUp}
          hint="Previsibilidade financeira" hintTone="pos" color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Contas a pagar" value={fmtBRL(data.contasPagar)} icon={TrendingDown}
          hint="Compromissos em aberto" hintTone="neg" color="#C74B3E" bg="#FBEAE7" />
        <KPICard label="Novos pacientes" value={data.pacientesNovosMes} icon={UserPlus}
          hint="Neste mês" hintTone="pos" color="#2E6FC7" bg="#E7EFFB" />
      </div>

      <div className="content-grid">
        <div className="card card-pad">
          <div className="section-title">Fluxo financeiro — últimos 14 dias</div>
          <div className="section-sub">Tenha previsibilidade financeira e tome decisões com segurança.</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.fluxo}>
              <defs>
                <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#017A5B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#017A5B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C74B3E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C74B3E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E9E7" vertical={false} />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#66766F' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmtBRL(v)} contentStyle={{ borderRadius: 10, borderColor: '#E4E9E7', fontSize: 12.5 }} />
              <Area type="monotone" dataKey="receitas" stroke="#017A5B" fill="url(#gReceita)" strokeWidth={2} name="Receitas" />
              <Area type="monotone" dataKey="despesas" stroke="#C74B3E" fill="url(#gDespesa)" strokeWidth={2} name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <div className="section-title">Agenda de hoje</div>
          <div className="section-sub">Reduza faltas e aproveite melhor cada horário.</div>
          {data.consultasHojeLista.length === 0 && (
            <div className="empty-state" style={{ padding: '24px 0' }}>Nenhum agendamento para hoje.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.consultasHojeLista
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
              .map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                  <div className="badge badge-green">{a.horaInicio}</div>
                  <div style={{ flex: 1 }}>{a.tipo}</div>
                  <span className={`badge ${a.status === 'confirmado' ? 'badge-green' : 'badge-grey'}`}>{a.status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="content-grid" style={{ marginTop: 16 }}>
        <div className="card card-pad">
          <div className="section-title">Ranking de profissionais</div>
          <div className="section-sub">Faturamento gerado no mês, por profissional.</div>
          <table className="data-table">
            <thead><tr><th>Profissional</th><th>Especialidade</th><th>Faturamento</th></tr></thead>
            <tbody>
              {data.rankingProfissionais.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{i + 1}º</div>{p.nome}
                  </td>
                  <td>{p.especialidade}</td>
                  <td style={{ fontWeight: 600 }}>{fmtBRL(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <div className="section-title">Ranking de procedimentos</div>
          <div className="section-sub">O que mais tem trazido receita este mês.</div>
          <table className="data-table">
            <thead><tr><th>Categoria</th><th>Total</th></tr></thead>
            <tbody>
              {data.rankingProcedimentos.map(p => (
                <tr key={p.categoria}>
                  <td>{p.categoria}</td>
                  <td style={{ fontWeight: 600 }}>{fmtBRL(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
