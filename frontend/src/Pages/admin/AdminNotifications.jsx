import React, { useState } from 'react';
import { sendAdminNotification, getClients } from '../../services/adminService';

const AdminNotifications = () => {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'system',
    target: 'all',
    client_email: '',
    client_id: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleTargetChange = (e) => {
    setForm({ ...form, target: e.target.value, client_email: '', client_id: null });
  };

  const lookupClient = async () => {
    if (form.target !== 'single' || !form.client_email) return;
    try {
      const response = await getClients({ search: form.client_email });
      const client = response.data.data.data.find(c => c.email === form.client_email);
      if (client) {
        setForm({ ...form, client_id: client.id });
        setError(null);
      } else {
        setError('Client non trouvé.');
        setForm({ ...form, client_id: null });
      }
    } catch (err) {
      setError('Erreur lors de la recherche du client.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.target === 'single' && !form.client_id) {
      setError('Veuillez sélectionner un client valide.');
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
        client_id: form.client_id,
      };
      
      const response = await sendAdminNotification(payload);
      setMessage(response.data.message);
      setForm({
        title: '',
        body: '',
        type: 'system',
        target: 'all',
        client_email: '',
        client_id: null,
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

      <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 p-8 rounded-2xl space-y-6">
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
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
            >
              <option value="system">Système</option>
              <option value="promo">Promotion</option>
              <option value="security">Sécurité</option>
              <option value="payment">Paiement</option>
              <option value="validation">Validation</option>
            </select>
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
                <span className="text-sm text-white/70">Un client</span>
              </label>
            </div>
          </div>
        </div>

        {form.target === 'single' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-white/70 text-sm font-medium">Email du client</label>
            <input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              onBlur={lookupClient}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                form.client_id ? 'border-green-500/50' : 'border-white/10 focus:border-yellow-500/50'
              }`}
              placeholder="client@email.com"
              required
            />
            {form.client_id && <p className="text-[10px] text-green-400">Client validé !</p>}
          </div>
        )}

        {message && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{message}</div>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading || (form.target === 'single' && !form.client_id)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer la notification'}
        </button>
      </form>
    </div>
  );
};

export default AdminNotifications;
