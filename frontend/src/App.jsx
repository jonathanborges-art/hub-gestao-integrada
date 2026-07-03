import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Agenda from './pages/Agenda.jsx';
import Financeiro from './pages/Financeiro.jsx';
import Assistente from './pages/Assistente.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
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
