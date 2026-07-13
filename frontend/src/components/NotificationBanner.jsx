import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import api from '../api/client.js';

export default function NotificationBanner() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [dispensadas, setDispensadas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hg_notif_dismissed') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    api.get('/notificacoes/ativas').then(res => setNotificacoes(res.data)).catch(() => {});
  }, []);

  function dispensar(id) {
    const novo = [...dispensadas, id];
    setDispensadas(novo);
    localStorage.setItem('hg_notif_dismissed', JSON.stringify(novo));
  }

  const visiveis = notificacoes.filter(n => !dispensadas.includes(n.id));
  if (visiveis.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
      {visiveis.map(n => (
        <div key={n.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
          background: 'var(--verde-50)', border: '1px solid var(--verde-100)', borderRadius: 10,
        }}>
          <Bell size={16} color="#017A5B" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--verde-700)' }}>{n.titulo}</div>
            <div style={{ fontSize: 12.5, color: 'var(--tinta-700)' }}>{n.mensagem}</div>
          </div>
          <button onClick={() => dispensar(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--tinta-500)' }}>
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
