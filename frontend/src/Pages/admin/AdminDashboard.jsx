import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';

const AdminDashboard = () => {
  const { t } = useTranslation();
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
          setError(t('admin_access_denied'));
        } else {
          setError(t('admin_stats_error'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-white">{t('admin_loading')}</div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">{error}</div>;

  const cards = [
    { label: t('admin_total_clients'), value: stats.total_clients, icon: 'Users', color: 'blue' },
    { label: t('admin_tickets_sold'), value: stats.total_tickets, icon: 'Ticket', color: 'yellow' },
    { label: t('admin_total_revenue'), value: `${stats.total_revenue} ${t('currency')}`, icon: 'TrendingUp', color: 'green' },
    { label: t('admin_transactions_today'), value: stats.transactions_today, icon: 'Activity', color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('admin_dashboard_title')}</h2>
        <p className="text-white/50">{t('admin_dashboard_subtitle')}</p>
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
          <h3 className="text-lg font-bold mb-4">{t('admin_daily_activity')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">{t('admin_new_clients_today')}</span>
              <span className="font-bold text-yellow-500">{stats.new_clients_today}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">{t('admin_revenue_today')}</span>
              <span className="font-bold text-green-500">{stats.revenue_today} {t('currency')}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">{t('admin_ticket_usage')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">{t('admin_validated_tickets')}</span>
              <span className="font-bold text-blue-500">{stats.validated_tickets}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">{t('admin_usage_rate')}</span>
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
