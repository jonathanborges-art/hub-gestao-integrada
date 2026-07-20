import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading, impersonating } = useAuth();

  if (loading) {
    return <div className="empty-state">Carregando...</div>;
  }
  if (!user) {
    return <Navigate to="/entrar" replace />;
  }
  // Master só é redirecionado pro /master se NÃO estiver "acessando como" uma clínica.
  if (user.perfil === 'Master' && !impersonating) {
    return <Navigate to="/master" replace />;
  }
  return children;
}
