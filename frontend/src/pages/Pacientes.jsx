import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { Search, Plus, X, FileText, Wallet, IdCard } from 'lucide-react';

function iniciais(nome) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

const emptyForm = {
  nome: '', telefone: '', email: '', convenio: 'Particular', dataNascimento: '', endereco: '',
};

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [convenioFiltro, setConvenioFiltro] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selecionado, setSelecionado] = useState(null);
  const [aba, setAba] = useState('dados');
  const [prontuarios, setProntuarios] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  const carregar = () => api.get('/pacientes').then(res => setPacientes(res.data));
  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (!selecionado) return;
    api.get('/prontuarios').then(res => setProntuarios(res.data.filter(p => p.pacienteId === selecionado.id)));
    api.get('/financeiro').then(res => setTransacoes(res.data.filter(t => t.descricao?.includes(selecionado.nome))));
  }, [selecionado]);

  const convenios = useMemo(() => ['Todos', ...new Set(pacientes.map(p => p.convenio))], [pacientes]);

  const filtrados = pacientes.filter(p => {
    const okBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const okConv = convenioFiltro === 'Todos' || p.convenio === convenioFiltro;
    return okBusca && okConv;
  });

  async function salvar(e) {
    e.preventDefault();
    const novo = { ...form, tags: [], ativo: true, lgpdAceite: true, lgpdData: new Date().toISOString().slice(0, 10) };
    const { data } = await api.post('/pacientes', novo);
    setPacientes([data, ...pacientes]);
    setShowForm(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">CRM de Pacientes</div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-sub">Centralize o histórico e transforme cada contato em um paciente fidelizado.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo paciente</button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#66766F" />
          <input placeholder="Buscar por nome…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <select className="chip-select" value={convenioFiltro} onChange={e => setConvenioFiltro(e.target.value)}>
          {convenios.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Paciente</th><th>Contato</th><th>Convênio</th><th>Etiquetas</th><th></th></tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setSelecionado(p); setAba('dados'); }}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar">{iniciais(p.nome)}</div>{p.nome}
                </td>
                <td>{p.telefone}</td>
                <td>{p.convenio}</td>
                <td>{p.tags?.map(t => <span key={t} className="badge badge-green" style={{ marginRight: 4 }}>{t}</span>)}</td>
                <td><button className="btn btn-ghost btn-sm">Abrir</button></td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state">Nenhum paciente encontrado com esses filtros.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo paciente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field"><label>Nome completo</label>
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="field-row">
                  <div className="field"><label>Telefone</label>
                    <input required value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
                  <div className="field"><label>E-mail</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Data de nascimento</label>
                    <input type="date" value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} /></div>
                  <div className="field"><label>Convênio</label>
                    <select value={form.convenio} onChange={e => setForm({ ...form, convenio: e.target.value })}>
                      {['Particular', 'Unimed Vitória', 'Bradesco Saúde', 'Amil', 'SulAmérica'].map(c => <option key={c}>{c}</option>)}
                    </select></div>
                </div>
                <div className="field"><label>Endereço</label>
                  <input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selecionado && (
        <div className="modal-overlay" onClick={() => setSelecionado(null)}>
          <div className="modal-panel" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40 }}>{iniciais(selecionado.nome)}</div>
                <div>
                  <h3>{selecionado.nome}</h3>
                  <div className="section-sub" style={{ marginBottom: 0 }}>{selecionado.convenio} · {selecionado.telefone}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelecionado(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="tabs">
                <button className={`tab-btn ${aba === 'dados' ? 'active' : ''}`} onClick={() => setAba('dados')}><IdCard size={14} style={{ marginRight: 5, verticalAlign: -2 }} />Dados</button>
                <button className={`tab-btn ${aba === 'clinico' ? 'active' : ''}`} onClick={() => setAba('clinico')}><FileText size={14} style={{ marginRight: 5, verticalAlign: -2 }} />Prontuário</button>
                <button className={`tab-btn ${aba === 'financeiro' ? 'active' : ''}`} onClick={() => setAba('financeiro')}><Wallet size={14} style={{ marginRight: 5, verticalAlign: -2 }} />Financeiro</button>
              </div>

              {aba === 'dados' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                  <div><strong>E-mail:</strong> {selecionado.email || '—'}</div>
                  <div><strong>Data de nascimento:</strong> {selecionado.dataNascimento || '—'}</div>
                  <div><strong>Endereço:</strong> {selecionado.endereco || '—'}</div>
                  <div><strong>Termo LGPD:</strong> <span className="badge badge-green">Aceito em {selecionado.lgpdData}</span></div>
                </div>
              )}

              {aba === 'clinico' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {prontuarios.length === 0 && <div className="empty-state">Nenhuma evolução registrada ainda.</div>}
                  {prontuarios.map(p => (
                    <div key={p.id} className="card card-pad">
                      <div className="badge badge-grey" style={{ marginBottom: 8 }}>{p.data}</div>
                      <div style={{ fontSize: 13.5 }}>{p.evolucao}</div>
                    </div>
                  ))}
                </div>
              )}

              {aba === 'financeiro' && (
                <table className="data-table">
                  <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead>
                  <tbody>
                    {transacoes.length === 0 && <tr><td colSpan={4}><div className="empty-state">Sem lançamentos para este paciente.</div></td></tr>}
                    {transacoes.map(t => (
                      <tr key={t.id}>
                        <td>{t.data}</td><td>{t.descricao}</td>
                        <td>{t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td><span className={`badge ${t.status === 'pago' ? 'badge-green' : 'badge-amber'}`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
