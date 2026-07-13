import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MasterRoute from './components/MasterRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import MasterLayout from './components/MasterLayout.jsx';
import ExternalRedirect from './components/ExternalRedirect.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Comercial from './pages/Comercial.jsx';
import FunilComercial from './pages/comercial/FunilComercial.jsx';
import Leads from './pages/comercial/Leads.jsx';
import AgendamentosComerciais from './pages/comercial/AgendamentosComerciais.jsx';
import Comparecimentos from './pages/comercial/Comparecimentos.jsx';
import Vendas from './pages/comercial/Vendas.jsx';
import Trafego from './pages/comercial/Trafego.jsx';
import Relatorios from './pages/comercial/Relatorios.jsx';
import Metas from './pages/comercial/Metas.jsx';
import Ajuda from './pages/comercial/Ajuda.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Agenda from './pages/Agenda.jsx';
import Financeiro from './pages/Financeiro.jsx';
import Assistente from './pages/Assistente.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import MasterClinicas from './pages/master/MasterClinicas.jsx';
import MasterUsuarios from './pages/master/MasterUsuarios.jsx';
import MasterNotificacoes from './pages/master/MasterNotificacoes.jsx';

const SITE_INSTITUCIONAL = 'https://jonathanborges-art.github.io/HUB-GEST-O-INTEGRADA/';
const SITE_LOGIN = 'https://jonathanborges-art.github.io/HUB-GEST-O-INTEGRADA/login.html';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* A "porta da frente" agora é o site institucional. Quem cair aqui direto é levado pra lá. */}
        <Route path="/" element={<ExternalRedirect to={SITE_INSTITUCIONAL} />} />
        <Route path="/entrar" element={<ExternalRedirect to={SITE_LOGIN} />} />

        {/* Cadastro continua aqui dentro do app (o site institucional linka pra cá) */}
        <Route path="/criar-conta" element={<Cadastro />} />

        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="comercial" element={<Comercial />} />
          <Route path="comercial/funil" element={<FunilComercial />} />
          <Route path="comercial/leads" element={<Leads />} />
          <Route path="comercial/agendamentos" element={<AgendamentosComerciais />} />
          <Route path="comercial/comparecimentos" element={<Comparecimentos />} />
          <Route path="comercial/vendas" element={<Vendas />} />
          <Route path="comercial/trafego" element={<Trafego />} />
          <Route path="comercial/relatorios" element={<Relatorios />} />
          <Route path="comercial/metas" element={<Metas />} />
          <Route path="ajuda" element={<Ajuda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="assistente" element={<Assistente />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="/master" element={<MasterRoute><MasterLayout /></MasterRoute>}>
          <Route index element={<MasterClinicas />} />
          <Route path="usuarios" element={<MasterUsuarios />} />
          <Route path="notificacoes" element={<MasterNotificacoes />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
