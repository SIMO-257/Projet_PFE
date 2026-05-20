import React, { useEffect, useState } from 'react';
import { getClients, toggleClientStatus } from '../../services/adminService';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getClients({ search, page });
      setClients(response.data.data.data);
      setPagination(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleToggleStatus = async (id) => {
    try {
      // Optimistic update
      setClients(clients.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
      await toggleClientStatus(id);
    } catch (err) {
      // Revert on error
      fetchClients();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Clients</h2>
          <p className="text-white/50">Liste des utilisateurs de l'application CasaWay.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher (Nom, Email)..."
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
              <th className="px-6 py-4 font-medium">Nom</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Inscription</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && clients.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">Chargement des clients...</td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/40">Aucun client trouvé.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {client.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">{client.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      client.is_active 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {client.is_active ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(client.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                        client.is_active
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {client.is_active ? 'Bloquer' : 'Débloquer'}
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

export default AdminClients;
