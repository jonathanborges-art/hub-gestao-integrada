import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import { etapaLead, canalIcon } from './utils.js';
import { Search, Plus, X } from 'lucide-react';

const emptyForm = { nome: '', telefone: '', origem: 'Instagram Ads' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [busca, setBusca] = useState('');
  const [canalFiltro, setCanalFiltro] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const carregar = () => api.get('/leads').then(res => setLeads(res.data));
  useEffect(() => { carregar(); }, []);

  const canais = useMemo(() => ['Todos', ...new Set(leads.map(l => l.origem))], [leads]);

  const filtrados = useMemo(() => leads
    .filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter(l => canalFiltro === 'Todos' || l.origem === canalFiltro)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), [leads, busca, canalFiltro]);

  async function salvar(e) {
    e.preventDefault();
    const novo = { ...form, criadoEm: new Date().toISOString(), agendou: false, compareceu: false, propos: false, fechou: false, valorFechado: 0 };
    const { data } = await api.post('/leads', novo);
    setLeads([data, ...leads]);
    setShowForm(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Leads</h1>
          <p className="page-sub">Todo contato que chega, organizado em um só lugar.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo lead</button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#66766F" />
          <input placeholder="Buscar por nome..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <select className="chip-select" value={canalFiltro} onChange={e => setCanalFiltro(e.target.value)}>
          {canais.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Nome</th><th>Canal</th><th>Recebido em</th><th>Etapa</th></tr></thead>
          <tbody>
            {filtrados.map(l => {
              const etapa = etapaLead(l);
              return (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.nome}<div style={{ fontWeight: 400, fontSize: 12, color: 'var(--tinta-500)' }}>{l.telefone}</div></td>
                  <td>{canalIcon[l.origem] || ''} {l.origem}</td>
                  <td>{dayjs(l.criadoEm).format('DD/MM/YYYY HH:mm')}</td>
                  <td><span className={`badge ${etapa.tone}`}>{etapa.label}</span></td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={4}><div className="empty-state">Nenhum lead encontrado com esses filtros.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo lead</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field"><label>Nome</label>
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="field"><label>Telefone</label>
                  <input required value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" /></div>
                <div className="field"><label>Canal de origem</label>
                  <select value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })}>
                    {['Instagram Ads', 'Google Ads', 'Meta Ads', 'Indicação', 'WhatsApp', 'Site', 'Orgânico'].map(c => <option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
