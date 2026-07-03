import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import KPICard from '../../components/KPICard.jsx';
import { CheckCircle2, XCircle, Percent } from 'lucide-react';

export default function Comparecimentos() {
  const [leads, setLeads] = useState([]);

  useEffect(() => { api.get('/leads').then(res => setLeads(res.data)); }, []);

  const agendados = useMemo(() => leads.filter(l => l.agendou).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), [leads]);
  const compareceram = agendados.filter(l => l.compareceu).length;
  const faltaram = agendados.length - compareceram;
  const showRate = agendados.length ? Math.round((compareceram / agendados.length) * 100) : 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Comparecimentos</h1>
          <p className="page-sub">Reduza faltas e aumente o aproveitamento das reuniões agendadas.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <KPICard label="Agendados" value={agendados.length} icon={Percent} color="#2E6FC7" bg="#E7EFFB" />
        <KPICard label="Compareceram" value={compareceram} icon={CheckCircle2} color="#017A5B" bg="#E4F5EF" hint={`${showRate}% de show rate`} hintTone={showRate >= 70 ? 'pos' : 'neg'} />
        <KPICard label="Faltaram" value={faltaram} icon={XCircle} color="#C74B3E" bg="#FBEAE7" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Lead</th><th>Canal</th><th>Agendado em</th><th>Compareceu?</th></tr></thead>
          <tbody>
            {agendados.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.nome}</td>
                <td>{l.origem}</td>
                <td>{dayjs(l.criadoEm).format('DD/MM/YYYY')}</td>
                <td><span className={`badge ${l.compareceu ? 'badge-green' : 'badge-red'}`}>{l.compareceu ? 'Sim' : 'Não'}</span></td>
              </tr>
            ))}
            {agendados.length === 0 && <tr><td colSpan={4}><div className="empty-state">Nenhum agendamento com lead ainda.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
