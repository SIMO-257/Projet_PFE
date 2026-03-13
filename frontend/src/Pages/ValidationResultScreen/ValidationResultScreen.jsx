import React, { useState } from 'react';
import ModalOverlay from '../../Components/Layout/ModalOverlay';
import Header from '../../Components/Layout/Header';
import StatusIndicator from '../../Components/UI/StatusIndicator';
import CollapsibleSection from '../../Components/UI/CollapsibleSection';
import JourneyInfoCard from '../../Components/Cards/JourneyInfoCard';
import TransactionDetailsCard from '../../Components/Cards/TransactionDetailsCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import styles from '../../Styles/ValidationResult.module.css';

export default function ValidationResultScreen() {
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

  // Demo trigger button for testing
  return (
    <>
      {/* Demo Trigger Button */}
      <div className="fixed bottom-36 left-4 z-40">
        <ActionButtonCard
          variant="validation"
          icon={
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          }
          label="Résultat Validation"
          onClick={openModal}
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-[#48BB78] to-[#38A169]"
        />
      </div>

      {/* Validation Result Modal */}
      <ModalOverlay
        show={showModal}
        onClose={closeModal}
        showCloseButton={true}
        className="w-full max-w-sm"
        overlayClassName={styles.noScrollbar}
      >
        <div className={`${styles.resultModalCard} ${styles.fadeInUp}`}>
          {/* Header */}
          <Header 
            title="validation résultat"
            variant="centered"
            className="mb-6"
          />

          {/* Content */}
          <div className="p-6">
            {/* Success Animation */}
            <StatusIndicator
              variant="success-animated"
              message="Bon voyage!"
              title="Validation Réussie!"
              className="mb-8"
            />

            {/* Journey Details */}
            <JourneyInfoCard 
              from="Al Qods"
              to="6 Novembre"
              date="Aujourd'hui à 15:05"
              period="Samedi 2 → 6 Novembre"
              ticketType="Ticket Unitaire"
              className="mb-6"
            />

            {/* Transaction Details Toggle */}
            <CollapsibleSection
              title="Détails de la transaction"
              isOpen={showDetails}
              onToggle={toggleDetails}
              className="mb-6"
            >
              <TransactionDetailsCard 
                transactionId="TXN-2026012715053421"
                method="NFC"
                terminal="TERM-0542"
                operator="Casablanca Tramway"
                validity="15 / 5 minutes"
              />
            </CollapsibleSection>

            {/* Terminer Button */}
            <ActionButtonCard
              variant="validation"
              icon={
                <svg className="w-5 h-5 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              }
              label="Terminer"
              onClick={closeModal}
              showArrow={false}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-red-900 hover:scale-105"
            />
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Conservez ce reçu pour référence
          </p>
        </div>
      </ModalOverlay>
    </>
  );
}