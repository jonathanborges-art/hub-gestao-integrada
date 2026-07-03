import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarClock, Wallet, Sparkles, Settings, LogOut, TrendingUp,
  Filter, UserPlus, PhoneCall, CheckSquare, ShoppingBag, Globe, FileBarChart, Target, HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const comercialLinks = [
  { to: '/app/comercial', label: 'Visão Comercial', icon: TrendingUp, end: true },
  { to: '/app/comercial/funil', label: 'Funil Comercial', icon: Filter },
  { to: '/app/comercial/leads', label: 'Leads', icon: UserPlus },
  { to: '/app/comercial/agendamentos', label: 'Agendamentos', icon: PhoneCall },
  { to: '/app/comercial/comparecimentos', label: 'Comparecimentos', icon: CheckSquare },
  { to: '/app/comercial/vendas', label: 'Vendas', icon: ShoppingBag },
  { to: '/app/comercial/trafego', label: 'Tráfego', icon: Globe },
  { to: '/app/comercial/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/app/comercial/metas', label: 'Metas', icon: Target },
];

const operacionalLinks = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/pacientes', label: 'Pacientes', icon: Users },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarClock },
  { to: '/app/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/app/assistente', label: 'Assistente IA', icon: Sparkles },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

function NavGroup({ title, links }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', padding: '10px 12px 4px' }}>
          {title}
        </div>
      )}
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
    </div>
  );
}

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
        <NavGroup title="Comercial" links={comercialLinks} />
        <NavGroup title="Operacional" links={operacionalLinks} />
        <NavGroup links={[{ to: '/app/ajuda', label: 'Ajuda / Suporte', icon: HelpCircle }]} />
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
