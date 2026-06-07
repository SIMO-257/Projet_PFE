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
    { path: '/admin/ticket-types', label: t('admin_nav_ticket_types'), icon: 'tag' },
    { path: '/admin/rapports', label: t('admin_nav_rapports') || 'Rapports', icon: 'message' },
    { path: '/admin/student-verifications', label: t('admin_nav_student_verifications'), icon: 'graduation' },
    { path: '/admin/audit-logs', label: t('admin_nav_audit_logs'), icon: 'history' },
    { path: '/admin/validator', label: t('admin_nav_validator'), icon: 'qr' },
    ...(admin?.is_super_admin ? [{ path: '/admin/admins', label: t('admin_management'), icon: 'shield' }] : []),
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
          sidebarCollapsed ? 'w-24' : 'w-72'
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
        <div className={`flex ${sidebarCollapsed ? 'justify-center p-4' : 'flex-col items-start p-6'}`}>
          {sidebarCollapsed ? (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-500/20 flex items-center justify-center">
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">CW</span>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-wide">
                CasaWay Admin
              </h1>
              <p className="text-xs text-white/40 mt-1.5 font-medium uppercase tracking-wider">{t('admin_management_system')}</p>
            </>
          )}
        </div>

        {/* --- Navigation --- */}
        <div className="flex-1 overflow-y-auto">
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
                    } ${sidebarCollapsed ? 'justify-center mx-auto w-full max-w-[52px]' : ''}`
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

        {/* --- DESKTOP COLLAPSE TOGGLE + PROFILE HEADER --- */}
        <div className="border-t border-white/10 relative">
          {/* Floating Profile Dropdown */}
          {profileOpen && (
            <div
              ref={panelRef}
              className={`absolute bottom-full left-4 right-4 mb-2 bg-[#1a0507] border border-white/10 rounded-xl p-4 shadow-2xl z-50 transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? 'w-48 left-1/2 -translate-x-1/2' : ''
              }`}
              style={{ animation: 'staggerFadeIn 0.3s ease-out both' }}
            >
              <div className="flex flex-col space-y-3">
                {sidebarCollapsed && (
                  <div className="text-center pb-2 border-b border-white/5">
                    <p className="text-xs font-semibold truncate">{admin?.first_name} {admin?.last_name}</p>
                    <p className="text-[10px] text-white/40 truncate">{admin?.email}</p>
                  </div>
                )}
                <NavLink
                  to="/admin/profil"
                  onClick={closePanel}
                  className="group w-full flex items-center justify-center space-x-2.5 px-3.5 py-2.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t('admin_my_profile')}</span>
                </NavLink>

                <NavLink
                  to="/admin/settings"
                  onClick={closePanel}
                  className="group w-full flex items-center justify-center space-x-2.5 px-3.5 py-2.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('admin_settings')}</span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center justify-center space-x-2.5 px-3.5 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('admin_logout')}</span>
                </button>
              </div>
            </div>
          )}
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
