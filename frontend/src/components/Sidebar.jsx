import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarClock, Wallet, Sparkles, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/pacientes', label: 'Pacientes', icon: Users },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarClock },
  { to: '/app/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/app/assistente', label: 'Assistente IA', icon: Sparkles },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/entrar');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">HG</div>
        <div className="sidebar-brand-text">
          <strong>Hub Gestão</strong>
          <span>Integrada</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
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
  );
}
