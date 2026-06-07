import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAuditLogs, exportAuditLogs } from '../../services/adminService';

const ACTION_LABELS = {
  registration_completed: 'Inscription',
  ticket_validation_success: 'Validation réussie',
  ticket_validation_failed: 'Validation échouée',
  admin_validation_success: 'Validation admin réussie',
  admin_validation_failed: 'Validation admin échouée',
  admin_validation_failed_not_found: 'Validation admin - ticket introuvable',
  ticket_validation_failed_not_found: 'Ticket introuvable',
};

const AdminAuditLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [availableActions, setAvailableActions] = useState([]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page };
      if (actionFilter) params.action = actionFilter;
      const response = await getAuditLogs(params);
      setLogs(response.data.data.data);
      setPagination(response.data.data);
      if (response.data.actions) {
        setAvailableActions(response.data.actions);
      }
    } catch (err) {
      console.error('Error loading audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = () => {
    exportAuditLogs({ action: actionFilter });
  };

  const formatAction = (action) => {
    return ACTION_LABELS[action] || action.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Journal d'Audit</h2>
          <p className="text-white/50">Historique des actions et événements système.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a0507] text-white">Toutes les actions</option>
              {availableActions.map((act) => (
                <option key={act} value={act} className="bg-[#1a0507] text-white">
                  {formatAction(act)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {t('admin_export_excel')}
          </button>
        </div>
      </div>

      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
              <th className="px-6 py-4 font-medium">IP</th>
              <th className="px-6 py-4 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">Chargement...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">Aucun log trouvé.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white/50 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{log.user?.full_name || '—'}</div>
                    <div className="text-xs text-white/40">{log.user?.email || 'Système'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-white/40">{log.ip_address || '—'}</td>
                  <td className="px-6 py-4">
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <span
                        className="text-xs text-white/30 cursor-pointer hover:text-white/60 transition-colors"
                        title={JSON.stringify(log.metadata, null, 2)}
                      >
                        {Object.keys(log.metadata).length} champ(s)
                      </span>
                    )}
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

export default AdminAuditLogs;
