import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import { Plus, X, Search } from 'lucide-react';

const emptyForm = { nome: '', email: '', senha: '', perfil: 'Master', clinicId: '' };

export default function MasterUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [busca, setBusca] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [erro, setErro] = useState('');

  const carregar = () => api.get('/master/usuarios').then(res => setUsuarios(res.data));
  useEffect(() => {
    carregar();
    api.get('/master/clinicas').then(res => setClinicas(res.data));
  }, []);

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
  );

  async function alternarAtivo(u) {
    const { data } = await api.put(`/master/usuarios/${u.id}`, { ativo: !u.ativo });
    setUsuarios(usuarios.map(x => x.id === u.id ? { ...x, ativo: data.ativo } : x));
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      const payload = { ...form, clinicId: form.perfil === 'Master' ? null : form.clinicId };
      const { data } = await api.post('/master/usuarios', payload);
      setUsuarios([{ ...data, clinicaNome: clinicas.find(c => c.id === data.clinicId)?.nome }, ...usuarios]);
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível criar o usuário.');
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow" style={{ color: '#8B5CF6' }}>Painel Master</div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-sub">Todos os usuários de todas as clínicas, em um só lugar.</p>
        </div>
        <button className="btn btn-primary" style={{ background: '#8B5CF6' }} onClick={() => setShowForm(true)}><Plus size={16} /> Novo usuário</button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#66766F" />
          <input placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Clínica</th><th>Perfil</th><th>Desde</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtrados.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.clinicaNome || <span style={{ color: 'var(--tinta-500)' }}>— (Master)</span>}</td>
                <td><span className="badge badge-grey">{u.perfil}</span></td>
                <td>{dayjs(u.createdAt).format('DD/MM/YYYY')}</td>
                <td><span className={`badge ${u.ativo ? 'badge-green' : 'badge-red'}`}>{u.ativo ? 'Ativo' : 'Desativado'}</span></td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => alternarAtivo(u)}>{u.ativo ? 'Desativar' : 'Reativar'}</button></td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={7}><div className="empty-state">Nenhum usuário encontrado.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo usuário</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field"><label>Nome</label>
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="field"><label>E-mail</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="field"><label>Senha provisória</label>
                  <input type="text" required minLength={6} value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} /></div>
                <div className="field-row">
                  <div className="field"><label>Perfil</label>
                    <select value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                      {['Master', 'Administrador', 'Recepção', 'Médico', 'Financeiro'].map(p => <option key={p}>{p}</option>)}
                    </select></div>
                  {form.perfil !== 'Master' && (
                    <div className="field"><label>Clínica</label>
                      <select required value={form.clinicId} onChange={e => setForm({ ...form, clinicId: e.target.value })}>
                        <option value="">Selecione...</option>
                        {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select></div>
                  )}
                </div>
                {erro && <div className="auth-error">{erro}</div>}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#8B5CF6' }}>Criar usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
