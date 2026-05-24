import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../Components/Layout/Header';
import BottomNavigation from '../Components/Layout/BottomNavigation';
import TicketCard from '../Components/Cards/TicketCard';
import TicketCardSkeleton from '../Components/Skeletons/TicketCardSkeleton';

export default function MyTickets() {
  const navigateHook = useNavigate();
  const { t, language } = useTranslation();
  const { tickets, availableTypes, isLoading, refreshTickets } = useTickets();

  useEffect(() => {
    console.log('[COMPONENT] MyTickets: useEffect running, dispatching refreshTickets');
    refreshTickets();
  }, [refreshTickets]);

  const safeAvailableTypes = Array.isArray(availableTypes) ? availableTypes : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const simpleBilletType = safeAvailableTypes.find(t => t.code === 'BILLET_SIMPLE');
  const otherTicketTypes = safeAvailableTypes.filter(t => t.id !== simpleBilletType?.id && t.code !== 'CARTE_RECHARGE');

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className="app-card relative overflow-hidden bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          
          <Header title={t('my_tickets')} />

          <div className="app-content no-scrollbar px-6 pb-24">
            <p className="text-white/60 text-sm mb-6 mt-4">{t('select_ticket_type')}</p>
            
            {isLoading && safeTickets.length === 0 ? (
              <div className="space-y-4 pt-4">
                <TicketCardSkeleton />
                <TicketCardSkeleton />
                <TicketCardSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active/Purchased Tickets Section */}
                {safeTickets.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-4">{t('active_tickets')}</h3>
                    {safeTickets.map((ticket) => (
                      <TicketCard 
                        key={ticket.uuid} 
                        variant="active"
                        item={{
                          title: ticket.ticket_type?.name || t('ticket_type'),
                          status: ticket.status === 'active' ? t('active') : (ticket.status === 'used' ? t('used') : t('expired')),
                          description: ticket.ticket_type?.description || t('valid_for_single'),
                          price: `${ticket.price_paid} ${t('currency')}`,
                          validInfo: t('valid_until'),
                          validTime: new Date(ticket.valid_until).toLocaleString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                          buttonText: t('view_ticket_btn'),
                          isActive: ticket.status === 'active' || ticket.status === 'used'
                        }} 
                        onAction={() => navigateHook(`/viewticket/${ticket.uuid}`)} 
                      />
                    ))}
                  </>
                )}

                {/* Main Purchase Option (Billet) */}
                {simpleBilletType && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">{t('buy')} {t('ticket_type')}</h3>
                    <TicketCard 
                      key={simpleBilletType.id} 
                      variant="purchase"
                      item={{
                        title: simpleBilletType.name,
                        status: t('available'),
                        description: simpleBilletType.description,
                        price: `${simpleBilletType.price} ${t('currency')}`,
                        buttonText: `${t('buy')} ${t('ticket_type')}`,
                      }} 
                      onAction={() => navigateHook('/ticket-selection', { state: { selectedTypeId: simpleBilletType.id } })} 
                    />
                  </>
                )}

                {/* Other Purchase Options */}
                {otherTicketTypes.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">{t('other_options')}</h3>
                    {otherTicketTypes.map((type) => (
                      <TicketCard 
                        key={type.id} 
                        variant="purchase"
                        item={{
                          title: type.name,
                          status: t('available'),
                          description: type.description,
                          price: `${type.price} ${t('currency')}`,
                          buttonText: t('buy'),
                        }} 
                        onAction={() => navigateHook('/ticket-selection', { state: { selectedTypeId: type.id } })} 
                      />
                    ))}
                  </>
                )}

                {!isLoading && tickets.length === 0 && !simpleBilletType && otherTicketTypes.length === 0 && (
                   <p className="text-white/40 text-center py-10">{t('no_ticket_available')}</p>
                )}
              </div>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
