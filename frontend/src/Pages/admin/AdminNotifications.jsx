import React, { useState } from 'react';
import { sendAdminNotification, getUsers } from '../../services/adminService';

const AdminNotifications = () => {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'system',
    target: 'all',
    user_email: '',
    user_id: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

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
        setError(null);
      } else {
        setError('Utilisateur non trouvé.');
        setForm({ ...form, user_id: null });
      }
    } catch (err) {
      setError('Erreur lors de la recherche de l\'utilisateur.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.target === 'single' && !form.user_id) {
      setError('Veuillez sélectionner un utilisateur valide.');
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const payload = {
        title: form.title,
        body: form.body,
        type: form.type,
        target: form.target,
        user_id: form.user_id,
      };
      
      const response = await sendAdminNotification(payload);
      setMessage(response.data.message);
      setForm({
        title: '',
        body: '',
        type: 'system',
        target: 'all',
        user_email: '',
        user_id: null,
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const firstError = Object.values(validationErrors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la notification.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Envoyer une Notification</h2>
        <p className="text-white/50">Envoyez des messages push aux utilisateurs de CasaWay.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a0507]/80 border border-white/10 p-8 rounded-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Titre</label>
          <input
            type="text"
            maxLength={100}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
            placeholder="Ex: Promotion Spéciale"
            required
          />
          <div className="text-right text-[10px] text-white/30">{form.title.length}/100</div>
        </div>

        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Message</label>
          <textarea
            maxLength={255}
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 resize-none"
            placeholder="Contenu de la notification..."
            required
          />
          <div className="text-right text-[10px] text-white/30">{form.body.length}/255</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Type</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
              >
                <option value="system" className="bg-[#1a0507] text-white">Système</option>
                <option value="promo" className="bg-[#1a0507] text-white">Promotion</option>
                <option value="security" className="bg-[#1a0507] text-white">Sécurité</option>
                <option value="payment" className="bg-[#1a0507] text-white">Paiement</option>
                <option value="validation" className="bg-[#1a0507] text-white">Validation</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Cible</label>
            <div className="flex items-center space-x-4 h-[50px]">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={form.target === 'all'}
                  onChange={handleTargetChange}
                  className="accent-yellow-500"
                />
                <span className="text-sm text-white/70">Tous</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="single"
                  checked={form.target === 'single'}
                  onChange={handleTargetChange}
                  className="accent-yellow-500"
                />
                <span className="text-sm text-white/70">Un utilisateur</span>
              </label>
            </div>
          </div>
        </div>

        {form.target === 'single' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-white/70 text-sm font-medium">Email de l'utilisateur</label>
            <input
              type="email"
              value={form.user_email}
              onChange={(e) => setForm({ ...form, user_email: e.target.value })}
              onBlur={lookupUser}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                form.user_id ? 'border-green-500/50' : 'border-white/10 focus:border-yellow-500/50'
              }`}
              placeholder="user@email.com"
              required
            />
            {form.user_id && <p className="text-[10px] text-green-400">Utilisateur validé !</p>}
          </div>
        )}

        {message && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{message}</div>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading || (form.target === 'single' && !form.user_id)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer la notification'}
        </button>
      </form>
    </div>
  );
};

export default AdminNotifications;
