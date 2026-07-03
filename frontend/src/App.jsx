import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import ExternalRedirect from './components/ExternalRedirect.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Agenda from './pages/Agenda.jsx';
import Financeiro from './pages/Financeiro.jsx';
import Assistente from './pages/Assistente.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

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
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="assistente" element={<Assistente />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
