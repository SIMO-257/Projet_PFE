import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAdmins, createAdmin, toggleAdminStatus, deleteAdminWithPassword } from '../../services/adminService';

const AdminAdmins = () => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ admin: null, password: '', error: '', submitting: false });
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdmins({ page });
      const data = response.data;
      setAdmins(data.admins.data);
      setPagination(data.admins);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const resetForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    });
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError(t('password_not_match') || 'Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await createAdmin(form);
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAdminStatus(id);
      fetchAdmins();
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      alert(msg);
    }
  };

  const handleDelete = (admin) => {
    setDeleteConfirm({ admin, password: '', error: '', submitting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteConfirm(prev => ({ ...prev, error: '', submitting: true }));
    try {
      await deleteAdminWithPassword(deleteConfirm.admin.id, { password: deleteConfirm.password });
      setDeleteConfirm({ admin: null, password: '', error: '', submitting: false });
      fetchAdmins();
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setDeleteConfirm(prev => ({ ...prev, error: msg, submitting: false }));
    }
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ admin: null, password: '', error: '', submitting: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin_management_title')}</h2>
          <p className="text-white/50">{t('admin_management_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-500/20"
        >
          + {t('admin_add')}
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">{t('admin_table_name')}</th>
              <th className="px-6 py-4 font-medium">{t('admin_table_email')}</th>
              <th className="px-6 py-4 font-medium">{t('admin_table_role')}</th>
              <th className="px-6 py-4 font-medium">{t('admin_table_status')}</th>
              <th className="px-6 py-4 font-medium">{t('admin_table_created')}</th>
              <th className="px-6 py-4 font-medium">{t('admin_table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && admins.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('admin_loading')}</td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('admin_no_admins')}</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-sm shrink-0">
                        {admin.first_name?.charAt(0) || 'A'}
                      </div>
                      <div className="text-sm font-medium text-white">
                        {admin.first_name} {admin.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      admin.is_super_admin
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {admin.is_super_admin ? t('admin_super_admin') : t('admin_regular')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      admin.is_active
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {admin.is_active ? t('admin_active') : t('admin_inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        disabled={admin.is_super_admin}
                        title={admin.is_super_admin ? 'Cannot modify super admin' : (admin.is_active ? t('admin_deactivate') : t('admin_activate'))}
                        className={`p-2 rounded-lg transition-all ${
                          admin.is_super_admin
                            ? 'text-white/20 cursor-not-allowed'
                            : admin.is_active
                              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                              : 'text-green-400 hover:bg-green-500/10 hover:text-green-300'
                        }`}
                      >
                        {admin.is_active ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={admin.is_super_admin}
                        title={admin.is_super_admin ? 'Cannot delete super admin' : t('admin_delete')}
                        className={`p-2 rounded-lg transition-all ${
                          admin.is_super_admin
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-white/40 hover:bg-red-500/10 hover:text-red-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.admin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-[#1a0507] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {t('admin_confirm_delete')}
              </h3>
              <button
                onClick={closeDeleteConfirm}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-white/70 text-sm">
                Vous êtes sur le point de supprimer <strong className="text-white">{deleteConfirm.admin.first_name} {deleteConfirm.admin.last_name}</strong>.
                Cette action est irréversible. Veuillez confirmer avec votre mot de passe.
              </p>

              {deleteConfirm.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {deleteConfirm.error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">{t('password_label') || 'Votre mot de passe'}</label>
                <input
                  type="password"
                  value={deleteConfirm.password}
                  onChange={(e) => setDeleteConfirm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !deleteConfirm.submitting && deleteConfirm.password.trim()) handleDeleteConfirm(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  {t('admin_cancel')}
                </button>
                <button
                  type="button"
                  disabled={deleteConfirm.submitting || !deleteConfirm.password.trim()}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteConfirm.submitting ? 'Suppression...' : t('admin_delete_action') || 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-[#1a0507] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">{t('admin_add_title')}</h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t('admin_first_name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t('admin_last_name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="admin@casaway.ma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t('admin_password')} *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">{t('admin_confirm_password')} *</label>
                  <input
                    type="password"
                    required
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  {t('admin_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('admin_creating') : t('admin_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
