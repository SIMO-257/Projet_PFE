import React, { useEffect, useState, useMemo } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { useTranslation } from '../../hooks/useTranslation';
import { TicketIcon } from '../../assets/adminIcons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';

const formatMAD = (val) => `${val?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`;

const KPI_ICONS = {
  Users: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Ticket: () => <TicketIcon className="w-6 h-6" />,
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  ),
};

const KPI_COLORS = {
  blue: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
  yellow: { bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
  green: { bg: 'from-green-500/20 to-green-600/5', border: 'border-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/10' },
  purple: { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
};

const Skeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-8 w-48 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#1a0507]/80 border border-white/10 p-6 rounded-2xl space-y-4">
          <div className="h-4 w-24 bg-white/5 rounded" />
          <div className="h-8 w-32 bg-white/5 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#1a0507]/80 border border-white/10 p-6 rounded-2xl h-64" />
      <div className="bg-[#1a0507]/80 border border-white/10 p-6 rounded-2xl h-64" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const date = new Date(label + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short',
  });
  return (
    <div className="bg-[#1a0507] border border-white/10 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="text-white/50 text-xs mb-2">{date}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.dataKey === 'revenue' ? formatMAD(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState(7); // 7 or 30

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setData(response.data.data);
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
  }, []); // Intentionally run once on mount — t() is used only in error fallback text

  const chartData = useMemo(() => {
    if (!data?.chart_data) return [];
    return data.chart_data.slice(-chartPeriod);
  }, [data, chartPeriod]);

  const totalRevenue = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  }, [chartData]);

  const totalTickets = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, d) => sum + (d.tickets_sold || 0), 0);
  }, [chartData]);

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 max-w-md text-center">
        <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p>{error}</p>
      </div>
    </div>
  );

  const stats = data?.stats ?? {};
  const alerts = data?.failed_validation_alerts ?? [];

  const kpiCards = [
    { label: t('admin_total_clients'), value: stats.total_clients ?? 0, icon: KPI_ICONS.Users, color: KPI_COLORS.blue },
    { label: t('admin_tickets_sold'), value: stats.total_tickets ?? 0, icon: KPI_ICONS.Ticket, color: KPI_COLORS.yellow },
    { label: t('admin_total_revenue'), value: formatMAD(stats.total_revenue ?? 0), icon: KPI_ICONS.TrendingUp, color: KPI_COLORS.green },
    { label: t('admin_transactions_today'), value: stats.transactions_today ?? 0, icon: KPI_ICONS.Activity, color: KPI_COLORS.purple },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin_dashboard_title')}</h2>
          <p className="text-white/50">{t('admin_dashboard_subtitle')}</p>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 animate-slideDown">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-red-400 font-semibold text-sm uppercase tracking-wider mb-2">
                {t('admin_alert_title')}
              </p>
              <div className="space-y-1.5">
                {alerts.map((alert, i) => (
                  <p key={i} className="text-red-300/90 text-sm">
                    {t('admin_alert_failed_validations')
                      .replace('{count}', alert.failure_count)
                      .replace('{name}', alert.user_name)}
                    <span className="text-red-400/50 ml-2 text-xs">({alert.user_email})</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-400/70 text-sm">{t('admin_alert_no_alerts')}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden bg-gradient-to-br ${card.color.bg} border ${card.color.border} p-6 rounded-2xl space-y-4 ${card.color.glow} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm font-medium uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl ${card.color.bg} border ${card.color.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className={card.color.text}><card.icon /></span>
              </div>
            </div>
            <div className={`text-3xl font-bold ${card.color.text}`}>
              {card.value}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        ))}
      </div>

      {/* Chart + Quick Links Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#1a0507]/80 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">{t('admin_chart_title')}</h3>
            <div className="flex gap-1.5 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setChartPeriod(7)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  chartPeriod === 7
                    ? 'bg-yellow-500/20 text-yellow-500 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t('admin_chart_7d')}
              </button>
              <button
                onClick={() => setChartPeriod(30)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  chartPeriod === 30
                    ? 'bg-yellow-500/20 text-yellow-500 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t('admin_chart_30d')}
              </button>
            </div>
          </div>

          {/* Chart Totals */}
          <div className="flex gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-white/50">{t('admin_chart_revenue')}:</span>
              <span className="text-yellow-400 font-semibold">{formatMAD(totalRevenue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-white/50">{t('admin_chart_tickets')}:</span>
              <span className="text-blue-400 font-semibold">{totalTickets}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      const d = new Date(val + 'T00:00:00');
                      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    }}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  />
                  <YAxis
                    yAxisId="tickets"
                    orientation="right"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
                    iconType="circle"
                  />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    name={t('admin_chart_revenue')}
                    fill="#eab308"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                  <Bar
                    yAxisId="tickets"
                    dataKey="tickets_sold"
                    name={t('admin_chart_tickets')}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">
                {t('no_data')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Pending Links */}
        <div className="space-y-4">
          {/* Pending Reports */}
          <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/50 text-xs uppercase tracking-wider">{t('admin_pending_reports')}</p>
                <p className="text-2xl font-bold text-orange-400">{data?.pending_reports_count ?? 0}</p>
              </div>
            </div>
            <a
              href="/admin/rapports"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-all"
            >
              <span>{t('admin_view_all')}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Pending Student Verifications */}
          <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/50 text-xs uppercase tracking-wider">{t('admin_pending_verifications')}</p>
                <p className="text-2xl font-bold text-blue-400">{data?.pending_verifications_count ?? 0}</p>
              </div>
            </div>
            <a
              href="/admin/student-verifications"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all"
            >
              <span>{t('admin_view_all')}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Daily Activity Summary */}
          <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">{t('admin_daily_activity')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60 text-sm">{t('admin_new_clients_today')}</span>
                <span className="font-bold text-yellow-500">{stats.new_clients_today ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60 text-sm">{t('admin_revenue_today')}</span>
                <span className="font-bold text-green-500">{formatMAD(stats.revenue_today ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60 text-sm">{t('admin_validated_tickets')}</span>
                <span className="font-bold text-blue-500">{stats.validated_tickets ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60 text-sm">{t('admin_usage_rate')}</span>
                <span className="font-bold text-white">
                  {stats.total_tickets > 0 ? Math.round((stats.validated_tickets / stats.total_tickets) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{t('admin_recent_transactions')}</h3>
          <a
            href="/admin/transactions"
            className="text-yellow-500 text-xs font-semibold hover:text-yellow-400 transition-colors"
          >
            {t('admin_view_all')} →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/50 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">{t('table_client')}</th>
                <th className="px-6 py-3 font-medium">{t('table_type')}</th>
                <th className="px-6 py-3 font-medium">{t('table_amount')}</th>
                <th className="px-6 py-3 font-medium">{t('table_status')}</th>
                <th className="px-6 py-3 font-medium">{t('table_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.recent_transactions?.length > 0 ? (
                data.recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium">{tx.user_name}</div>
                      <div className="text-xs text-white/40">{tx.user_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'recharge'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tx.type === 'recharge' ? t('type_purchase') : 'Dépense'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold ${
                      tx.type === 'recharge' 
                        ? 'text-green-400' 
                        : tx.type === 'purchase' 
                          ? 'text-red-400' 
                          : 'text-white'
                    }`}>
                      {formatMAD(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : tx.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tx.status === 'completed' ? t('status_completed') : tx.status === 'pending' ? t('pending') : t('status_expired')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                    {t('admin_no_recent_transactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
