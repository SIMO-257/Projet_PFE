import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = () => {
  const { isAuthenticated, isAuthChecked } = useAuth();

  // Allow public pages to render while auth is still being checked.
  // This lets /login appear immediately instead of waiting for profile fetch.
  if (!isAuthChecked) {
    return <Outlet />;
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;
