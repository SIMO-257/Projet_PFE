import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminGuard() {
  const { isAuthenticated } = useSelector((state) => state.admin);

  // Also check localStorage for token persistence across reload
  const token = localStorage.getItem('admin_token');

  if (!isAuthenticated && !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
