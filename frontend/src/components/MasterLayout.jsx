import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Users, Bell, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/master', label: 'Clínicas', icon: Building2, end: true },
  { to: '/master/usuarios', label: 'Usuários', icon: Users },
  { to: '/master/notificacoes', label: 'Notificações', icon: Bell },
];

export default function MasterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/entrar');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ background: '#1A1033' }}>
        <div className="sidebar-brand" style={{ borderColor: 'rgba(255,255,255,.12)' }}>
          <div className="sidebar-brand-mark" style={{ background: '#8B5CF6', color: '#fff' }}><ShieldCheck size={16} /></div>
          <div className="sidebar-brand-text">
            <strong>Hub Gestão</strong>
            <span>Painel Master</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              style={({ isActive }) => isActive ? { background: '#8B5CF6' } : undefined}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div style={{ marginBottom: 8, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{user?.nome}</div>
          <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent' }} onClick={sair}>
            <LogOut size={16} strokeWidth={2} /><span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
