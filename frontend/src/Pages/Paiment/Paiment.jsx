import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressSteps from '../../Components/NavBar/ProgressSteps';

export default function Paiment() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="app-frame">
      <div className="app-card bg-[#1a0507] py-8 px-6 text-center app-content">
        <ProgressSteps currentStep={2} />
        
        <div className="bg-[#2a0b0f] rounded-3xl shadow-2xl p-12 border border-white/5 mt-8">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Paiement</h2>
          <p className="text-white/60 mb-8">
            Cette page est actuellement en cours de maintenance ou a été déplacée. 
            Veuillez utiliser votre portefeuille pour acheter des billets.
          </p>
          <button 
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-2xl bg-yellow-500 text-[#1a0507] font-bold shadow-xl hover:bg-yellow-400 transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
