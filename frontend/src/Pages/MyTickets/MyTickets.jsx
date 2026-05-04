import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import TicketCard from '../../Components/Cards/TicketCard';

export default function MyTickets() {
  const navigateHook = useNavigate();
  const { tickets, availableTypes, isLoading, refreshTickets } = useTickets();

  useEffect(() => {
    console.log('[COMPONENT] MyTickets: useEffect running, dispatching refreshTickets');
    refreshTickets();
  }, [refreshTickets]);

  const safeAvailableTypes = Array.isArray(availableTypes) ? availableTypes : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const simpleBilletType = safeAvailableTypes.find(t => t.code === 'BILLET_SIMPLE' || t.name_fr === 'Billet');
  const otherTicketTypes = safeAvailableTypes.filter(t => t.id !== simpleBilletType?.id && t.code !== 'CARTE_RECHARGE');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
          bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          
          <Header title="Mes Billets" />

          <div className="max-h-[calc(100vh-200px)] min-h-[400px] overflow-y-auto custom-scrollbar px-6 pb-24">
            <p className="text-white/60 text-sm mb-6 mt-4">Sélectionnez ou achetez votre titre de transport</p>
            
            {isLoading && safeTickets.length === 0 ? (
              <p className="text-white text-center py-10">Chargement...</p>
            ) : (
              <div className="space-y-4">
                {/* Active/Purchased Tickets Section */}
                {safeTickets.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-4">Mes Titres Actifs</h3>
                    {safeTickets.map((t) => (
                      <TicketCard 
                        key={t.uuid} 
                        variant="active"
                        item={{
                          title: t.ticket_type?.name_fr || "Billet",
                          status: t.status === 'active' ? "Actif" : "Expiré",
                          description: t.ticket_type?.description || "Valable pour un trajet",
                          price: `${t.price_paid} DH`,
                          validInfo: "Valide jusqu'au",
                          validTime: new Date(t.valid_until).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                          buttonText: "Voir le billet",
                          isActive: t.status === 'active'
                        }} 
                        onAction={() => navigateHook(`/viewticket/${t.uuid}`)} 
                      />
                    ))}
                  </>
                )}

                {/* Main Purchase Option (Billet) */}
                {simpleBilletType && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">Acheter un Billet</h3>
                    <TicketCard 
                      key={simpleBilletType.id} 
                      variant="purchase"
                      item={{
                        title: simpleBilletType.name_fr,
                        status: "Disponible",
                        description: simpleBilletType.description,
                        price: `${simpleBilletType.price} DH`,
                        buttonText: "Acheter le billet",
                      }} 
                      onAction={() => navigateHook('/ticket-selection', { state: { selectedTypeId: simpleBilletType.id } })} 
                    />
                  </>
                )}

                {/* Other Purchase Options */}
                {otherTicketTypes.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">Autres Options</h3>
                    {otherTicketTypes.map((type) => (
                      <TicketCard 
                        key={type.id} 
                        variant="purchase"
                        item={{
                          title: type.name_fr,
                          status: "Disponible",
                          description: type.description,
                          price: `${type.price} DH`,
                          buttonText: "Acheter",
                        }} 
                        onAction={() => navigateHook('/ticket-selection', { state: { selectedTypeId: type.id } })} 
                      />
                    ))}
                  </>
                )}

                {!isLoading && tickets.length === 0 && !simpleBilletType && otherTicketTypes.length === 0 && (
                   <p className="text-white/40 text-center py-10">Aucun titre disponible</p>
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
