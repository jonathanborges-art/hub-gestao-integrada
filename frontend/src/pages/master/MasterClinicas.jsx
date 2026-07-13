import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';

const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function MasterClinicas() {
  const [resumo, setResumo] = useState(null);
  const [clinicas, setClinicas] = useState([]);

  const carregar = () => {
    api.get('/master/resumo').then(res => setResumo(res.data));
    api.get('/master/clinicas').then(res => setClinicas(res.data));
  };
  useEffect(() => { carregar(); }, []);

  async function alternarAtivo(c) {
    const { data } = await api.put(`/master/clinicas/${c.id}`, { ativo: !c.ativo });
    setClinicas(clinicas.map(x => x.id === c.id ? { ...x, ativo: data.ativo } : x));
  }

  if (!resumo) return <div className="empty-state">Carregando painel Master...</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow" style={{ color: '#8B5CF6' }}>Painel Master</div>
          <h1 className="page-title">Clínicas na plataforma</h1>
          <p className="page-sub">Visão geral de todas as clínicas que usam o Hub Gestão Integrada.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="Clínicas cadastradas" value={resumo.totalClinicas} icon={Building2} color="#8B5CF6" bg="#EDE9FE" />
        <KPI label="Clínicas ativas" value={resumo.clinicasAtivas} icon={Activity} color="#017A5B" bg="#E4F5EF" />
        <KPI label="Usuários ativos" value={resumo.totalUsuarios} icon={Users} color="#2E6FC7" bg="#E7EFFB" />
        <KPI label="Faturamento total (todas)" value={fmtBRL(resumo.faturamentoTotalPlataforma)} icon={DollarSign} color="#C77D2E" bg="#FBEEDD" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Clínica</th><th>Plano</th><th>Pacientes</th><th>Usuários</th><th>Faturamento</th><th>Cadastrada em</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {clinicas.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td><span className="badge badge-grey">{c.plano}</span></td>
                <td>{c.totalPacientes}</td>
                <td>{c.totalUsuarios}</td>
                <td>{fmtBRL(c.faturamentoTotal)}</td>
                <td>{dayjs(c.createdAt).format('DD/MM/YYYY')}</td>
                <td><span className={`badge ${c.ativo ? 'badge-green' : 'badge-red'}`}>{c.ativo ? 'Ativa' : 'Suspensa'}</span></td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => alternarAtivo(c)}>{c.ativo ? 'Suspender' : 'Reativar'}</button></td>
              </tr>
            ))}
            {clinicas.length === 0 && <tr><td colSpan={8}><div className="empty-state">Nenhuma clínica cadastrada ainda.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: bg, color }}><Icon size={17} /></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
