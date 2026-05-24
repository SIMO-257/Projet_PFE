import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../Components/Layout/Header';
import TicketHistoryCard from '../Components/Cards/TicketHistoryCard';

export default function AllTickets ()  {
  const navigateHook = useNavigate();
  const { t, language } = useTranslation();
  const { tickets, isLoading, refreshTickets } = useTickets();
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const filteredTickets = useMemo(() => {
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const sorted = [...safeTickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return sorted.filter((ticket) => {
      const normalizedStatus = String(ticket?.status || '').toLowerCase();
      const remainingUses = Number(ticket?.remaining_uses ?? 0);
      const ticketDate = new Date(ticket.created_at);
      const isAllowedStatus = normalizedStatus === 'active' || normalizedStatus === 'used';
      const hasRemainingUses = remainingUses > 0;

      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'today' && ticketDate >= startOfToday && ticketDate <= endOfToday) ||
        (timeFilter === 'week' && ticketDate >= startOfWeek && ticketDate <= endOfWeek);

      return isAllowedStatus && hasRemainingUses && matchesStatus && matchesTime;
    });
  }, [tickets, statusFilter, timeFilter]);

  const statusFilters = [
    { id: 'all', label: t('all_filter'), color: 'text-white/80', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ) },
    { id: 'active', label: t('active'), color: 'text-green-400', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ) },
    { id: 'used', label: t('used'), color: 'text-yellow-400', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ) },
  ];

  const timeFilters = [
    { id: 'today', label: t('today_filter'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
      </svg>
    ) },
    { id: 'week', label: t('this_week_filter'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m3 6V7m3 10v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ) },
    { id: 'all', label: t('filter_all'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ) },
  ];

  const handleTicketPress = (ticket) => navigateHook(`/viewticket/${ticket.uuid}`);
  const handleBack = () => {
    if (window.history.length > 1) {
      navigateHook(-1);
      return;
    }
    navigateHook('/home');
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className="app-card relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
          bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          
          <Header title={t('all_tickets')} showBackButton={true} onBack={handleBack} />

          <div className="app-content no-scrollbar px-6 pb-24">
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
              {timeFilters.map((filter) => {
                const isActive = timeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setTimeFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs border whitespace-nowrap transition-colors ${
                      isActive ? 'bg-white/10 border-white/30 text-white' : 'bg-black/20 border-white/10 text-white/70'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
              {statusFilters.map((filter) => {
                const isActive = statusFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs border whitespace-nowrap transition-colors ${
                      isActive ? 'bg-white/10 border-white/30' : 'bg-black/20 border-white/10'
                    }`}
                  >
                    <span className={filter.color}>{filter.icon}</span>
                    <span className={isActive ? 'text-white' : 'text-white/70'}>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {isLoading && filteredTickets.length === 0 ? (
              <p className="text-white text-center py-10">{t('loading')}</p>
            ) : filteredTickets.length > 0 ? (
              <div className="space-y-3 mt-4">
                {filteredTickets.map((ticket) => (
                  <TicketHistoryCard
                    key={ticket.uuid}
                    ticketName={ticket.ticket_type?.name || t('ticket_type')}
                    price={`${ticket.price_paid} ${t('currency')}`}
                    date={new Date(ticket.created_at).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', { 
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                    })}
                    status={ticket.status}
                    onClick={() => handleTicketPress(ticket)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-10">{t('no_ticket_found')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

;
