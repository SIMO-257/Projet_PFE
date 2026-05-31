import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAdminMe, logoutAdmin } from '../../Redux/Slices/adminSlice';
import { getAdminToken } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';
import iconMap from '../../assets/adminIcons';

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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Persist collapse state across page navigation
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved === 'true';
  });

  const navItems = [
    { path: '/admin/dashboard', label: t('admin_dashboard'), icon: 'dashboard' },
    { path: '/admin/users', label: t('admin_nav_users'), icon: 'users' },
    { path: '/admin/tickets', label: t('admin_nav_tickets'), icon: 'ticket' },
    { path: '/admin/transactions', label: t('admin_nav_transactions'), icon: 'credit-card' },
    { path: '/admin/notifications', label: t('admin_nav_notifications'), icon: 'bell' },
    { path: '/admin/rapports', label: t('admin_nav_rapports') || 'Rapports', icon: 'message' },
    { path: '/admin/student-verifications', label: 'Vérifications Étudiant', icon: 'graduation' },
    { path: '/admin/validator', label: 'Validateur QR', icon: 'qr' },
  ];

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 text-white">
      {/* Mobile hamburger button (visible on small screens) */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#1a0507] to-[#0d0304] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-white/40 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo area — adapts to collapsed state */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center p-4' : 'p-6'}`}>
          {sidebarCollapsed ? (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-500/20 flex items-center justify-center">
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">CW</span>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                CasaWay Admin
              </h1>
              <p className="text-xs text-white/50 mt-1">{t('admin_management_system')}</p>
            </>
          )}
        </div>

        {/* --- SWAPPABLE AREA: Nav ↔ Profile Panel --- */}
        <div className="flex-1 relative overflow-y-auto">
          {/* Navigation */}
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              profileOpen
                ? 'opacity-0 translate-y-2 pointer-events-none'
                : 'opacity-100 translate-y-0 pointer-events-auto'
            }`}
          >
            <nav className={`${sidebarCollapsed ? 'px-2 space-y-1 py-2' : 'px-4 space-y-2 py-2'}`}>
              {navItems.map((item) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => { closePanel(); closeMobileSidebar(); }}
                    className={({ isActive }) =>
                      `group flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                          : 'text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-1'
                      } ${sidebarCollapsed ? 'justify-center mx-auto w-full max-w-[44px]' : ''}`
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${sidebarCollapsed ? 'w-5 h-5 flex items-center justify-center' : ''}`}>
                      {IconComponent ? <IconComponent className="w-5 h-5" /> : null}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Profile Panel */}
          <div
            ref={panelRef}
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              profileOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className={`flex flex-col items-center ${sidebarCollapsed ? 'px-2 pt-8 space-y-3' : 'px-6 pt-12 space-y-4'}`}>
              <div
                className="text-center"
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0s' }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500/25 to-yellow-600/10 flex items-center justify-center text-yellow-500 font-bold text-2xl border-2 border-yellow-500/20">
                  {admin?.first_name?.charAt(0) || 'A'}
                </div>
                <p className="text-sm text-white/40 mt-2">{t('admin_my_profile')}</p>
              </div>

              <NavLink
                to="/admin/profil"
                onClick={closePanel}
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0.08s' }}
                className="group w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98] transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {!sidebarCollapsed && <span className="transition-all duration-200 group-hover:tracking-wider">{t('admin_my_profile')}</span>}
              </NavLink>

              <button
                onClick={handleLogout}
                style={{ animation: profileOpen ? 'staggerFadeIn 0.4s ease-out both' : 'none', animationDelay: '0.16s' }}
                className="group w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98] transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!sidebarCollapsed && <span className="transition-all duration-200 group-hover:tracking-wider">{t('admin_logout')}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* --- DESKTOP COLLAPSE TOGGLE + PROFILE HEADER --- */}
        <div className="border-t border-white/10">
          {/* Collapse toggle — visible on desktop */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex w-full items-center justify-center py-2.5 text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-200 border-b border-white/5"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Profile header */}
          <button
            ref={profileBtnRef}
            onClick={toggleProfile}
            className={`w-full p-4 transition-all duration-200 ${
              profileOpen
                ? 'bg-yellow-500/10'
                : 'hover:bg-white/5'
            } ${sidebarCollapsed ? 'flex justify-center' : ''}`}
          >
            <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold shrink-0">
                {admin?.first_name?.charAt(0) || 'A'}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-medium truncate">
                      {admin?.first_name} {admin?.last_name}
                    </p>
                    <p className="text-xs text-white/40 truncate">{admin?.email}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white/40 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-16 lg:pt-8 transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
