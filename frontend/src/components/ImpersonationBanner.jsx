import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ImpersonationBanner() {
  const { impersonating, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!impersonating) return null;

  function sair() {
    stopImpersonation();
    navigate('/master');
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
      background: '#1A1033', color: '#fff', fontSize: 13,
      borderRadius: 10, marginBottom: 18, flexWrap: 'wrap',
    }}>
      <ShieldCheck size={16} color="#8B5CF6" />
      <span>
        Modo Master — acessando como <strong>{impersonating.nome}</strong>. Você pode ver e editar os dados desta clínica.
      </span>
      <button
        onClick={sair}
        style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 8,
          padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}
      >
        <LogOut size={13} /> Voltar ao Master
      </button>
    </div>
  );
}
