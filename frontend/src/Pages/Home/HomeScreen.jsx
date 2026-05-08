import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import BalanceCard from '../../Components/Cards/BalanceCard';
import styles from '../../Styles/HomeScreen.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useTickets } from '../../hooks/useTickets';
import { fetchPurchasedCards } from '../../services/clientService';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnreadCount } from '../../Redux/Slices/notificationSlice';
import { useTranslation } from '../../hooks/useTranslation';

const HomeScreen = () => {
  const { user } = useAuth();
  const { refreshWallet, transactions } = useWallet();
  const { tickets, refreshTickets } = useTickets();
  const navigateHook = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { unreadCount } = useSelector(state => state.notifications);
  const [purchasedCards, setPurchasedCards] = useState([]);

  useEffect(() => {
    refreshWallet();
    refreshTickets();
    dispatch(fetchUnreadCount());
    fetchPurchasedCards()
      .then((data) => setPurchasedCards(Array.isArray(data) ? data : []))
      .catch(() => setPurchasedCards([]));
  }, [refreshWallet, refreshTickets, dispatch]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const activeTickets = safeTickets.filter((ticket) => ticket.status === 'active');

  const defaultCard = useMemo(() => {
    const safeCards = Array.isArray(purchasedCards) ? purchasedCards : [];
    const fromState = safeCards.find((card) => card.is_default === true);
    if (fromState) return fromState;
    if (safeCards.length === 0) return null;
    return [...safeCards].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }, [purchasedCards]);

  const activeTicketType = defaultCard?.ticket_type || defaultCard?.ticketType || null;
  const activeTicketName = activeTicketType?.name_fr || activeTicketType?.name || t('no_tickets');
  const activeTicketCode = defaultCard?.uuid ? defaultCard.uuid.slice(0, 8).toUpperCase() : null;
  const activeTicketPrice = defaultCard?.price_paid ? Number(defaultCard.price_paid) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const handleNotifications = () => navigateHook('/notifications');
  const handleRecharge = () => navigateHook('/recharge-payment');
  const handleChangeCard = () => navigateHook('/change-card');
  const handleValidateNFC = () => navigateHook('/validation');
  const handleShowQRCode = () => navigateHook('/validation');
  const handleBuyTicket = () => navigateHook('/mytickets');
  const handleTicketPress = (ticket) => navigateHook(`/viewticket/${ticket.uuid}`);
  const handleTransactionHistory = () => navigateHook('/payment-history');

  const lastTransaction = safeTransactions.length > 0 ? safeTransactions[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className={`${styles.homeCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/95 to-[#260101]/95 backdrop-blur-sm`}>

          <div className="flex items-center justify-between px-6 pt-8 pb-4">
            <div>
              <p className="text-white/60 text-xs">{t('welcome')},</p>
              <h1 className="text-white text-xl font-bold">{user?.name || user?.email}</h1>
            </div>
            <button onClick={handleNotifications} className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 border-2 border-[#400106]"></span>
                </span>
              )}
            </button>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar px-6 pb-24">
            <div className="mb-4 mt-2">
              <BalanceCard
                title={t('default_ticket')}
                amount={`${activeTicketPrice.toFixed(2)} MAD`}
                cardType={activeTicketName}
                cardNumber={defaultCard ? `Code: ${activeTicketCode}` : t('no_tickets')}
                gradientFrom="#7A3B47"
                gradientTo="#5C2A36"
                circlesPosition="right"
              />

              <div className="flex justify-end -mt-4 mb-4 pr-2">
                <button onClick={handleChangeCard} className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider hover:text-yellow-400 flex items-center space-x-1">
                  <span>{t('confirm')}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <button onClick={handleRecharge} className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>{t('wallet')}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={handleValidateNFC} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10 text-white text-xs font-medium">NFC</button>
              <button onClick={handleShowQRCode} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10 text-white text-xs font-medium">QR Code</button>
              <button onClick={handleBuyTicket} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10 text-white text-xs font-medium">{t('buy')}</button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">{t('active_tickets')}</h2>
                <button onClick={() => navigateHook('/mytickets')} className="text-yellow-500 text-xs font-medium">{t('see_all')}</button>
              </div>
              <div className="overflow-x-auto custom-scrollbar flex space-x-3 pb-2">
                {activeTickets.map((ticket) => (
                  <button key={ticket.uuid} onClick={() => handleTicketPress(ticket)} className="flex-shrink-0 w-48 bg-black/40 rounded-xl border border-white/10 p-4 text-left hover:border-yellow-500/30 transition-all">
                    <p className="text-white font-semibold text-sm">{ticket.ticket_type?.name_fr || 'Billet'}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {ticket.remaining_uses > 1 ? `${ticket.remaining_uses} utilisations` : `Expire le ${new Date(ticket.valid_until).toLocaleDateString()}`}
                    </p>
                    <p className="text-yellow-500 font-bold text-sm mt-3">{ticket.price_paid} MAD</p>
                  </button>
                ))}
                {activeTickets.length === 0 && <p className="text-white/40 text-sm italic py-4">{t('no_active_tickets')}</p>}
              </div>
            </div>

            {lastTransaction && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">{t('last_activity')}</h2>
                  <button onClick={handleTransactionHistory} className="text-yellow-500 text-xs font-medium">{t('history')}</button>
                </div>
                <div className="bg-black/40 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">{lastTransaction.reference || (lastTransaction.type === 'recharge' ? t('recharge') : t('buy'))}</p>
                    </div>
                    <span className={`text-sm font-bold ${lastTransaction.type === 'purchase' ? 'text-red-400' : 'text-green-400'}`}>
                      {lastTransaction.type === 'purchase' ? `- ${lastTransaction.amount}` : `+ ${lastTransaction.amount}`} MAD
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
