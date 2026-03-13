import React, { useState, useEffect } from 'react';
import ModalOverlay from '../../Components/Layout/ModalOverlay';
import Header from '../../Components/Layout/Header';
import NFCAnimation from '../../Components/UI/NFCAnimation';
import ProcessingIndicator from '../../Components/UI/ProcessingIndicator';
import StatusIndicator from '../../Components/UI/StatusIndicator';
import TicketInfoCard from '../../Components/Cards/TicketInfoCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import styles from '../../Styles/NFCValidation.module.css';

export default function NFCValidationScreen() {
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

  // Demo trigger button for testing
  return (
    <>
      {/* Demo Trigger Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <ActionButtonCard
          variant="validation"
          icon={
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          }
          label="Valider NFC"
          onClick={startValidation}
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
        />
      </div>

      {/* NFC Validation Modal */}
      <ModalOverlay
        show={showModal}
        onClose={closeModal}
        showCloseButton={!isProcessing && !validationComplete}
        className="w-full max-w-sm"
        overlayClassName={styles.noScrollbar}
      >
        <div className={`${styles.nfcModalCard} ${styles.fadeIn}`}>
          {/* Header */}
          <Header 
            title="validation NFC"
            variant="centered"
            className="mb-8 mt-6"
          />

          {/* Content */}
          <div className="p-8">
            {/* NFC Animation */}
            <div className="mb-8">
              <NFCAnimation 
                isActive={isProcessing || validationComplete}
                size={96}
                showWaves={isProcessing}
                pulseSpeed={validationComplete ? "fast" : "normal"}
              />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Tap to Pay</h2>
              <p className="text-white/80 text-lg">Approchez votre téléphone du terminal</p>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mb-8">
                <ProcessingIndicator 
                  message="Traitement en cours..."
                  dotCount={3}
                  dotSize="md"
                  showMessage={true}
                />
              </div>
            )}

            {/* Ticket Info */}
            <TicketInfoCard 
              ticketType="Ticket Unitaire"
              price="8,00 DH"
              validityTime="18:30"
              className={`mb-8 transition-all duration-300 ${
                validationComplete ? 'border-green-500/30 bg-green-500/5' : ''
              }`}
            />

            {/* Success Message */}
            {validationComplete && (
              <div className="mb-6">
                <StatusIndicator 
                  message="Votre ticket a été validé avec succès"
                  variant="success"
                  showIcon={true}
                />
              </div>
            )}

            {/* Cancel Button */}
            <ActionButtonCard
              variant="default"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              }
              label="Annuler"
              onClick={closeModal}
              showArrow={false}
              className={`w-full ${validationComplete ? 'hidden' : 'block'}`}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Assurez-vous que votre téléphone est déverrouillé et que le NFC est activé
          </p>
        </div>
      </ModalOverlay>
    </>
  );
}