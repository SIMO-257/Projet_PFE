import React, { useState, useEffect } from 'react';
import Header from '../../Components/Layout/Header';
import ModalOverlay from '../../Components/Layout/ModalOverlay';
import QRCodeDisplay from '../../Components/UI/QRCodeDisplay';
import TimerDisplay from '../../Components/UI/TimerDisplay';
import StatusIndicator from '../../Components/UI/StatusIndicator';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import TicketInfoCard from '../../Components/Cards/TicketInfoCard';
import styles from '../../Styles/QRValidation.module.css';

export default function QRValidationScreen() {
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isExpired, setIsExpired] = useState(false);
  const [isValid, setIsValid] = useState(true);

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
      {/* Demo Trigger Button (for testing) */}
      <div className="fixed bottom-4 right-4 z-40">
        <ActionButtonCard
          variant="validation"
          icon={
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          }
          label="Valider QR Code"
          onClick={openModal}
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
        />
      </div>

      {/* QR Validation Modal */}
      <ModalOverlay
        show={showModal}
        onClose={closeModal}
        showCloseButton={true}
        className="w-full max-w-sm"
        overlayClassName={styles.noScrollbar}
      >
        <div className={`${styles.modalCard} ${styles.fadeIn}`}>
          {/* Header */}
          <Header 
            title="Validation QR"
            variant="centered"
            className="mb-4 mt-6"
          />

          {/* Content */}
          <div className="p-6">
            {/* Timer Section */}
            <TimerDisplay 
              seconds={timeRemaining}
              totalSeconds={30}
              className="mb-6"
            />
            
            {/* Status Indicator */}
            <div className="text-center mb-8">
              <StatusIndicator 
                isValid={isValid && !isExpired}
                variant="badge"
              />
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* QR Code Display */}
            <div className="mb-6">
              <QRCodeDisplay 
                isValid={isValid && !isExpired}
                className="mx-auto"
              />
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Ticket Info */}
            <TicketInfoCard 
              ticketType="Ticket Unitaire"
              price="8,00 DH"
              validityTime="18:30"
              className="mb-6"
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Regenerate QR Button */}
              <ActionButtonCard
                variant="validation"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                }
                label="Regénérer le QR"
                onClick={resetQR}
                showArrow={false}
                className="w-full"
              />

              {/* Close Button */}
              <ActionButtonCard
                variant="default"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                }
                label="Fermer"
                onClick={closeModal}
                showArrow={false}
                className="w-full bg-white/10 hover:bg-white/20"
              />
            </div>

            {/* Instructions */}
            <div className="mt-8 text-center">
              <p className="text-white/50 text-sm">
                Présentez ce code QR au contrôleur pour validation
              </p>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}