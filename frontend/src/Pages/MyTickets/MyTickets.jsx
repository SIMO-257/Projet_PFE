import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientApi from '../../services/clientService';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import Ticket from "../../Components/Cards/Ticket";
import PurchaseCard from '../../Components/Cards/PurchaseCard';
import styles from '../../Styles/Ticket.module.css';

export default function MyTickets() {
  const navigateHook = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const uuid = sessionStorage.getItem('client_uuid');
      if (!uuid) {
        navigateHook('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch User's Tickets using secure clientApi
        const ticketsRes = await clientApi.get('/tickets', {
          headers: { 'X-Client-UUID': uuid }
        });
        
        // Fetch Available Ticket Types
        const typesRes = await clientApi.get('/ticket-types');

        setTickets(ticketsRes.data || []);
        setTicketTypes(typesRes.data || []);
      } catch (err) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
          bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          
          <Header title="Mes Billets" />

          <div className="max-h-[calc(100vh-200px)] min-h-[400px] overflow-y-auto custom-scrollbar px-6 pb-24">
            <p className="text-white/60 text-sm mb-6 mt-4">Sélectionnez ou achetez votre titre de transport</p>
            
            {loading ? (
              <p className="text-white text-center py-10">Chargement...</p>
            ) : (
              <div className="space-y-4">
                {/* Active/Purchased Tickets Section */}
                {Object.keys(groupedTickets).length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-4">Mes Titres Actifs</h3>
                    {Object.values(groupedTickets).map((g) => (
                      <Ticket 
                        key={g.uuid} 
                        ticket={{
                          id: g.uuid,
                          title: g.count > 1 ? `${g.ticket_type?.name_fr || "Billet"} (x${g.count})` : (g.ticket_type?.name_fr || "Billet"),
                          status: g.status === 'active' ? "Actif" : "Expiré",
                          description: g.ticket_type?.description || "Valable pour un trajet",
                          price: `${g.price_paid} DH`,
                          validInfo: "Valide jusqu'au",
                          validTime: new Date(g.valid_until).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                          buttonText: g.count > 1 ? "Voir les billets" : "Voir le billet",
                          buttonVariant: "primary",
                          isActive: g.status === 'active'
                        }} 
                        navigate={navigateHook} 
                      />
                    ))}
                  </>
                )}

                {/* Main Purchase Option (Billet) */}
                {simpleBilletType && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">Acheter un Billet</h3>
                    <PurchaseCard 
                      key={simpleBilletType.id} 
                      purchase={{
                        id: simpleBilletType.id,
                        title: simpleBilletType.name_fr,
                        status: "Disponible",
                        description: simpleBilletType.description,
                        price: `${simpleBilletType.price} DH`,
                        duration: `${simpleBilletType.duration_minutes} min`,
                        buttonText: "Acheter le billet",
                        buttonVariant: "secondary",
                        isActive: false
                      }} 
                      navigate={navigateHook} 
                    />
                  </>
                )}

                {/* Other Purchase Options */}
                {otherTicketTypes.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-8">Autres Options</h3>
                    {otherTicketTypes.map((type) => (
                      <PurchaseCard 
                        key={type.id} 
                        purchase={{
                          id: type.id,
                          title: type.name_fr,
                          status: "Disponible",
                          description: type.description,
                          price: `${type.price} DH`,
                          duration: `${type.duration_minutes} min`,
                          buttonText: "Acheter",
                          buttonVariant: "secondary",
                          isActive: false
                        }} 
                        navigate={navigateHook} 
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <BottomNavigation 
            activeTab={activeTab}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}