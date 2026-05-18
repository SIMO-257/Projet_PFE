import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Accès refusé. Veuillez vous reconnecter en tant qu\'administrateur.');
        } else {
          setError('Impossible de charger les statistiques.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-white">Chargement...</div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">{error}</div>;

  const cards = [
    { label: 'Total Clients', value: stats.total_clients, icon: 'Users', color: 'blue' },
    { label: 'Tickets vendus', value: stats.total_tickets, icon: 'Ticket', color: 'yellow' },
    { label: 'Revenus total', value: `${stats.total_revenue} DH`, icon: 'TrendingUp', color: 'green' },
    { label: 'Transactions aujourd\'hui', value: stats.transactions_today, icon: 'Activity', color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Tableau de bord</h2>
        <p className="text-white/50">Vue d'ensemble de l'activité du système.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm font-medium">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Activité du jour</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Nouveaux clients</span>
              <span className="font-bold text-yellow-500">{stats.new_clients_today}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Revenus du jour</span>
              <span className="font-bold text-green-500">{stats.revenue_today} DH</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Utilisation des tickets</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Tickets validés</span>
              <span className="font-bold text-blue-500">{stats.validated_tickets}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Taux d'utilisation</span>
              <span className="font-bold text-white">
                {stats.total_tickets > 0 ? Math.round((stats.validated_tickets / stats.total_tickets) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
