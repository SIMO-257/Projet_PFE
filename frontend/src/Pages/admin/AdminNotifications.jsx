import React, { useEffect, useState, useCallback } from 'react';
import { sendAdminNotification, getUsers, getNotificationLog, exportNotificationLog, getAdmin } from '../../services/adminService';

const TYPE_BADGES = {
  validation: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  payment: 'bg-green-500/10 text-green-400 border border-green-500/20',
  security: 'bg-red-500/10 text-red-400 border border-red-500/20',
  promo: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  system: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const AdminNotifications = () => {
  // ── Send form state ──
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', type: 'system', target: 'all', user_email: '', user_id: null,
  });
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState(null);
  const [sendError, setSendError] = useState(null);

  // ── Archive state ──
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // ── Admin info modal ──
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminDetail, setAdminDetail] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Types that can have an admin sender
  const ADMIN_SENDER_TYPES = ['system', 'security'];
  const showAdminColumn = !typeFilter || ADMIN_SENDER_TYPES.includes(typeFilter);

  // ── Fetch archive ──
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page };
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const response = await getNotificationLog(params);
      setNotifications(response.data.data.data);
      setPagination(response.data.data);
    } catch (err) {
      console.error('Error loading notification log', err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Send form handlers ──
  const resetForm = () => {
    setForm({ title: '', body: '', type: 'system', target: 'all', user_email: '', user_id: null });
    setSendMessage(null);
    setSendError(null);
  };

  const handleTargetChange = (e) => {
    setForm({ ...form, target: e.target.value, user_email: '', user_id: null });
  };

  const lookupUser = async () => {
    if (form.target !== 'single' || !form.user_email) return;
    try {
      const response = await getUsers({ search: form.user_email });
      const user = response.data.data.data.find(c => c.email === form.user_email);
      if (user) {
        setForm({ ...form, user_id: user.id });
        setSendError(null);
      } else {
        setSendError('Utilisateur non trouvé.');
        setForm({ ...form, user_id: null });
      }
    } catch (err) {
      setSendError('Erreur lors de la recherche.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.target === 'single' && !form.user_id) {
      setSendError('Veuillez sélectionner un utilisateur valide.');
      return;
    }
    try {
      setSending(true);
      setSendMessage(null);
      setSendError(null);
      const payload = { title: form.title, body: form.body, type: form.type, target: form.target, user_id: form.user_id };
      const response = await sendAdminNotification(payload);
      setSendMessage(response.data.message);
      resetForm();
      // Refresh archive
      fetchLogs();
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setSendError(firstError);
      } else {
        setSendError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
      }
    } finally {
      setSending(false);
    }
  };

  // ── Admin info popup ──
  const handleAdminClick = async (adminId) => {
    if (!adminId) return;
    setSelectedAdmin(adminId);
    setAdminDetail(null);
    setAdminLoading(true);
    try {
      const res = await getAdmin(adminId);
      setAdminDetail(res.data.admin || res.data.data);
    } catch {
      setAdminDetail({ id: adminId, first_name: 'Admin', last_name: '', email: '' });
    } finally {
      setAdminLoading(false);
    }
  };

  const closeAdminModal = () => {
    setSelectedAdmin(null);
    setAdminDetail(null);
  };

  // ── Export ──
  const handleExport = () => {
    exportNotificationLog({ type: typeFilter });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-white/50">Historique des notifications et envoi de nouveaux messages.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
            showForm
              ? 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-500/20'
          }`}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Envoyer une notification
            </>
          )}
        </button>
      </div>

      {/* ── Send Form (collapsible) ── */}
      {showForm && (
        <div className="animate-fadeIn">
          <form onSubmit={handleSubmit} className="bg-[#1a0507]/80 border border-white/10 p-8 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Nouvelle notification</h3>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Titre</label>
              <input type="text" maxLength={100} value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                placeholder="Ex: Promotion Spéciale" required />
              <div className="text-right text-[10px] text-white/30">{form.title.length}/100</div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Message</label>
              <textarea maxLength={255} rows={4} value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                placeholder="Contenu de la notification..." required />
              <div className="text-right text-[10px] text-white/30">{form.body.length}/255</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer">
                  <option value="system" className="bg-[#1a0507] text-white">Système</option>
                  <option value="promo" className="bg-[#1a0507] text-white">Promotion</option>
                  <option value="security" className="bg-[#1a0507] text-white">Sécurité</option>
                  <option value="payment" className="bg-[#1a0507] text-white">Paiement</option>
                  <option value="validation" className="bg-[#1a0507] text-white">Validation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Cible</label>
                <div className="flex items-center space-x-4 h-[50px]">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="target" value="all" checked={form.target === 'all'}
                      onChange={handleTargetChange} className="accent-yellow-500" />
                    <span className="text-sm text-white/70">Tous</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="target" value="single" checked={form.target === 'single'}
                      onChange={handleTargetChange} className="accent-yellow-500" />
                    <span className="text-sm text-white/70">Un utilisateur</span>
                  </label>
                </div>
              </div>
            </div>

            {form.target === 'single' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-white/70 text-sm font-medium">Email de l'utilisateur</label>
                <input type="email" value={form.user_email}
                  onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                  onBlur={lookupUser}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${form.user_id ? 'border-green-500/50' : 'border-white/10 focus:border-yellow-500/50'}`}
                  placeholder="user@email.com" required />
                {form.user_id && <p className="text-[10px] text-green-400">Utilisateur validé !</p>}
              </div>
            )}

            {sendMessage && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{sendMessage}</div>}
            {sendError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{sendError}</div>}

            <button type="submit" disabled={sending || (form.target === 'single' && !form.user_id)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20">
              {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
            </button>
          </form>
        </div>
      )}

      {/* ── Archive Filters ── */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Historique des envois</h3>
        <div className="flex space-x-3">
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-48 focus:outline-none focus:border-yellow-500/50" />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer">
            <option value="" className="bg-[#1a0507] text-white">Tous les types</option>
            <option value="validation" className="bg-[#1a0507] text-white">Validation</option>
            <option value="payment" className="bg-[#1a0507] text-white">Paiement</option>
            <option value="security" className="bg-[#1a0507] text-white">Sécurité</option>
            <option value="promo" className="bg-[#1a0507] text-white">Promo</option>
            <option value="system" className="bg-[#1a0507] text-white">Système</option>
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Archive Table ── */}
      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Titre</th>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium">Destinataire</th>
              {showAdminColumn && <th className="px-6 py-4 font-medium">Envoyé par</th>}
              <th className="px-6 py-4 font-medium">Lu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && notifications.length === 0 ? (
              <tr>
                <td colSpan={showAdminColumn ? '7' : '6'} className="px-6 py-12 text-center text-white/40">Chargement...</td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={showAdminColumn ? '7' : '6'} className="px-6 py-12 text-center text-white/40">Aucune notification trouvée.</td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white/50 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${TYPE_BADGES[n.type] || 'bg-white/5 text-white/60'}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium max-w-[180px] truncate">{n.title}</td>
                  <td className="px-6 py-4 text-sm text-white/70 max-w-[220px] truncate">{n.body}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{n.user?.full_name || '—'}</div>
                    <div className="text-xs text-white/40">{n.user?.email || ''}</div>
                  </td>
                  {showAdminColumn && (
                    <td className="px-6 py-4">
                      {n.admin_name ? (
                        <button
                          onClick={() => handleAdminClick(n.admin_id)}
                          className="text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-2 decoration-yellow-500/30 hover:decoration-yellow-400/60 transition-all text-left"
                        >
                          {n.admin_name}
                        </button>
                      ) : (
                        <span className="text-sm text-white/40">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold ${
                      n.is_read ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/50'
                    }`}>
                      {n.is_read ? 'Oui' : 'Non'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && pagination.last_page > 1 && (
          <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center space-x-2">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === p ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Admin Info Modal ── */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeAdminModal}>
          <div className="relative w-full max-w-md mx-4 bg-[#1a0507] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-black font-bold text-lg">
                  {adminDetail ? (adminDetail.first_name?.[0] || 'A').toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Administrateur</h3>
                  <p className="text-xs text-white/40">Détails du compte</p>
                </div>
              </div>
              <button onClick={closeAdminModal}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {adminLoading ? (
              <div className="px-6 py-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : adminDetail ? (
              <div className="px-6 py-5 space-y-4">
                <InfoRow label="Nom complet" value={`${adminDetail.first_name || ''} ${adminDetail.last_name || ''}`} icon={<PersonIcon />} />
                <InfoRow label="Email" value={adminDetail.email || '—'} icon={<EmailIcon />} />
                <InfoRow label="Statut" value={adminDetail.is_active !== false ? 'Actif' : 'Inactif'}
                  valueClass={adminDetail.is_active !== false ? 'text-green-400' : 'text-red-400'} icon={<StatusIcon />} />
                <InfoRow label="Rôle" value={adminDetail.is_super_admin ? 'Super Admin' : 'Administrateur'} icon={<RoleIcon />} />
                <InfoRow label="Membre depuis" value={adminDetail.created_at ? new Date(adminDetail.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                }) : '—'} icon={<DateIcon />} />
              </div>
            ) : null}
            <div className="px-6 py-4 border-t border-white/5 flex justify-end">
              <button onClick={closeAdminModal}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-sm transition-all">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helper sub-components ──
const InfoRow = ({ label, value, icon, valueClass }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium">{label}</p>
      <p className={`text-sm text-white mt-0.5 break-words ${valueClass || ''}`}>{value || '—'}</p>
    </div>
  </div>
);

const PersonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const StatusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const RoleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const DateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default AdminNotifications;
