import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const funnelColors = ['#017A5B', '#049C74', '#2E6FC7', '#6D5AE6', '#C77D2E', '#C74B3E'];

export default function FunilComercial() {
  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/comercial').then(res => setData(res.data));
    api.get('/leads').then(res => setLeads(res.data));
  }, []);

  if (!data) return <div className="empty-state">Carregando funil...</div>;

  const maxFunil = data.funil[0]?.valor || 1;

  const etapasComListas = [
    { nome: 'Leads', filtro: l => true, cor: funnelColors[1] },
    { nome: 'Agendamentos', filtro: l => l.agendou, cor: funnelColors[2] },
    { nome: 'Comparecimentos', filtro: l => l.compareceu, cor: funnelColors[3] },
    { nome: 'Propostas', filtro: l => l.propos, cor: funnelColors[4] },
    { nome: 'Fechamentos', filtro: l => l.fechou, cor: funnelColors[5] },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Funil comercial</h1>
          <p className="page-sub">Acompanhe a conversão em cada etapa e identifique onde o funil trava.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="funnel">
          {data.funil.map((f, i) => {
            const largura = Math.max((f.valor / maxFunil) * 100, f.valor > 0 ? 8 : 0);
            const anterior = i > 0 ? data.funil[i - 1].valor : null;
            const queda = anterior ? Math.round((1 - f.valor / anterior) * 100) : null;
            return (
              <div key={f.etapa}>
                <div className="funnel-row">
                  <div className="funnel-label">{f.etapa}</div>
                  <div className="funnel-bar-track" style={{ height: 34 }}>
                    <div className="funnel-bar-fill" style={{ width: `${largura}%`, background: funnelColors[i], height: 34, fontSize: 13 }}>
                      {f.valor.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                {queda !== null && queda > 20 && (
                  <div className="funnel-drop">⚠ Queda de {queda}% em relação à etapa anterior — maior gargalo do funil se for a maior queda</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="content-grid">
        {etapasComListas.map(e => {
          const lista = leads.filter(e.filtro);
          return (
            <div key={e.nome} className="card card-pad">
              <div className="section-title">{e.nome}</div>
              <div className="section-sub">{lista.length} leads nesta etapa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {lista.slice(0, 8).map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{l.nome}</span>
                    <span style={{ color: 'var(--tinta-500)' }}>{l.origem}</span>
                  </div>
                ))}
                {lista.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--tinta-500)' }}>Nenhum lead ainda.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
