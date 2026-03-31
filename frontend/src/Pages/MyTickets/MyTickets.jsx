import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import Ticket from "../../Components/Cards/Ticket";
import PurchaseCard from '../../Components/Cards/PurchaseCard';
import styles from '../../Styles/Ticket.module.css';

export default function MyTickets() {
  const navigateHook = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');

  const onNavigate = (section) => {
    setActiveTab(section);
    if (section === 'home') navigateHook('/home');
    if (section === 'wallet') navigateHook('/wallet');
    if (section === 'profile') navigateHook('/profile');
    if (section === 'validation') navigateHook('/validation');
  };

  const tickets = [
    {
      id: 1,
      title: "Ticket Simple",
      status: "Actif",
      description: "Valable pour un trajet",
      price: "8 DH",
      validInfo: "Valide jusqu'au",
      validPeriod: "7 jours",
      validTime: "18:30 Aujourd'hui",
      buttonText: "Voir le billet",
      buttonVariant: "primary",
      isActive: true
    }
  ];

  const purchases = [
    {
      id: 2,
      title: "Billet Journalier",
      status: "Inactif",
      description: "1 trajet",
      price: "8 DH",
      duration: "7 Jours",
      buttonText: "Acheter le billet",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 3,
      title: "Billet Journalier",
      status: "Inactif",
      description: "2 trajets",
      price: "14 DH",
      duration: "7 Jours",
      buttonText: "Acheter le billet",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 4,
      title: "Pass Hebdomadaire",
      status: "Inactif",
      description: "Trajets illimités",
      price: "60 DH",
      duration: "7 Jours",
      buttonText: "Acheter le billet",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 5,
      title: "Pass Mensuel",
      status: "Inactif",
      description: "Trajets illimités",
      price: "230 DH",
      duration: "30 Jours",
      buttonText: "Acheter le billet",
      buttonVariant: "secondary",
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Tickets Card */}
        <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
          bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
          
          <Header title="Mes Billets" />

          {/* Main Content - Scrollable */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar px-6 pb-24">
            <p className="text-white/60 text-sm mb-6">Sélectionnez ou achetez votre titre de transport</p>
            
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Ticket key={ticket.id} ticket={ticket} navigate={navigateHook} />
              ))}
              {purchases.map((p) => (
                <PurchaseCard key={p.id} purchase={p} navigate={navigateHook} />
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation 
            activeTab={activeTab}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}