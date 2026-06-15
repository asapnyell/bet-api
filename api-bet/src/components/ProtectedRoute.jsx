import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading, authenticated } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Se o perfil não for o permitido, manda de volta para a rota padrão dele
    return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  }

  return children;
}