import React, { useState, useEffect } from 'react';

const QRValidationModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds total
  const [isExpired, setIsExpired] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (showModal && timeRemaining > 0 && !isExpired) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            setIsValid(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showModal, timeRemaining, isExpired]);

  // Reset QR code
  const resetQR = () => {
    setTimeRemaining(30);
    setIsExpired(false);
    setIsValid(true);
  };

  // Open modal
  const openModal = () => {
    setShowModal(true);
    resetQR();
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setIsExpired(false);
    setIsValid(true);
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes qr-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
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
        
        .animate-qr-pulse {
          animation: qr-pulse 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* QR Code grid styling */
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(21, 1fr);
          grid-template-rows: repeat(21, 1fr);
          gap: 1px;
          width: 100%;
          height: 100%;
        }
        
        .qr-cell {
          background-color: #000;
          border-radius: 2px;
        }
        
        .qr-cell.white {
          background-color: #fff;
        }
        
        /* Hide scrollbar */
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
          onClick={openModal}
          className="bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-red-900 font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Test QR Validation
        </button>
      </div>

      {/* QR Validation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] z-50 flex items-center justify-center p-4 no-scrollbar">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-2xl font-bold text-white">Validation QR</h1>
            </div>

            {/* Main Card */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden 
              bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
              border border-yellow-500/20">
              
              {/* Golden Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37]"></div>

              {/* Content */}
              <div className="p-6">
                {/* Timer Section */}
                <div className="text-center mb-6">
                  <p className="text-white/60 text-sm font-medium mb-1">TEMPS RESTANT</p>
                  <div className={`text-3xl font-bold ${timeRemaining <= 10 ? 'text-red-500' : 'text-yellow-500'} mb-4`}>
                    {formatTime(timeRemaining)}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${isValid ? 'bg-green-500/20' : 'bg-red-500/20'} border ${isValid ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    {isValid ? (
                      <>
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-green-500 font-medium">Code valide - Prêt pour validation</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-red-500 font-medium">Code expiré</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-6"></div>

                {/* QR Code Display */}
                <div className="mb-6">
                  <div className="bg-white rounded-2xl p-4 animate-qr-pulse">
                    <div className="w-full aspect-square">
                      {/* QR Code Pattern */}
                      <div className="qr-grid">
                        {/* Generate QR code pattern */}
                        {Array.from({ length: 441 }).map((_, index) => {
                          const row = Math.floor(index / 21);
                          const col = index % 21;
                          
                          // Create QR pattern with position markers and timing patterns
                          const isBlack = 
                            // Position markers (corners)
                            (row < 7 && col < 7) ||
                            (row < 7 && col > 13) ||
                            (row > 13 && col < 7) ||
                            // Timing patterns
                            (row === 6 && col >= 7 && col <= 13) ||
                            (col === 6 && row >= 7 && row <= 13) ||
                            // Random pattern (for demo)
                            (row + col) % 3 === 0 ||
                            (row * col) % 7 === 0;
                          
                          return (
                            <div 
                              key={index}
                              className={`qr-cell ${isBlack ? '' : 'white'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-6"></div>

                {/* Ticket Info */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
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

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Regenerate QR Button */}
                  <button 
                    onClick={resetQR}
                    className="w-full bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] hover:from-[#9B5059] hover:to-[#6C3A3E] text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span>Regénérer le QR</span>
                  </button>

                  {/* Close Button */}
                  <button 
                    onClick={closeModal}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Présentez ce code QR au contrôleur pour validation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRValidationModal;