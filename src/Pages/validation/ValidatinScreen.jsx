import React, { useState, useEffect } from 'react';

const ValidationScreen = () => {
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTimeRemaining, setQRTimeRemaining] = useState(30);
  const [showNotification, setShowNotification] = useState(null);

  // QR Timer Effect
  useEffect(() => {
    let timer;
    if (showQRModal && qrTimeRemaining > 0) {
      timer = setInterval(() => {
        setQRTimeRemaining((prev) => {
          if (prev <= 1) {
            closeQRModal();
            showQRExpired();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, qrTimeRemaining]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showNFCModal || showQRModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showNFCModal, showQRModal]);

  const goBack = () => {
    console.log('Going back...');
  };

  const navigate = (section) => {
    console.log('Navigating to:', section);
  };

  const validateNFC = () => {
    setShowNFCModal(true);
    setTimeout(() => {
      setShowNFCModal(false);
      showValidationSuccess();
    }, 3000);
  };

  const closeNFCModal = () => {
    setShowNFCModal(false);
  };

  const validateQR = () => {
    setShowQRModal(true);
    setQRTimeRemaining(30);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQRTimeRemaining(30);
  };

  const showValidationSuccess = () => {
    setShowNotification({
      type: 'success',
      title: 'Validation réussie!',
      message: 'Votre titre a été validé avec succès'
    });
    setTimeout(() => setShowNotification(null), 4000);
  };

  const showQRExpired = () => {
    setShowNotification({
      type: 'error',
      title: 'QR Code expiré',
      message: 'Générez un nouveau code pour continuer'
    });
    setTimeout(() => setShowNotification(null), 4000);
  };

  return (
    <>
      {/* Custom Tailwind Config and Styles */}
      <style jsx global>{`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
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
        
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-nfc-wave {
          animation: nfc-wave 2s ease-out infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
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
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        {/* Notification */}
        {showNotification && (
          <div className={`fixed top-4 left-4 right-4 z-50 ${
            showNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white rounded-2xl p-4 shadow-lg flex items-center space-x-3 animate-slide-down`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {showNotification.type === 'success' ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{showNotification.title}</h4>
              <p className="text-sm text-white/90">{showNotification.message}</p>
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="w-full max-w-md mx-auto">
          {/* Validation Card */}
          <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
            before:absolute before:top-0 before:left-0 before:right-0 before:h-1 
            before:bg-gradient-to-r before:from-[#FFD700] before:to-[#D4AF37] 
            before:rounded-t-3xl">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <button 
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-white">Validation</h1>
              <div className="w-10"></div>
            </div>

            {/* Ticket Icon with Pulse Animation */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-600/30 to-red-900/30 flex items-center justify-center animate-pulse-glow">
                  <svg className="w-16 h-16 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
                  </svg>
                </div>
                {/* NFC Waves */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center px-6 pb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Valider votre titre</h2>
              <p className="text-white/60 text-sm">Choisissez votre méthode de validation</p>
            </div>

            {/* Validation Methods */}
            <div className="px-6 pb-6 space-y-4">
              {/* NFC Validation Button */}
              <button 
                onClick={validateNFC}
                className="w-full rounded-2xl p-6 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] hover:from-[#9B5059] hover:to-[#6C3A3E] group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold text-lg">Valider avec NFC</h3>
                    <p className="text-white/50 text-sm">Approchez votre téléphone</p>
                  </div>
                  <svg className="w-6 h-6 text-white/40 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              {/* QR Code Validation Button */}
              <button 
                onClick={validateQR}
                className="w-full rounded-2xl p-6 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] hover:from-[#9B5059] hover:to-[#6C3A3E] group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold text-lg">Valider avec QR Code</h3>
                    <p className="text-white/50 text-sm">Scannez le code</p>
                  </div>
                  <svg className="w-6 h-6 text-white/40 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Important Information */}
            <div className="px-6 pb-8">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-3">Informations importantes</h4>
                    <ul className="space-y-2 text-white/60 text-xs custom-scrollbar max-h-32 overflow-y-auto pr-2">
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span>Validez votre titre avant de monter à bord</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span>Le NFC doit être activé sur votre appareil</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span>Le QR Code est valable 30 secondes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-around">
                {/* Home */}
                <button 
                  onClick={() => navigate('home')}
                  className="relative flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Accueil</span>
                </button>

                {/* Tickets */}
                <button 
                  onClick={() => navigate('tickets')}
                  className="relative flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                  </svg>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Billets</span>
                </button>

                {/* Validation (Active) */}
                <button className="relative flex flex-col items-center space-y-1 group">
                  <div className="w-14 h-14 -mt-7 rounded-full bg-gradient-to-r from-[#FFD700] to-[#D4AF37] flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xs text-yellow-500 font-medium">Valider</span>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                </button>

                {/* Wallet */}
                <button 
                  onClick={() => navigate('wallet')}
                  className="relative flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Portefeuille</span>
                </button>

                {/* Profile */}
                <button 
                  onClick={() => navigate('profile')}
                  className="relative flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NFC Validation Modal */}
        {showNFCModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-scrollbar"
            onClick={(e) => e.target === e.currentTarget && closeNFCModal()}
          >
            <div className="relative rounded-3xl w-full max-w-sm border border-yellow-500/20 p-8 text-center
              bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
              before:absolute before:top-0 before:left-0 before:right-0 before:h-1 
              before:bg-gradient-to-r before:from-[#FFD700] before:to-[#D4AF37] 
              before:rounded-t-3xl">
              <div className="mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600/30 to-red-900/30 flex items-center justify-center">
                    <svg className="w-16 h-16 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                    </svg>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-[rgba(255,215,0,0.5)] rounded-full animate-nfc-wave" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Approchez votre téléphone</h3>
              <p className="text-white/60 mb-6">Maintenez votre appareil près du terminal NFC</p>
              <div className="flex items-center justify-center space-x-2 text-yellow-500 mb-6">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-sm">Détection en cours...</span>
              </div>
              <button 
                onClick={closeNFCModal}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-scrollbar"
            onClick={(e) => e.target === e.currentTarget && closeQRModal()}
          >
            <div className="relative rounded-3xl w-full max-w-sm border border-yellow-500/20 p-8 text-center
              bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm
              before:absolute before:top-0 before:left-0 before:right-0 before:h-1 
              before:bg-gradient-to-r before:from-[#FFD700] before:to-[#D4AF37] 
              before:rounded-t-3xl">
              <div className="mb-6">
                <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center">
                  {/* QR Code Placeholder */}
                  <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1">
                    <div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                    <div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div>
                    <div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                    <div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div>
                    <div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                    <div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-white"></div>
                    <div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                    <div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Présentez ce QR Code</h3>
              <p className="text-white/60 mb-4">au contrôleur pour valider votre titre</p>
              <div className="bg-yellow-500/20 rounded-xl p-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-yellow-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-medium">
                    Expire dans <span className={`font-bold ${qrTimeRemaining <= 10 ? 'text-red-500' : 'text-yellow-500'}`}>{qrTimeRemaining}s</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={closeQRModal}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ValidationScreen;