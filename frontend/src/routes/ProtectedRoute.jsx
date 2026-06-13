import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export { ProtectedRoute, GuestRoute };
