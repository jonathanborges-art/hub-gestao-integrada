import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { fmtBRL } from './utils.js';
import { Save } from 'lucide-react';

function Progresso({ label, atual, alvo, formato }) {
  const pct = alvo ? Math.min(Math.round((atual / alvo) * 100), 100) : 0;
  const cor = pct >= 100 ? '#017A5B' : pct >= 60 ? '#C77D2E' : '#C74B3E';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--tinta-500)' }}>{formato ? formato(atual) : atual} / {formato ? formato(alvo) : alvo}</span>
      </div>
      <div style={{ background: 'var(--cinza-100)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 999, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 11.5, color: cor, fontWeight: 600, marginTop: 4 }}>{pct}% da meta</div>
    </div>
  );
}

export default function Metas() {
  const [metas, setMetas] = useState(null);
  const [comercial, setComercial] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get('/metas').then(res => { setMetas(res.data); setForm(res.data); });
    api.get('/comercial').then(res => setComercial(res.data));
  }, []);

  async function salvar(e) {
    e.preventDefault();
    const { data } = await api.put('/metas', form);
    setMetas(data);
    setEditando(false);
  }

  if (!metas || !comercial) return <div className="empty-state">Carregando metas...</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Metas</h1>
          <p className="page-sub">Defina os alvos do mês e acompanhe o progresso em tempo real.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setEditando(!editando)}>{editando ? 'Cancelar' : 'Editar metas'}</button>
      </div>

      {editando ? (
        <div className="card card-pad" style={{ maxWidth: 480 }}>
          <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Leads (alvo mensal)</label>
              <input type="number" value={form.leadsAlvo} onChange={e => setForm({ ...form, leadsAlvo: Number(e.target.value) })} /></div>
            <div className="field"><label>Agendamentos (alvo mensal)</label>
              <input type="number" value={form.agendamentosAlvo} onChange={e => setForm({ ...form, agendamentosAlvo: Number(e.target.value) })} /></div>
            <div className="field"><label>Vendas fechadas (alvo mensal)</label>
              <input type="number" value={form.vendasAlvo} onChange={e => setForm({ ...form, vendasAlvo: Number(e.target.value) })} /></div>
            <div className="field"><label>Faturamento comercial (alvo mensal, R$)</label>
              <input type="number" value={form.faturamentoAlvo} onChange={e => setForm({ ...form, faturamentoAlvo: Number(e.target.value) })} /></div>
            <div className="field"><label>CAC máximo desejado (R$)</label>
              <input type="number" value={form.cacAlvo} onChange={e => setForm({ ...form, cacAlvo: Number(e.target.value) })} /></div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}><Save size={15} /> Salvar metas</button>
          </form>
        </div>
      ) : (
        <div className="card card-pad" style={{ maxWidth: 560 }}>
          <Progresso label="Leads recebidos" atual={comercial.leadsRecebidos} alvo={metas.leadsAlvo} />
          <Progresso label="Agendamentos" atual={comercial.agendamentos} alvo={metas.agendamentosAlvo} />
          <Progresso label="Vendas fechadas" atual={comercial.vendasFechadas} alvo={metas.vendasAlvo} />
          <Progresso label="Faturamento comercial" atual={comercial.valorVendas} alvo={metas.faturamentoAlvo} formato={fmtBRL} />
          <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 10, background: comercial.cac <= metas.cacAlvo ? 'var(--verde-50)' : 'var(--vermelho-100)', fontSize: 13 }}>
            CAC atual: <strong>{fmtBRL(comercial.cac)}</strong> — meta: até {fmtBRL(metas.cacAlvo)}
            {comercial.cac <= metas.cacAlvo ? ' ✅ dentro do esperado' : ' ⚠ acima do desejado'}
          </div>
        </div>
      )}
    </div>
  );
}
