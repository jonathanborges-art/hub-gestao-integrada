import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { Plus, X } from 'lucide-react';

const statusOptions = ['pendente', 'agendado', 'confirmado', 'realizado', 'cancelado'];
const statusBadge = { pendente: 'badge-amber', agendado: 'badge-grey', confirmado: 'badge-green', realizado: 'badge-green', cancelado: 'badge-red' };
const emptyForm = { hora: '09:00', tipo: 'Call Comercial', com: '', status: 'agendado' };

export default function AgendamentosComerciais() {
  const [itens, setItens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const carregar = () => api.get('/comercial-agendamentos').then(res => setItens(res.data));
  useEffect(() => { carregar(); }, []);

  async function atualizarStatus(id, status) {
    await api.put(`/comercial-agendamentos/${id}`, { status });
    setItens(itens.map(i => i.id === id ? { ...i, status } : i));
  }

  async function salvar(e) {
    e.preventDefault();
    const { data } = await api.post('/comercial-agendamentos', form);
    setItens([...itens, data]);
    setShowForm(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Agendamentos comerciais</h1>
          <p className="page-sub">Calls, follow-ups e reuniões com leads — separado da agenda clínica de pacientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo agendamento</button>
      </div>

      <div className="card card-pad">
        {itens.length === 0 && <div className="empty-state">Nenhum agendamento comercial ainda.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {itens.sort((a, b) => a.hora.localeCompare(b.hora)).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px solid var(--borda)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, width: 56, fontSize: 13.5 }}>{a.hora}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.tipo}</div>
                <div style={{ fontSize: 12, color: 'var(--tinta-500)' }}>Com {a.com}</div>
              </div>
              <select className="chip-select" value={a.status} onChange={e => atualizarStatus(a.id, e.target.value)} style={{ fontSize: 12 }}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className={`badge ${statusBadge[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo agendamento comercial</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field-row">
                  <div className="field"><label>Horário</label>
                    <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} /></div>
                  <div className="field"><label>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                      {['Call Comercial', 'Follow-up Lead', 'Apresentação de Proposta', 'Reunião Estratégica'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                </div>
                <div className="field"><label>Com quem</label>
                  <input required value={form.com} onChange={e => setForm({ ...form, com: e.target.value })} placeholder="Nome do lead ou equipe" /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
