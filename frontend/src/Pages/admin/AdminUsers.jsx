import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getUsers, toggleUserStatus } from '../../services/adminService';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ search, page });
      setUsers(response.data.data.data);
      setPagination(response.data.data);
    } catch (err) {
      console.error(t('purchase_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleToggleStatus = async (id) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
      await toggleUserStatus(id);
    } catch (err) {
      // Revert on error
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin_client_management')}</h2>
          <p className="text-white/50">{t('admin_client_subtitle')}</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={t('search_name_email')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-yellow-500/50 transition-all"
          />
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">{t('table_name')}</th>
              <th className="px-6 py-4 font-medium">{t('table_email')}</th>
              <th className="px-6 py-4 font-medium">{t('table_status')}</th>
              <th className="px-6 py-4 font-medium">{t('table_registration')}</th>
              <th className="px-6 py-4 font-medium">{t('table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">{t('loading_clients')}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">{t('no_client_found')}</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.is_active 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {user.is_active ? t('status_active_admin') : t('status_blocked_admin')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                        user.is_active
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {user.is_active ? t('action_block') : t('action_unblock')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && pagination.last_page > 1 && (
          <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center space-x-2">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === p
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
