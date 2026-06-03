import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAdminTickets, getUser, exportTicketsCSV } from '../../services/adminService';

const AdminTickets = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // Client modal state
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientDetailed, setClientDetailed] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAdminTickets({ search, status, page });
      setTickets(response.data?.data?.data || []);
      setPagination(response.data?.data);
    } catch (err) {
      console.error('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, status, page]);

  // ── Client modal handlers ──
  const handleClientClick = useCallback(async (client) => {
    if (!client) return;
    setSelectedClient(client);
    setClientDetailed(null);
    setClientLoading(true);
    try {
      const res = await getUser(client.id);
      setClientDetailed(res.data?.data ?? res.data);
    } catch {
      // Fallback to basic client info from ticket
      setClientDetailed(client);
    } finally {
      setClientLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelectedClient(null);
    setClientDetailed(null);
  }, []);

  const displayClient = clientDetailed || selectedClient;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin_ticket_management')}</h2>
          <p className="text-white/50">{t('admin_ticket_subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => { try { await exportTicketsCSV({ status }); } catch (e) { console.error('Export failed', e); } }}
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a0507] text-white">{t('all_statuses')}</option>
              <option value="active" className="bg-[#1a0507] text-white">{t('status_active')}</option>
              <option value="validated" className="bg-[#1a0507] text-white">{t('status_validated')}</option>
              <option value="expired" className="bg-[#1a0507] text-white">{t('status_expired')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <input
            type="text"
            placeholder={t('search_uuid')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">{t('table_uuid')}</th>
              <th className="px-6 py-4 font-medium">{t('table_client')}</th>
              <th className="px-6 py-4 font-medium">{t('table_type')}</th>
              <th className="px-6 py-4 font-medium">{t('table_status')}</th>
              <th className="px-6 py-4 font-medium">{t('table_price')}</th>
              <th className="px-6 py-4 font-medium">{t('table_date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('loading_tickets')}</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('no_ticket_admin')}</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-white/70">
                    {ticket.uuid}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleClientClick(ticket.client || ticket.user)}
                      className="text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-2 decoration-yellow-500/30 hover:decoration-yellow-400/60 transition-all"
                    >
                      {(ticket.client?.email || ticket.user?.email) || t('not_applicable')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {ticket.ticket_type?.name || ticket.ticket_type?.name_fr || t('not_applicable')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'active' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : ticket.status === 'validated'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-bold">{ticket.price_paid}</td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(ticket.created_at).toLocaleDateString()}
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

      {/****************************************************************************
       * CLIENT INFO MODAL
       ****************************************************************************/}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg mx-4 bg-[#1a0507] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-black font-bold text-lg">
                  {(displayClient?.full_name?.[0] || displayClient?.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {displayClient?.full_name || 'Client'}
                  </h3>
                  <p className="text-xs text-white/40">Détails du client</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            {clientLoading ? (
              <div className="px-6 py-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                {/* Full Name */}
                <InfoRow
                  label="Nom complet"
                  value={displayClient?.full_name}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                {/* Email */}
                <InfoRow
                  label="Email"
                  value={displayClient?.email}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                {/* Phone */}
                <InfoRow
                  label="Téléphone"
                  value={displayClient?.phone || 'Non renseigné'}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />

                {/* Email Verified */}
                <InfoRow
                  label="Email vérifié"
                  value={displayClient?.email_verified_at ? 'Oui' : 'Non'}
                  valueClass={displayClient?.email_verified_at ? 'text-green-400' : 'text-yellow-400'}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                {/* Account Status */}
                <InfoRow
                  label="Compte actif"
                  value={displayClient?.is_active ? 'Actif' : 'Désactivé'}
                  valueClass={displayClient?.is_active ? 'text-green-400' : 'text-red-400'}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {/* UUID */}
                <InfoRow
                  label="UUID"
                  value={displayClient?.uuid}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                    </svg>
                  }
                />

                {/* Created At */}
                <InfoRow
                  label="Inscrit le"
                  value={displayClient?.created_at
                    ? new Date(displayClient.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-sm transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helper sub-component ──
const InfoRow = ({ label, value, icon, valueClass }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium">{label}</p>
      <p className={`text-sm text-white mt-0.5 break-words ${valueClass || ''}`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

export default AdminTickets;
