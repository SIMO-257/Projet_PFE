import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import BottomNavigation from '../Components/Layout/BottomNavigation';
import BalanceCard from '../Components/Cards/BalanceCard';
import TicketHistoryCard from '../Components/Cards/TicketHistoryCard';
import BalanceCardSkeleton from '../Components/Skeletons/BalanceCardSkeleton';
import TicketHistorySkeleton from '../Components/Skeletons/TicketHistorySkeleton';
import GoldenSpinner from '../Components/UI/GoldenSpinner';
import styles from '../Styles/HomeScreen.module.css';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { useTickets } from '../hooks/useTickets';
import { fetchPurchasedCards } from '../services/ticketService';
import { fetchUnreadCount } from '../Redux/Slices/notificationSlice';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const { tickets, refreshTickets } = useTickets();
  const unreadCount = useSelector(state => state.notifications?.unreadCount || 0);
  const navigateHook = useNavigate();

  const [purchasedCards, setPurchasedCards] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isNavigatingToValidation, setIsNavigatingToValidation] = useState(false);

  useEffect(() => {
    refreshWallet();
    refreshTickets();
    dispatch(fetchUnreadCount());
    fetchPurchasedCards()
      .then((data) => {
         setPurchasedCards(Array.isArray(data) ? data : []);
         setIsDataLoading(false);
      })
      .catch(() => {
         setPurchasedCards([]);
         setIsDataLoading(false);
      });
  }, [refreshWallet, refreshTickets, dispatch]);

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const lastSixTickets = useMemo(() => {
    const allowedStatuses = new Set(['active', 'expired', 'used']);

    return [...safeTickets]
      .filter((ticket) => allowedStatuses.has(String(ticket?.status || '').toLowerCase()))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  }, [safeTickets]);

  const defaultCard = useMemo(() => {
    const safeCards = Array.isArray(purchasedCards) ? purchasedCards : [];
    const fromState = safeCards.find((card) => card.is_default === true);
    if (fromState) return fromState;
    
    const validCards = safeCards.filter(card => ['active', 'used'].includes(card.status));
    if (validCards.length === 0) return null;
    return [...validCards].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
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
  const handleDefaultCardPress = () => {
    if (!defaultCard?.uuid || isNavigatingToValidation) {
      return;
    }

    setIsNavigatingToValidation(true);
    
    setTimeout(() => {
        navigateHook('/validation', {
          state: {
            source: 'home-card',
            hideBottomNav: true,
            ticketUuid: defaultCard.uuid,
          },
        });
        
        // Reset after a delay in case user navigates back
        setTimeout(() => setIsNavigatingToValidation(false), 1000);
    }, 10);
  };
  const handleTicketPress = (ticket) => navigateHook(`/viewticket/${ticket.uuid}`);
  const handleAllTickets = () => navigateHook('/all-tickets');
  const greeting = new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour';

  return (
    <>
      <div className="app-shell">
        <div className="app-frame">
          <div className={`${styles.homeCard} app-card relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/95 to-[#260101]/95 backdrop-blur-sm`}>

            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <div>
                <p className="text-white/80 text-sm font-medium">{greeting},</p>
                <h1 className="text-white text-2xl font-bold mt-1">{user?.name }</h1>
              </div>
              <button onClick={handleNotifications} className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-[8px] right-[10px] w-2.5 h-2.5 bg-red-500 rounded-full border border-[#2a0b0f]"></span>
                )}
              </button>
            </div>

            <div className={`app-content ${styles.hideScrollbar} no-scrollbar px-6 pb-24`}>
              <div className="mb-4 mt-2">
                {isDataLoading ? (
                  <BalanceCardSkeleton />
                ) : (
                <div
                  role="button"
                  tabIndex={(!defaultCard?.uuid || isNavigatingToValidation) ? -1 : 0}
                  onClick={handleDefaultCardPress}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !(!defaultCard?.uuid || isNavigatingToValidation)) {
                      handleDefaultCardPress();
                    }
                  }}
                  aria-disabled={!defaultCard?.uuid || isNavigatingToValidation}
                  className={`w-full text-left relative ${!defaultCard?.uuid || isNavigatingToValidation ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                >
                  {isNavigatingToValidation && (
                      <div className="absolute inset-0 bg-[#400106]/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                          <GoldenSpinner size={48} />
                      </div>
                  )}
                  <BalanceCard
                    title="Ticket par defaut"
                    amount={`${activeTicketPrice.toFixed(2)} MAD`}
                    cardType={activeTicketName}
                    cardNumber={defaultCard ? `Code: ${activeTicketCode}` : 'Aucun ticket achete'}
                    gradientFrom="#7A3B47"
                    gradientTo="#5C2A36"
                    circlesPosition="right"
                    onAction={handleChangeCard}
                    actionLabel="Changer de carte"
                  />
                </div>
                )}

              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white/60 text-xs uppercase tracking-widest font-bold">Historique</h2>
                  <button onClick={handleAllTickets} className="text-yellow-500 text-sm font-semibold">Voir tout</button>
                </div>
                <div className="space-y-3">
                  {isDataLoading ? (
                    <>
                      <TicketHistorySkeleton />
                      <TicketHistorySkeleton />
                      <TicketHistorySkeleton />
                    </>
                  ) : lastSixTickets.length > 0 ? (
                    lastSixTickets.map((ticket) => (
                      <TicketHistoryCard
                        key={ticket.uuid}
                        ticketName={ticket.ticket_type?.name_fr || 'Billet'}
                        price={`${ticket.price_paid} DH`}
                        date={new Date(ticket.updated_at || ticket.created_at).toLocaleString('fr-FR', { 
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                        })}
                        status={ticket.status}
                        onClick={() => handleTicketPress(ticket)}
                      />
                    ))
                  ) : (
                    <p className="text-white/40 text-sm italic py-4">Aucun ticket trouvé</p>
                  )}
                </div>
              </div>
            </div>

            <BottomNavigation />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeScreen;
