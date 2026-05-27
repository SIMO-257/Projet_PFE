import React, { useEffect, useState } from 'react';
import { getAdminRapports, updateRapportStatut } from '../../services/rapportService';

const STATUT_FLOW = ['en attente', 'en cours', 'résolu'];

const AdminRapports = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [counts, setCounts] = useState({ en_attente: 0, en_cours: 0, resolu: 0 });
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const fetchRapports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.statut = filter;
      const res = await getAdminRapports(params);
      console.log('=== ADMIN RAPPORTS DEBUG ===');
      console.log('Full response res:', res);
      console.log('res.data:', JSON.parse(JSON.stringify(res.data)));
      console.log('res.data.data:', JSON.parse(JSON.stringify(res.data?.data)));
      console.log('res.data.data?.data (items):', JSON.parse(JSON.stringify(res.data?.data?.data)));
      console.log('res.data.counts:', JSON.parse(JSON.stringify(res.data?.counts)));
      console.log('Type of res.data.data:', typeof res.data?.data);
      console.log('Is array?', Array.isArray(res.data?.data?.data));
      setRapports(res.data.data.data);
      setCounts(res.data.counts);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports', err);
      console.log('Error response:', err.response?.data);
      console.log('Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, [filter]);

  // Close zoom on Escape key
  useEffect(() => {
    if (!zoomImage) return;
    const handler = (e) => { if (e.key === 'Escape') setZoomImage(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomImage]);

  const handleAdvanceStatus = async (id, currentStatut) => {
    const idx = STATUT_FLOW.indexOf(currentStatut);
    if (idx >= STATUT_FLOW.length - 1) return;
    const nextStatut = STATUT_FLOW[idx + 1];
    try {
      // Optimistic update
      setRapports(rapports.map(r => r.id === id ? { ...r, statut: nextStatut } : r));
      await updateRapportStatut(id, nextStatut);
      // Refresh counts
      fetchRapports();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut', err);
      fetchRapports();
    }
  };

  const getBadgeStyle = (statut) => {
    switch (statut) {
      case 'en attente':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'en cours':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'résolu':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default:
        return 'bg-white/5 text-white/60 border border-white/10';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Gestion des Rapports</h2>
        <p className="text-white/50">Suivez et traitez les demandes des utilisateurs.</p>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{counts.en_attente}</p>
          <p className="text-orange-400/70 text-xs uppercase tracking-wider mt-1">En attente</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-blue-400">{counts.en_cours}</p>
          <p className="text-blue-400/70 text-xs uppercase tracking-wider mt-1">En cours</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{counts.resolu}</p>
          <p className="text-green-400/70 text-xs uppercase tracking-wider mt-1">Résolus</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'en attente', 'en cours', 'résolu'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            {s === '' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Sujet</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && rapports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">Chargement des rapports...</td>
              </tr>
            ) : rapports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">Aucun rapport trouvé.</td>
              </tr>
            ) : (
              rapports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => { setSelectedRapport(r); setZoomImage(null); }}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">{r.client?.full_name || '—'}</div>
                    <div className="text-xs text-white/40">{r.client?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{r.type_probleme}</td>
                  <td className="px-6 py-4 text-sm text-white/70 max-w-[200px] truncate">{r.sujet || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(r.statut)}`}>
                      {r.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {r.statut !== 'résolu' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(r.id, r.statut); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
                      >
                        Passer à {STATUT_FLOW[STATUT_FLOW.indexOf(r.statut) + 1]}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRapport && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setSelectedRapport(null); setZoomImage(null); }}
        >
          <div
            className="bg-gradient-to-br from-[#2d1410] to-[#1a0507] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">Détail du rapport</h3>
              <button
                onClick={() => setSelectedRapport(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                  {(selectedRapport.client?.full_name?.charAt(0) || '?').toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedRapport.client?.full_name || 'Inconnu'}</p>
                  <p className="text-white/50 text-sm">{selectedRapport.client?.email || ''}</p>
                </div>
                <span className={`ml-auto inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(selectedRapport.statut)}`}>
                  {selectedRapport.statut}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Type</p>
                  <p className="text-white text-sm">{selectedRapport.type_probleme}</p>
                </div>
                {selectedRapport.sujet && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Sujet</p>
                    <p className="text-white text-sm">{selectedRapport.sujet}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Description</p>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selectedRapport.description}</p>
                </div>
                {selectedRapport.image_path && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Capture d'écran</p>
                    <img
                      src={`/storage/${selectedRapport.image_path}`}
                      alt="Screenshot du rapport"
                      onClick={() => setZoomImage(`/storage/${selectedRapport.image_path}`)}
                      className="w-full rounded-xl border border-white/10 object-cover max-h-64 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                )}
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Soumis le</p>
                  <p className="text-white/60 text-sm">{formatDate(selectedRapport.created_at)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedRapport(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
                >
                  Fermer
                </button>
                {selectedRapport.statut !== 'résolu' && (
                  <button
                    onClick={() => {
                      const idx = STATUT_FLOW.indexOf(selectedRapport.statut);
                      if (idx < STATUT_FLOW.length - 1) {
                        handleAdvanceStatus(selectedRapport.id, selectedRapport.statut);
                        setSelectedRapport(null);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-medium text-sm hover:bg-yellow-500/30 transition-all"
                  >
                    Passer à {STATUT_FLOW[STATUT_FLOW.indexOf(selectedRapport.statut) + 1]}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image Zoom Lightbox */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={zoomImage}
              alt="Screenshot agrandi"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">Cliquez en dehors de l'image ou appuyez sur Échap pour fermer</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRapports;
