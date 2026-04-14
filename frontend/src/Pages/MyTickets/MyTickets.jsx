import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const apiBase = import.meta.env.VITE_API_URL ?? '';

  useEffect(() => {
    const fetchData = async () => {
      const uuid = sessionStorage.getItem('client_uuid');
      if (!uuid) {
        navigateHook('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch User's Tickets
        const ticketsRes = await axios.get(`${apiBase}/api/tickets`, {
          headers: { 'X-Client-UUID': uuid }
        });
        
        // Fetch Available Ticket Types for purchase
        const typesRes = await axios.get(`${apiBase}/api/ticket-types`);

        setTickets(ticketsRes.data || []);
        setTicketTypes(typesRes.data || []);
      } catch (err) {
        console.error("Error fetching tickets data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBase, navigateHook]);

  const onNavigate = (section) => {
    setActiveTab(section);
    if (section === 'home') navigateHook('/home');
    if (section === 'wallet') navigateHook('/wallet');
    if (section === 'profile') navigateHook('/profile');
    if (section === 'validation') navigateHook('/validation');
  };

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
                {tickets.length > 0 && (
                  <>
                    <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2">Mes Titres Actifs</h3>
                    {tickets.map((t) => (
                      <Ticket 
                        key={t.uuid} 
                        ticket={{
                          id: t.uuid,
                          title: t.ticket_type?.name_fr || "Billet",
                          status: t.status === 'active' ? "Actif" : "Expiré",
                          description: t.ticket_type?.description || "Valable pour un trajet",
                          price: `${t.price_paid} DH`,
                          validInfo: "Valide jusqu'au",
                          validTime: new Date(t.valid_until).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                          buttonText: "Voir le billet",
                          buttonVariant: "primary",
                          isActive: t.status === 'active'
                        }} 
                        navigate={navigateHook} 
                      />
                    ))}
                  </>
                )}

                {/* Purchase Options Section */}
                <h3 className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-2 mt-6">Acheter un Billet</h3>
                {ticketTypes.map((type) => (
                  <PurchaseCard 
                    key={type.id} 
                    purchase={{
                      id: type.id,
                      title: type.name_fr,
                      status: "Disponible",
                      description: type.description,
                      price: `${type.price} DH`,
                      duration: `${type.duration_minutes} min`,
                      buttonText: "Acheter le billet",
                      buttonVariant: "secondary",
                      isActive: false
                    }} 
                    navigate={navigateHook} 
                  />
                ))}
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