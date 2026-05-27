import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAdminMe, logoutAdmin } from '../../Redux/Slices/adminSlice';
import { getAdminToken } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { admin } = useSelector((state) => state.admin);

  // Fetch admin profile on mount if not already loaded (e.g. page refresh)
  useEffect(() => {
    if (!admin && getAdminToken()) {
      dispatch(fetchAdminMe());
    }
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: t('admin_dashboard'), icon: 'grid' },
    { path: '/admin/users', label: t('admin_nav_clients'), icon: 'users' },
    { path: '/admin/tickets', label: t('admin_nav_tickets'), icon: 'ticket' },
    { path: '/admin/transactions', label: t('admin_nav_transactions'), icon: 'credit-card' },
    { path: '/admin/notifications', label: t('admin_nav_notifications'), icon: 'bell' },
    { path: '/admin/rapports', label: t('admin_nav_rapports') || 'Rapports', icon: 'message' },
    { path: '/admin/student-verifications', label: 'Vérifications Étudiant', icon: 'graduation' },
  ];

  return (
    <div className="flex h-screen bg-[#1a0507] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            CasaWay Admin
          </h1>
          <p className="text-xs text-white/50 mt-1">{t('admin_management_system')}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
              {admin?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{admin?.first_name} {admin?.last_name}</p>
              <p className="text-xs text-white/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <NavLink
            to="/admin/profil"
            className={({ isActive }) =>
              `w-full flex items-center justify-center space-x-2 px-4 py-2 mb-2 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span>{t('admin_my_profile')}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
          >
            <span>{t('admin_logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
