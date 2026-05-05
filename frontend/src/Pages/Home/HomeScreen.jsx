import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import BalanceCard from '../../Components/Cards/BalanceCard';
import styles from '../../Styles/HomeScreen.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useTickets } from '../../hooks/useTickets';
import { fetchPurchasedCards } from '../../services/clientService';

const HomeScreen = () => {
  const { user } = useAuth();
  const { refreshWallet, transactions } = useWallet();
  const { tickets, refreshTickets } = useTickets();
  const navigateHook = useNavigate();
  const [purchasedCards, setPurchasedCards] = useState([]);

  useEffect(() => {
    refreshWallet();
    refreshTickets();
    fetchPurchasedCards()
      .then((data) => setPurchasedCards(Array.isArray(data) ? data : []))
      .catch(() => setPurchasedCards([]));
  }, [refreshWallet, refreshTickets]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const activeTickets = safeTickets.filter((ticket) => ticket.status === 'active');
  const expiredTickets = safeTickets.filter((ticket) => ticket.status === 'expired');

  const defaultCard = useMemo(() => {
    const safeCards = Array.isArray(purchasedCards) ? purchasedCards : [];
    const fromState = safeCards.find((card) => card.is_default === true);
    if (fromState) return fromState;
    if (safeCards.length === 0) return null;
    return [...safeCards].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }, [purchasedCards]);

  const activeTicketType = defaultCard?.ticket_type || defaultCard?.ticketType || null;
  const activeTicketName = activeTicketType?.name_fr || activeTicketType?.name || 'Aucun ticket achete';
  const activeTicketCode = defaultCard?.uuid ? defaultCard.uuid.slice(0, 8).toUpperCase() : null;
  const activeTicketPrice = defaultCard?.price_paid ? Number(defaultCard.price_paid) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center">
        <div className="text-white text-lg">Loading user data...</div>
      </div>
    );
  }

  const handleNotifications = () => navigateHook('/notifications');
  const handleChangeCard = () => navigateHook('/change-card');
  const handleValidateNFC = () => navigateHook('/validation');
  const handleShowQRCode = () => navigateHook('/validation');
  const handleBuyTicket = () => navigateHook('/mytickets');
  const handleTicketPress = (ticket) => navigateHook(`/viewticket/${ticket.uuid}`);
  const handleTransactionHistory = () => navigateHook('/payment-history');

  const lastTransaction = safeTransactions.length > 0 ? safeTransactions[0] : null;

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'a l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `il y a ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className={`${styles.homeCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/95 to-[#260101]/95 backdrop-blur-sm`}>

            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div>
                <p className="text-white/60 text-xs">Bonjour,</p>
                <h1 className="text-white text-xl font-bold">{user?.name || user?.email}</h1>
              </div>
              <button onClick={handleNotifications} className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
            </div>

            <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${styles.hideScrollbar} no-scrollbar px-6 pb-24`}>
              <div className="mb-4 mt-2">
                <BalanceCard
                  title="Ticket par defaut"
                  amount={`${activeTicketPrice.toFixed(2)} MAD`}
                  cardType={activeTicketName}
                  cardNumber={defaultCard ? `Code: ${activeTicketCode}` : 'Aucun ticket achete'}
                  gradientFrom="#7A3B47"
                  gradientTo="#5C2A36"
                  circlesPosition="right"
                />

                <div className="flex justify-end -mt-4 mb-4 pr-2">
                  <button onClick={handleChangeCard} className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider hover:text-yellow-400 flex items-center space-x-1">
                    <span>Changer de carte</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={handleValidateNFC} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"><span className="text-white text-xs">NFC</span></button>
                <button onClick={handleShowQRCode} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"><span className="text-white text-xs">QR Code</span></button>
                <button onClick={handleBuyTicket} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"><span className="text-white text-xs">Acheter</span></button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">Tickets actifs</h2>
                  <button onClick={() => navigateHook('/mytickets')} className="text-yellow-500 text-xs font-medium">Voir tout</button>
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
                  {activeTickets.length === 0 && <p className="text-white/40 text-sm italic py-4">Aucun ticket actif</p>}
                </div>
              </div>

              {lastTransaction && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">Derniere activite</h2>
                    <button onClick={handleTransactionHistory} className="text-yellow-500 text-xs font-medium">Historique</button>
                  </div>
                  <div className="bg-black/40 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-semibold">{lastTransaction.reference || (lastTransaction.type === 'recharge' ? 'Rechargement' : 'Achat')}</p>
                        <p className="text-white/40 text-[10px] uppercase mt-0.5">{formatRelativeTime(lastTransaction.created_at)}</p>
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
    </>
  );
};

export default HomeScreen;
