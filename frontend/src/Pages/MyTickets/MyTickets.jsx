import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
<<<<<<< HEAD
import Ticket from "../../Components/Cards/Ticket";
import PurchaseCard from '../../Components/Cards/PurchaseCard';
import styles from '../../Styles/Ticket.module.css';
import {
  clearAuthData,
  fetchClientProfile,
  getAuthToken,
  getClientUuid,
  setClientUuid,
} from '../../services/clientService';
=======
import TicketCard from '../../Components/Cards/TicketCard';
>>>>>>> 110b8f3fa71656180ae4f0799404b59fdf5310e6

export default function MyTickets() {
  const navigateHook = useNavigate();
  const { tickets, availableTypes, isLoading, refreshTickets } = useTickets();

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigateHook('/login');
        return;
      }
=======
    console.log('[COMPONENT] MyTickets: useEffect running, dispatching refreshTickets');
    refreshTickets();
  }, [refreshTickets]);
>>>>>>> 110b8f3fa71656180ae4f0799404b59fdf5310e6

  const safeAvailableTypes = Array.isArray(availableTypes) ? availableTypes : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

<<<<<<< HEAD
        setTickets(ticketsRes.data || []);
        setTicketTypes(filteredTypes);
      } catch (err) {
        if (err?.response?.status === 401) {
          clearAuthData();
          navigateHook('/login');
          return;
        }
        console.error("Error fetching tickets data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigateHook]);

  // Group tickets by type
  const groupedTickets = tickets.reduce((acc, t) => {
    const typeId = t.ticket_type_id;
    if (!acc[typeId]) {
      acc[typeId] = { 
        ...t, 
        count: 0,
        instances: [] 
      };
    }
    acc[typeId].count += 1;
    acc[typeId].instances.push(t);
    return acc;
  }, {});

  const onNavigate = (section) => {
    setActiveTab(section);
    if (section === 'home') navigateHook('/home');
    if (section === 'wallet') navigateHook('/wallet');
    if (section === 'profile') navigateHook('/profile');
    if (section === 'validation') navigateHook('/validation');
  };

  const simpleBilletType = ticketTypes.find(t => t.code === 'BILLET_SIMPLE' || t.name_fr === 'Billet');
  const otherTicketTypes = ticketTypes.filter(t => t.id !== simpleBilletType?.id);
=======
  const simpleBilletType = safeAvailableTypes.find(t => t.code === 'BILLET_SIMPLE' || t.name_fr === 'Billet');
  const otherTicketTypes = safeAvailableTypes.filter(t => t.id !== simpleBilletType?.id && t.code !== 'CARTE_RECHARGE');
>>>>>>> 110b8f3fa71656180ae4f0799404b59fdf5310e6

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
