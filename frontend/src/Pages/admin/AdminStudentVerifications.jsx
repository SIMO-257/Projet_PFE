import React, { useEffect, useState, useCallback } from 'react';
import {
  getStudentVerifications,
  getStudentVerification,
  approveStudentVerification,
  rejectStudentVerification,
} from '../../services/adminService';

const STATUS_BADGE = {
  pending:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const STATUS_LABEL = {
  pending:  'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

const AdminStudentVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Detail modal
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Approve/Reject
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.status = filter;
      const res = await getStudentVerifications(params);
      setVerifications(res.data.data?.data || res.data.data || []);
      setCounts(res.data.counts);
    } catch (err) {
      console.error('Erreur lors du chargement des vérifications', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const showError = (msg) => {
    // Simple inline feedback — a more sophisticated toast could be added later
    alert(msg);
  };

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getStudentVerification(id);
      setDetail(res.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement du détail', err);
      showError('Impossible de charger les détails de la demande.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveStudentVerification(selectedId);
      setSelectedId(null);
      setDetail(null);
      fetchVerifications();
    } catch (err) {
      console.error('Erreur lors de l\'approbation', err);
      showError(err.response?.data?.message || 'Erreur lors de l\'approbation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectStudentVerification(selectedId, rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedId(null);
      setDetail(null);
      fetchVerifications();
    } catch (err) {
      console.error('Erreur lors du rejet', err);
      showError(err.response?.data?.message || 'Erreur lors du rejet.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Vérifications Étudiant</h2>
        <p className="text-white/50">Examinez et validez les demandes de statut étudiant.</p>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{counts.pending}</p>
          <p className="text-orange-400/70 text-xs uppercase tracking-wider mt-1">En attente</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{counts.approved}</p>
          <p className="text-green-400/70 text-xs uppercase tracking-wider mt-1">Approuvés</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-red-400">{counts.rejected}</p>
          <p className="text-red-400/70 text-xs uppercase tracking-wider mt-1">Rejetés</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'Tous' },
          { value: 'pending', label: 'En attente' },
          { value: 'approved', label: 'Approuvés' },
          { value: 'rejected', label: 'Rejetés' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s.value
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Soumis le</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && verifications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                  Chargement des demandes...
                </td>
              </tr>
            ) : verifications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                  Aucune demande trouvée.
                </td>
              </tr>
            ) : (
              verifications.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => openDetail(v.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">
                      {v.user?.full_name || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {v.user?.email || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[v.status]}`}>
                      {STATUS_LABEL[v.status] || v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50 whitespace-nowrap">
                    {new Date(v.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {v.status === 'pending' && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        À examiner
                      </span>
                    )}
                    {v.status === 'approved' && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                        Approuvé
                      </span>
                    )}
                    {v.status === 'rejected' && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                        Rejeté
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setSelectedId(null); setDetail(null); }}
        >
          <div
            className="bg-gradient-to-br from-[#2d1410] to-[#1a0507] border border-white/10 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">Détail de la demande</h3>
              <button
                onClick={() => { setSelectedId(null); setDetail(null); }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="text-center py-12 text-white/40">Chargement des détails...</div>
            ) : detail ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-lg">
                    {(detail.user?.full_name?.charAt(0) || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-lg">{detail.user?.full_name || 'Inconnu'}</p>
                    <p className="text-white/50 text-sm">{detail.user?.email || ''}</p>
                    <p className="text-white/40 text-xs">{detail.user?.phone || '—'}</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[detail.status]}`}>
                    {STATUS_LABEL[detail.status] || detail.status}
                  </span>
                </div>

                {/* Details */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Membre depuis</p>
                    <p className="text-white/60 text-sm">{detail.user?.member_since || '—'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Soumis le</p>
                    <p className="text-white/60 text-sm">{formatDate(detail.created_at)}</p>
                  </div>
                  {detail.rejected_reason && (
                    <div>
                      <p className="text-red-400/80 text-xs uppercase tracking-wide mb-1">Raison du rejet</p>
                      <p className="text-red-300 text-sm bg-red-500/10 rounded-lg p-3">{detail.rejected_reason}</p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <p className="text-white/60 text-xs uppercase tracking-wide">Documents fournis</p>
                  {detail.document_urls?.cin_doc ? (
                    <a
                      href={detail.document_urls.cin_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all text-sm"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">CIN / Pièce d'identité</span>
                      <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-white/30 text-sm italic">Document CIN non disponible</p>
                  )}
                  {detail.document_urls?.school_doc ? (
                    <a
                      href={detail.document_urls.school_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-sm"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span className="font-medium">Justificatif scolaire</span>
                      <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-white/30 text-sm italic">Document scolaire non disponible</p>
                  )}
                </div>

                {/* Actions */}
                {detail.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 font-medium text-sm hover:bg-green-500/30 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : 'Approuver'}
                    </button>
                  </div>
                )}
                {detail.status !== 'pending' && (
                  <button
                    onClick={() => { setSelectedId(null); setDetail(null); }}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
                  >
                    Fermer
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-red-400">Erreur lors du chargement des détails.</div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => { setRejectModalOpen(false); setRejectReason(''); }}
        >
          <div
            className="bg-gradient-to-br from-[#2d1410] to-[#1a0507] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Rejeter la demande</h3>
            <p className="text-white/50 text-sm mb-4">
              Veuillez indiquer une raison pour ce rejet. Elle sera communiquée à l'utilisateur.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Document illisible, informations manquantes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-500/50 resize-none min-h-[100px]"
              maxLength={500}
            />
            <p className="text-white/30 text-xs mt-1 text-right">{rejectReason.length}/500</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModalOpen(false); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium text-sm hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentVerifications;
