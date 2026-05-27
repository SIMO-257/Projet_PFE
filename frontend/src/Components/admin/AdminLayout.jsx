import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const panelRef = useRef(null);
  const profileBtnRef = useRef(null);

  // Fetch admin profile on mount if not already loaded (e.g. page refresh)
  useEffect(() => {
    if (!admin && getAdminToken()) {
      dispatch(fetchAdminMe());
    }
  }, []);

  // Click outside to close profile panel
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        profileBtnRef.current && !profileBtnRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const closePanel = useCallback(() => {
    setProfileOpen(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen((prev) => !prev);
  }, []);

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

        {/* --- SWAPPABLE AREA: Nav ↔ Profile Panel --- */}
        <div className="flex-1 relative overflow-hidden">
          {/* Navigation */}
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              profileOpen
                ? 'opacity-0 translate-y-2 pointer-events-none'
                : 'opacity-100 translate-y-0 pointer-events-auto'
            }`}
          >
            <nav className="px-4 space-y-2 py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closePanel}
                  className={({ isActive }) =>
                    `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                        : 'text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon === 'grid' && '⊞'}
                    {item.icon === 'users' && '👥'}
                    {item.icon === 'ticket' && '🎫'}
                    {item.icon === 'credit-card' && '💳'}
                    {item.icon === 'bell' && '🔔'}
                    {item.icon === 'message' && '💬'}
                    {item.icon === 'graduation' && '🎓'}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Profile Panel (no duplicate icon/name/email — already in header below) */}
          <div
            ref={panelRef}
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              profileOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center px-6 pt-12 space-y-4">
              {/* Badge subtil */}
              <div
                className="text-center"
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0s' }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500/25 to-yellow-600/10 flex items-center justify-center text-yellow-500 font-bold text-2xl border-2 border-yellow-500/20">
                  {admin?.first_name?.charAt(0) || 'A'}
                </div>
                <p className="text-sm text-white/40 mt-2">{t('admin_my_profile')}</p>
              </div>

              {/* Mon Profil */}
              <NavLink
                to="/admin/profil"
                onClick={closePanel}
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0.08s' }}
                className="group w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98] transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="transition-all duration-200 group-hover:tracking-wider">{t('admin_my_profile')}</span>
              </NavLink>

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0.16s' }}
                className="group w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98] transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="transition-all duration-200 group-hover:tracking-wider">{t('admin_logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- PROFILE HEADER (always visible, clickable toggle) --- */}
        <button
          ref={profileBtnRef}
          onClick={toggleProfile}
          className={`w-full p-4 border-t transition-all duration-200 ${
            profileOpen
              ? 'border-yellow-500/30 bg-yellow-500/10'
              : 'border-white/10 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold shrink-0">
              {admin?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-medium truncate">
                {admin?.first_name} {admin?.last_name}
              </p>
              <p className="text-xs text-white/40 truncate">{admin?.email}</p>
            </div>
            {/* Chevron indicator */}
            <svg
              className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                profileOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
