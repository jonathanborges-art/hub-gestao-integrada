import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function MasterRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="empty-state">Carregando...</div>;
  }
  if (!user) {
    return <Navigate to="/entrar" replace />;
  }
  if (user.perfil !== 'Master') {
    return <Navigate to="/app" replace />;
  }
  return children;
}
