import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarClock, Wallet, Sparkles, Settings } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/agenda', label: 'Agenda', icon: CalendarClock },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/assistente', label: 'Assistente IA', icon: Sparkles },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
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
      <div className="sidebar-foot">Clínica Vitória Saúde<br/>Integrada · v1.0</div>
    </aside>
  );
}
