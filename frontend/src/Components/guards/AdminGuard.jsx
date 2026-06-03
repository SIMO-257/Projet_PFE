import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchAdminMe } from '../../Redux/Slices/adminSlice';

export default function AdminGuard() {
  const dispatch = useDispatch();
  const { isAuthenticated, adminChecked, loading } = useSelector((state) => state.admin);
  const mustChangePassword = useSelector((state) => state.admin.mustChangePassword);
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');

  // On mount, verify the token with the backend if we haven't checked yet
  useEffect(() => {
    if (!adminChecked && token) {
      dispatch(fetchAdminMe());
    }
  }, [dispatch, adminChecked, token]);

  // While checking token validity, show a loading state
  if (!adminChecked && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0507] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Vérification...</p>
        </div>
      </div>
    );
  }

  // No token at all → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Must change password → redirect to force password change page
  if (mustChangePassword) {
    return <Navigate to="/admin/force-password-reset" replace />;
  }

  return <Outlet />;
}
