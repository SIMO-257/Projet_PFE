import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // If using React Router
import ValidationCard from '../../Components/Cards/ValidationCard';
import StatusIndicator from '../../Components/UI/StatusIndicator';
import RechargeSummaryCard from '../../Components/Cards/RechargeSummaryCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import styles from '../../Styles/RechargeConfirmation.module.css';
const RechargeConfirmationScreen = () => {
  const navigate = useNavigate(); // React Router hook
  const [amount] = useState('90,00 DH');
  const [rechargeAmount] = useState('50,00 DH');
  const [timestamp] = useState('crédité le 27 Jan. 2026, 14:35');

  const goToWallet = () => {
    navigate('/wallet'); // Your navigation logic
  };

  const buyTicket = () => {
    navigate('/tickets/buy'); // Your navigation logic
  };

  const goHome = () => {
    navigate('/'); // Your navigation logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ValidationCard>
          {/* Success Animation */}
          <div className="pt-12 pb-8 px-6">
            <StatusIndicator
              variant="success-circle"
              title="Rechargement confirmé !"
              message="Votre compte a été crédité avec succès"
              iconSize="lg"
              className="text-center"
            />
          </div>

          {/* Balance Summary */}
          <div className="px-6 pb-8">
            <RechargeSummaryCard 
              amount={amount}
              rechargeAmount={rechargeAmount}
              timestamp={timestamp}
            />
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <ActionButtonCard
              variant="validation"
              icon={
                <svg className="w-5 h-5 text-red-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              }
              label="Voir mon portefeuille"
              onClick={goToWallet}
              showArrow={false}
              className="w-full bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] hover:from-[#E5C5A1] hover:to-[#D9B971] hover:scale-[1.02]"
            />

            <ActionButtonCard
              variant="default"
              icon={
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/>
                </svg>
              }
              label="Acheter un billet"
              onClick={buyTicket}
              showArrow={false}
              className="w-full border-2 border-white/10 hover:border-white/20 hover:bg-white/10"
            />
          </div>

          {/* Simple Home Link - Just use your existing Link component */}
          <div className="flex items-center justify-center pb-6">
            <button
              onClick={goHome}
              className="flex items-center space-x-2 text-white/60 hover:text-white/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span className="text-sm">Retour à l'accueil</span>
            </button>
          </div>
        </ValidationCard>
      </div>
    </div>
  );
};

export default RechargeConfirmationScreen;