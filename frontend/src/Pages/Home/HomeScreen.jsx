import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import BalanceCard from '../../Components/Cards/BalanceCard';
import styles from '../../Styles/HomeScreen.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useTickets } from '../../hooks/useTickets';

const HomeScreen = () => {
  const { user } = useAuth();
  const { balance, card_last_four, refreshWallet, transactions } = useWallet();
  const { tickets, refreshTickets } = useTickets();
  const navigateHook = useNavigate();

  useEffect(() => {
    refreshWallet();
    refreshTickets();
  }, [refreshWallet, refreshTickets]);

  const safeBalance = Number.isFinite(balance) ? balance : 0;
  const safeCardLastFour = card_last_four || '****';
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // Safety check: don't render if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center">
        <div className="text-white text-lg">Loading user data...</div>
      </div>
    );
  }

  const handleNotifications = () => navigateHook('/notifications');
  const handleRecharge = () => navigateHook('/payment');
  const handleChangeCard = () => navigateHook('/change-card');
  const handleValidateNFC = () => navigateHook('/validation');
  const handleShowQRCode = () => navigateHook('/validation');
  const handleBuyTicket = () => navigateHook('/mytickets');
  const handleTicketPress = (ticket) => navigateHook(`/viewticket/${ticket.uuid}`);
  const handleTransactionHistory = () => navigateHook('/payment-history');
  
  const activeTickets = safeTickets.filter(t => t.status === 'active');
  const lastTransaction = safeTransactions.length > 0 ? safeTransactions[0] : null;

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'à l’instant';
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
          <div className={`${styles.homeCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
                        bg-gradient-to-br from-[#400106]/95 to-[#260101]/95 backdrop-blur-sm`}>
            
            {/* Header Content */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div>
                <p className="text-white/60 text-xs">Bonjour,</p>
                <h1 className="text-white text-xl font-bold">{user?.name || user?.email}</h1>
              </div>
              <button
                onClick={handleNotifications}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
            </div>

            {/* Main Content - Scrollable */}
            <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${styles.hideScrollbar} no-scrollbar px-6 pb-24`}>
              
              {/* Wallet Card */}
              <div className="mb-4 mt-2">
                <BalanceCard 
                  title="Solde disponible"
                  amount={`${safeBalance.toFixed(2)} MAD`}
                  cardType="Carte virtuelle"
                  cardNumber={`**** **** **** ${safeCardLastFour}`}
                  gradientFrom="#7A3B47"
                  gradientTo="#5C2A36"
                  circlesPosition="right"
                />
                
                <div className="flex justify-end -mt-4 mb-4 pr-2">
                  <button 
                    onClick={handleChangeCard}
                    className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider hover:text-yellow-400 flex items-center space-x-1"
                  >
                    <span>Changer de carte</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleRecharge}
                  className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  <span>Recharger le portefeuille</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={handleValidateNFC}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"
                >
                  <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-xl flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span className="text-white text-xs">NFC</span>
                </button>
                <button
                  onClick={handleShowQRCode}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"
                >
                  <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-xl flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <span className="text-white text-xs">QR Code</span>
                </button>
                <button
                  onClick={handleBuyTicket}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-center transition-colors border border-white/10"
                >
                  <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-xl flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                    </svg>
                  </div>
                  <span className="text-white text-xs">Acheter</span>
                </button>
              </div>

              {/* Active Tickets */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">Tickets actifs</h2>
                  <button onClick={() => navigateHook('/mytickets')} className="text-yellow-500 text-xs font-medium">Voir tout</button>
                </div>
                <div className="overflow-x-auto custom-scrollbar flex space-x-3 pb-2">
                  {activeTickets.map(ticket => (
                    <button
                      key={ticket.uuid}
                      onClick={() => handleTicketPress(ticket)}
                      className="flex-shrink-0 w-48 bg-black/40 rounded-xl border border-white/10 p-4 text-left hover:border-yellow-500/30 transition-all"
                    >
                      <p className="text-white font-semibold text-sm">{ticket.ticket_type?.name_fr || 'Billet'}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {ticket.remaining_uses > 1 ? `${ticket.remaining_uses} utilisations` : `Expire le ${new Date(ticket.valid_until).toLocaleDateString()}`}
                      </p>
                      <p className="text-yellow-500 font-bold text-sm mt-3">{ticket.price_paid} MAD</p>
                    </button>
                  ))}
                  {activeTickets.length === 0 && (
                    <p className="text-white/40 text-sm italic py-4">Aucun ticket actif</p>
                  )}
                </div>
              </div>

              {/* Last Transaction */}
              {lastTransaction && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">Dernière activité</h2>
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
