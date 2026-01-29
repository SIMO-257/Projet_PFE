import React, { useState, useEffect } from 'react';

export default function ValidationNFC() {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  // Simulate NFC validation process
  const startValidation = () => {
    setShowModal(true);
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setValidationComplete(true);
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setValidationComplete(false);
        setIsProcessing(false);
      }, 2000);
    }, 3000);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsProcessing(false);
    setValidationComplete(false);
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.5);
            transform: scale(1.05);
          }
        }
        
        @keyframes nfc-wave {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes progress-pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-nfc-wave {
          animation: nfc-wave 2s ease-out infinite;
        }
        
        .animate-progress-pulse {
          animation: progress-pulse 1.5s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Hide scrollbar for modal */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Trigger Button (for demo) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          onClick={startValidation}
          className="bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-red-900 font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Test NFC Validation
        </button>
      </div>

      {/* NFC Validation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] z-50 flex items-center justify-center p-4 no-scrollbar">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-center mb-8">
              <h1 className="text-2xl font-bold text-white">validation NFC</h1>
            </div>

            {/* Main Card */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden 
              bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
              border border-yellow-500/20">
              
              {/* Golden Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]"></div>

              {/* Tap to Pay Section */}
              <div className="p-8">
                {/* NFC Icon with Animation */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-600/30 to-red-900/30 flex items-center justify-center animate-pulse-glow">
                      <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                      </svg>
                    </div>
                    {/* NFC Waves */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Tap to Pay</h2>
                  <p className="text-white/80 text-lg">Approchez votre téléphone du terminal</p>
                </div>

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-progress-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-progress-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-progress-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <p className="text-white/60 text-sm font-medium">Traitement en cours...</p>
                    </div>
                  </div>
                )}

                {/* Ticket Info */}
                <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 mb-8 transition-all duration-300 ${validationComplete ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                  <div className="space-y-4">
                    {/* Ticket Type */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/60 text-sm">Ticket</p>
                        <p className="text-white font-semibold">Ticket Unitaire</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Prix</p>
                        <p className="text-white font-bold text-lg">8,00 DH</p>
                      </div>
                    </div>
                    
                    {/* Validity */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-white/80 text-sm">Valide jusqu'à <span className="text-yellow-500 font-medium">18:30</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {validationComplete && (
                  <div className="mb-6 animate-fade-in">
                    <div className="bg-green-500/20 rounded-2xl p-4 border border-green-500/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">Paiement réussi!</h4>
                          <p className="text-white/80 text-sm">Votre ticket a été validé avec succès</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                <button 
                  onClick={closeModal}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Assurez-vous que votre téléphone est déverrouillé et que le NFC est activé
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}