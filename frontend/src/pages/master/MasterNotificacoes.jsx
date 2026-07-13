import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../api/client.js';
import { Send } from 'lucide-react';

export default function MasterNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = () => api.get('/master/notificacoes').then(res => setNotificacoes(res.data));
  useEffect(() => { carregar(); }, []);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { data } = await api.post('/master/notificacoes', { titulo, mensagem });
      setNotificacoes([data, ...notificacoes]);
      setTitulo('');
      setMensagem('');
    } finally {
      setEnviando(false);
    }
  }

  async function alternarAtiva(n) {
    const { data } = await api.put(`/master/notificacoes/${n.id}`, { ativa: !n.ativa });
    setNotificacoes(notificacoes.map(x => x.id === n.id ? { ...x, ativa: data.ativa } : x));
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow" style={{ color: '#8B5CF6' }}>Painel Master</div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-sub">Escreva um aviso e ele aparece no Dashboard de todas as clínicas.</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="card card-pad">
          <div className="section-title">Nova notificação</div>
          <div className="section-sub">Assim que enviada, fica visível para todas as clínicas ativas.</div>
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Título</label>
              <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Manutenção programada" /></div>
            <div className="field"><label>Mensagem</label>
              <textarea required rows={4} value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Escreva o aviso que vai aparecer para as clínicas..." />
            </div>
            <button className="btn btn-primary" style={{ background: '#8B5CF6', justifyContent: 'center' }} type="submit" disabled={enviando}>
              <Send size={15} /> {enviando ? 'Enviando...' : 'Enviar para todas as clínicas'}
            </button>
          </form>
        </div>

        <div className="card card-pad">
          <div className="section-title">Histórico de notificações</div>
          <div className="section-sub">Desative uma notificação para tirá-la do ar sem apagar o histórico.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
            {notificacoes.map(n => (
              <div key={n.id} style={{ border: '1px solid var(--borda)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13 }}>{n.titulo}</strong>
                  <span className={`badge ${n.ativa ? 'badge-green' : 'badge-grey'}`}>{n.ativa ? 'Ativa' : 'Desativada'}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--tinta-500)', marginBottom: 6 }}>{n.mensagem}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--tinta-300)' }}>{dayjs(n.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => alternarAtiva(n)}>{n.ativa ? 'Desativar' : 'Reativar'}</button>
                </div>
              </div>
            ))}
            {notificacoes.length === 0 && <div className="empty-state">Nenhuma notificação enviada ainda.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
