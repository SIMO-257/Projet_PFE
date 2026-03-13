import React, { useState, useEffect } from 'react';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import ValidationCard from '../../Components/Cards/ValidationCard';
import InfoCard from '../../Components/Cards/InfoCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import TicketIconAnimation from '../../Components/UI/TicketIconAnimation';
import Notification from '../../Components/UI/Notification';
import ModalOverlay from '../../Components/Layout/ModalOverlay';
import NFCAnimation from '../../Components/UI/NFCAnimation';
import ProcessingIndicator from '../../Components/UI/ProcessingIndicator';
import QRCodeDisplay from '../../Components/UI/QRCodeDisplay';
import TimerDisplay from '../../Components/UI/TimerDisplay';
import styles from '../../Styles/ValidationScreen.module.css';

export default function ValidationScreen() {
  const [activeTab, setActiveTab] = useState('validation');
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTimeRemaining, setQRTimeRemaining] = useState(30);
  const [notification, setNotification] = useState(null);

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

  const goBack = () => {
    console.log('Going back...');
  };

  const navigate = (section) => {
    setActiveTab(section);
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
    setNotification({
      type: 'success',
      title: 'Validation réussie!',
      message: 'Votre titre a été validé avec succès'
    });
  };

  const showQRExpired = () => {
    setNotification({
      type: 'error',
      title: 'QR Code expiré',
      message: 'Générez un nouveau code pour continuer'
    });
  };

  const infoItems = [
    'Validez votre titre avant de monter à bord',
    'Le NFC doit être activé sur votre appareil',
    'Le QR Code est valable 30 secondes'
  ];

  return (
    <>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={4000}
          onClose={() => setNotification(null)}
          className="fixed top-4 left-4 right-4 z-50"
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Main Validation Card */}
          <ValidationCard>
            {/* Header with back button */}
            <Header 
              title="Validation"
              onBack={goBack}
              showBackButton={true}
              className="p-6 pb-4"
            />

            {/* Ticket Icon Animation */}
            <div className="flex justify-center py-8">
              <TicketIconAnimation 
                size={128}
                showWaves={true}
                pulseSpeed="normal"
              />
            </div>

            {/* Title Section */}
            <div className="text-center px-6 pb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Valider votre titre</h2>
              <p className="text-white/60 text-sm">Choisissez votre méthode de validation</p>
            </div>

            {/* Validation Methods */}
            <div className="px-6 pb-6 space-y-4">
              {/* NFC Validation Button */}
              <ActionButtonCard
                variant="validation"
                icon={
                  <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                  </svg>
                }
                label="Valider avec NFC"
                description="Approchez votre téléphone"
                onClick={validateNFC}
                showArrow={true}
              />

              {/* QR Code Validation Button */}
              <ActionButtonCard
                variant="validation"
                icon={
                  <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                  </svg>
                }
                label="Valider avec QR Code"
                description="Scannez le code"
                onClick={validateQR}
                showArrow={true}
              />
            </div>

            {/* Important Information */}
            <div className="px-6 pb-8">
              <InfoCard 
                title="Informations importantes"
                items={infoItems}
                maxHeight={128}
              />
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation 
              activeTab={activeTab}
              onNavigate={navigate}
            />
          </ValidationCard>
        </div>

        {/* NFC Validation Modal */}
        <ModalOverlay
          show={showNFCModal}
          onClose={closeNFCModal}
          showCloseButton={true}
          className="w-full max-w-sm"
          overlayClassName={styles.noScrollbar}
        >
          <div className="relative rounded-3xl w-full border border-yellow-500/20 p-8 text-center bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-t-3xl"></div>
            
            <div className="mb-6">
              <NFCAnimation 
                isActive={true}
                size={128}
                showWaves={true}
                pulseSpeed="normal"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Approchez votre téléphone</h3>
            <p className="text-white/60 mb-6">Maintenez votre appareil près du terminal NFC</p>
            
            <ProcessingIndicator 
              message="Détection en cours..."
              dotCount={3}
              dotSize="sm"
              showMessage={true}
            />
            
            <div className="mt-6">
              <ActionButtonCard
                variant="default"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                }
                label="Annuler"
                onClick={closeNFCModal}
                showArrow={false}
                className="w-full"
              />
            </div>
          </div>
        </ModalOverlay>

        {/* QR Code Modal */}
        <ModalOverlay
          show={showQRModal}
          onClose={closeQRModal}
          showCloseButton={true}
          className="w-full max-w-sm"
          overlayClassName={styles.noScrollbar}
        >
          <div className="relative rounded-3xl w-full border border-yellow-500/20 p-8 text-center bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-t-3xl"></div>
            
            <div className="mb-6">
              <div className="w-64 h-64 mx-auto">
                <QRCodeDisplay 
                  isValid={qrTimeRemaining > 0}
                  size={256}
                  className="rounded-2xl p-4 bg-white"
                />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Présentez ce QR Code</h3>
            <p className="text-white/60 mb-4">au contrôleur pour valider votre titre</p>
            
            <div className="bg-yellow-500/20 rounded-xl p-3 mb-6">
              <TimerDisplay 
                seconds={qrTimeRemaining}
                totalSeconds={30}
                showLabel={false}
                size="sm"
              />
            </div>
            
            <ActionButtonCard
              variant="default"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              }
              label="Fermer"
              onClick={closeQRModal}
              showArrow={false}
              className="w-full"
            />
          </div>
        </ModalOverlay>
      </div>
    </>
  );
}