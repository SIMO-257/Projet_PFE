import React, { useEffect, useState } from 'react';
import { getAdminTickets } from '../../services/adminService';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAdminTickets({ search, status, page });
      setTickets(response.data.data.data);
      setPagination(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Tickets</h2>
          <p className="text-white/50">Historique complet des tickets et validations.</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="validated">Validé</option>
            <option value="expired">Expiré</option>
          </select>
          <input
            type="text"
            placeholder="Rechercher (UUID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">UUID</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Prix (DH)</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">Chargement des tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">Aucun ticket trouvé.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-white/70">
                    {ticket.uuid}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{ticket.client?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-white/70">{ticket.ticket_type?.name_fr || 'N/A'}</td>
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
    </div>
  );
};

export default AdminTickets;
