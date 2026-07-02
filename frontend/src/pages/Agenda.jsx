import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api/client.js';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const statusOptions = ['agendado', 'confirmado', 'concluido', 'faltou', 'cancelado'];
const statusBadge = { agendado: 'badge-grey', confirmado: 'badge-green', concluido: 'badge-green', faltou: 'badge-red', cancelado: 'badge-amber' };

const emptyForm = { pacienteId: '', profissionalId: '', horaInicio: '09:00', tipo: 'Consulta', duracaoMinutos: 30, valor: 200 };

export default function Agenda() {
  const [dia, setDia] = useState(dayjs());
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [profFiltro, setProfFiltro] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const carregar = () => api.get('/agendamentos').then(res => setAgendamentos(res.data));
  useEffect(() => {
    carregar();
    api.get('/pacientes').then(res => setPacientes(res.data));
    api.get('/profissionais').then(res => setProfissionais(res.data));
  }, []);

  const doDia = useMemo(() => agendamentos
    .filter(a => a.data === dia.format('YYYY-MM-DD'))
    .filter(a => profFiltro === 'Todos' || a.profissionalId === profFiltro)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)), [agendamentos, dia, profFiltro]);

  const nomeProf = (id) => profissionais.find(p => p.id === id)?.nome || '—';
  const nomePac = (id) => pacientes.find(p => p.id === id)?.nome || '—';
  const corProf = (id) => profissionais.find(p => p.id === id)?.cor || '#017A5B';

  async function atualizarStatus(id, status) {
    await api.put(`/agendamentos/${id}`, { status });
    setAgendamentos(agendamentos.map(a => a.id === id ? { ...a, status } : a));
  }

  async function salvar(e) {
    e.preventDefault();
    const novo = { ...form, data: dia.format('YYYY-MM-DD'), status: 'agendado', valor: Number(form.valor) };
    const { data } = await api.post('/agendamentos', novo);
    setAgendamentos([...agendamentos, data]);
    setShowForm(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Agenda inteligente</div>
          <h1 className="page-title">Agenda do dia</h1>
          <p className="page-sub">Reduza faltas e aumente o aproveitamento da agenda.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo agendamento</button>
      </div>

      <div className="toolbar">
        <button className="btn btn-secondary btn-sm" onClick={() => setDia(dia.subtract(1, 'day'))}><ChevronLeft size={16} /></button>
        <div className="badge badge-green" style={{ fontSize: 13, padding: '8px 14px' }}>
          {dia.format('dddd, DD [de] MMMM')}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setDia(dia.add(1, 'day'))}><ChevronRight size={16} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => setDia(dayjs())}>Hoje</button>
        <select className="chip-select" value={profFiltro} onChange={e => setProfFiltro(e.target.value)}>
          <option value="Todos">Todos os profissionais</option>
          {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div className="card card-pad">
        {doDia.length === 0 && <div className="empty-state">Nenhum agendamento para este dia. Que tal preencher esse horário?</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {doDia.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
              border: '1px solid var(--borda)', borderRadius: 12, borderLeft: `4px solid ${corProf(a.profissionalId)}`,
            }}>
              <div style={{ fontWeight: 700, width: 56, fontSize: 13.5 }}>{a.horaInicio}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{nomePac(a.pacienteId)}</div>
                <div style={{ fontSize: 12, color: 'var(--tinta-500)' }}>{a.tipo} · {nomeProf(a.profissionalId)} · {a.duracaoMinutos}min</div>
              </div>
              <select
                className="chip-select"
                value={a.status}
                onChange={e => atualizarStatus(a.id, e.target.value)}
                style={{ fontSize: 12 }}
              >
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
              <h3>Novo agendamento — {dia.format('DD/MM/YYYY')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field"><label>Paciente</label>
                  <select required value={form.pacienteId} onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
                    <option value="">Selecione…</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select></div>
                <div className="field"><label>Profissional</label>
                  <select required value={form.profissionalId} onChange={e => setForm({ ...form, profissionalId: e.target.value })}>
                    <option value="">Selecione…</option>
                    {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select></div>
                <div className="field-row">
                  <div className="field"><label>Horário</label>
                    <input type="time" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} /></div>
                  <div className="field"><label>Duração (min)</label>
                    <input type="number" value={form.duracaoMinutos} onChange={e => setForm({ ...form, duracaoMinutos: e.target.value })} /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                      {['Consulta', 'Retorno', 'Avaliação', 'Procedimento', 'Sessão'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div className="field"><label>Valor (R$)</label>
                    <input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
