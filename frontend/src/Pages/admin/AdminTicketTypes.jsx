import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getTicketTypes,
  createTicketType,
  updateTicketType,
  toggleTicketTypeStatus,
  deleteTicketType,
} from '../../services/adminService';

const emptyForm = () => ({
  code: '',
  name: { fr: '', en: '' },
  description: { fr: '', en: '' },
  price: '',
  student_price: '',
  duration_minutes: '',
  is_reusable: false,
  max_uses: 1,
  is_active: true,
});

const AdminTicketTypes = () => {
  const { t } = useTranslation();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTicketTypes();
      setTypes(response.data.data);
    } catch (err) {
      console.error('Error loading ticket types', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setShowModal(true);
  };

  const openEdit = (type) => {
    setEditing(type);
    setForm({
      code: type.code,
      name: { ...type.name },
      description: type.description ? { ...type.description } : { fr: '', en: '' },
      price: type.price.toString(),
      student_price: type.student_price?.toString() || '',
      duration_minutes: type.duration_minutes?.toString() || '',
      is_reusable: type.is_reusable,
      max_uses: type.max_uses,
      is_active: type.is_active,
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.fr || !form.name.en) {
      setError('Les traductions du nom sont requises (fr, en).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        price: parseFloat(form.price),
        student_price: form.student_price ? parseFloat(form.student_price) : null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        max_uses: parseInt(form.max_uses),
        is_reusable: form.is_reusable,
        is_active: form.is_active,
      };

      if (editing) {
        await updateTicketType(editing.id, payload);
      } else {
        await createTicketType(payload);
      }

      closeModal();
      fetchTypes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.code?.[0] || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleTicketTypeStatus(id);
      fetchTypes();
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de ticket ?')) return;
    try {
      await deleteTicketType(id);
      fetchTypes();
    } catch (err) {
      console.error('Error deleting ticket type', err);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    if (minutes >= 43200) return '30 jours';
    if (minutes >= 10080) return `${Math.round(minutes / 10080)} sem.`;
    if (minutes >= 1440) return `${Math.round(minutes / 1440)} j`;
    if (minutes >= 60) return `${Math.round(minutes / 60)} h`;
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Tarifs</h2>
          <p className="text-white/50">Gérez les types de tickets, prix et durées de validité.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-500/20"
        >
          + Nouveau type
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-white/40">Chargement...</div>
        ) : types.length === 0 ? (
          <div className="text-center py-12 text-white/40">Aucun type de ticket.</div>
        ) : (
          types.map((type) => (
            <div
              key={type.id}
              className="bg-[#1a0507]/80 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{type.name?.fr || type.code}</h3>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      type.is_active
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {type.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded-lg">{type.code}</span>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{type.description?.fr || '—'}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="bg-gradient-to-br from-yellow-500/25 to-yellow-600/10 border border-yellow-500/30 rounded-xl px-4 py-2.5 shadow-lg shadow-yellow-500/5">
                      <span className="text-yellow-400/60 text-[10px] uppercase block tracking-wider">Prix normal</span>
                      <span className="text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text font-extrabold text-lg">{type.price} DH</span>
                    </div>
                    {type.student_price && (
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 rounded-xl px-4 py-2.5">
                        <span className="text-blue-400/60 text-[10px] uppercase block tracking-wider">Prix étudiant</span>
                        <span className="text-blue-400 font-bold text-lg">{type.student_price} DH</span>
                      </div>
                    )}
                    <div className="bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-white/40 text-[10px] uppercase block">Durée</span>
                      <span className="text-white font-bold">{formatDuration(type.duration_minutes)}</span>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-white/40 text-[10px] uppercase block">Utilisations</span>
                      <span className="text-white font-bold">{type.is_reusable ? `${type.max_uses} max` : 'Unique'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openEdit(type)}
                    className="p-2 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(type.id)}
                    className={`p-2 rounded-lg transition-all ${
                      type.is_active
                        ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-white/40 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                    title={type.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {type.is_active ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-[#1a0507] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1a0507] z-10">
              <h3 className="text-lg font-semibold text-white">
                {editing ? 'Modifier le type de ticket' : 'Nouveau type de ticket'}
              </h3>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                  placeholder="BILLET_SIMPLE"
                />
              </div>

              {/* Translations - Name */}
              <div className="space-y-3">
                <label className="text-white/70 text-sm font-medium">Nom (traductions) *</label>
                {['fr', 'en'].map((lang) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-bold text-white/40 uppercase">{lang}</span>
                    <input
                      type="text"
                      required
                      value={form.name[lang] || ''}
                      onChange={(e) => setForm({ ...form, name: { ...form.name, [lang]: e.target.value } })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      placeholder={`Nom en ${lang}`}
                    />
                  </div>
                ))}
              </div>

              {/* Translations - Description */}
              <div className="space-y-3">
                <label className="text-white/70 text-sm font-medium">Description (traductions)</label>
                {['fr', 'en'].map((lang) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-bold text-white/40 uppercase">{lang}</span>
                    <input
                      type="text"
                      value={form.description[lang] || ''}
                      onChange={(e) => setForm({ ...form, description: { ...form.description, [lang]: e.target.value } })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      placeholder={`Description en ${lang}`}
                    />
                  </div>
                ))}
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Prix normal (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    placeholder="8.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Prix étudiant (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.student_price}
                    onChange={(e) => setForm({ ...form, student_price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              {/* Duration & Usage Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Durée (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    placeholder="10080"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Utilisations max</label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-2 flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_reusable}
                      onChange={(e) => setForm({ ...form, is_reusable: e.target.checked })}
                      className="accent-yellow-500 w-4 h-4"
                    />
                    <span className="text-white/70 text-sm">Réutilisable</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketTypes;
