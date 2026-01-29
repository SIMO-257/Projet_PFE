import React, { useState } from 'react';

export default function ValidationResultModal() {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDetails(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes success-pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 25px rgba(72, 187, 120, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkmark-animation {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-success-pulse {
          animation: success-pulse 2s infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-checkmark {
          animation: checkmark-animation 0.5s ease-in-out 0.5s both;
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 10px;
        }
        
        /* Hide scrollbar */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Checkmark SVG animation */
        .checkmark {
          width: 80px;
          height: 80px;
          stroke-width: 2;
          stroke: #10b981;
          stroke-miterlimit: 10;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }
      `}</style>

      {/* Trigger Button (for demo) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button 
          onClick={openModal}
          className="bg-gradient-to-r from-[#48BB78] to-[#38A169] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Show Validation Result
        </button>
      </div>

      {/* Validation Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] z-50 flex items-center justify-center p-4 no-scrollbar">
          <div className="w-full max-w-sm animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-2xl font-bold text-white">validation résultat</h1>
            </div>

            {/* Main Card */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden 
              bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
              border border-yellow-500/20">
              
              {/* Golden Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]"></div>

              {/* Content */}
              <div className="p-6">
                {/* Success Animation */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center animate-success-pulse">
                      {/* Animated Checkmark */}
                      <svg className="checkmark animate-checkmark" viewBox="0 0 52 52">
                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#10b981" strokeWidth="2"/>
                        <path className="checkmark__check" fill="none" stroke="#10b981" strokeWidth="4" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Validation Réussie!</h2>
                  <p className="text-white/80 text-xl">Bon voyage!</p>
                </div>

                {/* Journey Details */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                  <div className="space-y-4">
                    {/* TRAJET */}
                    <div>
                      <p className="text-white/60 text-sm mb-2">TRAJET</p>
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-1">
                          <div className="text-white font-semibold">Al Qods</div>
                          <div className="h-6 w-px bg-yellow-500 absolute left-1/2 top-6"></div>
                        </div>
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-right">6 Novembre</div>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-3 text-white/80">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <span>Aujourd'hui à 15:05</span>
                      </div>
                    </div>

                    {/* Ticket Period */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-3 text-white/80">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        <span>Samedi 2 → 6 Novembre</span>
                      </div>
                    </div>

                    {/* Ticket Type */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                          </svg>
                          <span className="text-white/80">Ticket</span>
                        </div>
                        <span className="text-white font-semibold">Ticket Unitaire</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details Toggle */}
                <button 
                  onClick={toggleDetails}
                  className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-4 mb-6 transition-colors flex items-center justify-between"
                >
                  <span className="text-white font-medium">Détails de la transaction</span>
                  <svg 
                    className={`w-5 h-5 text-yellow-500 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Transaction Details (Collapsible) */}
                {showDetails && (
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6 animate-fade-in-up">
                    <div className="space-y-4">
                      {/* ID Transaction */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">ID Transaction</span>
                        <span className="text-white font-mono font-medium">TXN-2026012715053421</span>
                      </div>
                      
                      {/* Méthode */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Méthode</span>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                          </svg>
                          <span className="text-white font-medium">NFC</span>
                        </div>
                      </div>
                      
                      {/* Terminal */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Terminal</span>
                        <span className="text-white font-mono font-medium">TERM-0542</span>
                      </div>
                      
                      {/* Opérateur */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Opérateur</span>
                        <span className="text-white font-medium">Casablanca Tramway</span>
                      </div>
                      
                      {/* Validité */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Validité</span>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-white font-medium">15 / 5 minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terminer Button */}
                <button 
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-red-900 font-bold py-4 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                  Terminer
                </button>
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Conservez ce reçu pour référence
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}