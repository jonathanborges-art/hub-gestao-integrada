import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Agenda from './pages/Agenda.jsx';
import Financeiro from './pages/Financeiro.jsx';
import Assistente from './pages/Assistente.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </main>
    </div>
  );
}
