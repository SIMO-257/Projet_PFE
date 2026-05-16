import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import {
  createNfcChallenge,
  consumeNfcChallenge,
  createQrValidationToken,
  fetchTicketDetails,
} from '../services/ticketService';
import Header from '../Components/Layout/Header';
import BottomNavigation from '../Components/Layout/BottomNavigation';
import ValidationCard from '../Components/Cards/ValidationCard';
import InfoCard from '../Components/Cards/InfoCard';
import ActionButtonCard from '../Components/Cards/ActionButtonCard';
import TicketIconAnimation from '../Components/UI/TicketIconAnimation';
import Notification from '../Components/UI/Notification';
import ModalOverlay from '../Components/Layout/ModalOverlay';
import NFCAnimation from '../Components/UI/NFCAnimation';
import ProcessingIndicator from '../Components/UI/ProcessingIndicator';
import QRCodeDisplay from '../Components/UI/QRCodeDisplay';
import TimerDisplay from '../Components/UI/TimerDisplay';
import GoldenSpinner from '../Components/UI/GoldenSpinner';
import styles from '../Styles/ValidationScreen.module.css';

export default function ValidationScreen() {
  const { tickets, refreshTickets } = useTickets();
  const navigateHook = useNavigate();
  const location = useLocation();

  const [showNFCModal, setShowNFCModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTimeRemaining, setQRTimeRemaining] = useState(300);
  const [qrPayload, setQrPayload] = useState('');
  const [notification, setNotification] = useState(null);
  const [nfcStatusMessage, setNfcStatusMessage] = useState('');
  const [nfcToken, setNfcToken] = useState('');
  const [nfcTicketUuidInput, setNfcTicketUuidInput] = useState('');
  const [nfcSecondsRemaining, setNfcSecondsRemaining] = useState(0);
  const [isNfcSubmitting, setIsNfcSubmitting] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingNFC, setIsGeneratingNFC] = useState(false);

  useEffect(() => {
    if (tickets.length === 0) {
      refreshTickets();
    }
  }, [tickets.length, refreshTickets]);

  const selectedTicketUuid = location.state?.ticketUuid ?? null;
  const hideBottomNav = location.state?.hideBottomNav === true || location.state?.source === 'home-card';
  const selectedTicket = selectedTicketUuid
    ? tickets.find((t) => t.uuid === selectedTicketUuid)
    : null;

  const activeTicket =
    selectedTicket && ['active', 'used'].includes(selectedTicket.status) && selectedTicket.remaining_uses > 0
      ? selectedTicket
      : tickets.find((t) => ['active', 'used'].includes(t.status) && t.remaining_uses > 0);

  useEffect(() => {
    if (activeTicket && !nfcTicketUuidInput) {
      setNfcTicketUuidInput(activeTicket.uuid);
    }
  }, [activeTicket, nfcTicketUuidInput]);

  useEffect(() => {
    // Automatically trigger method if passed in state
    if (location.state?.method === 'NFC' && tickets.length > 0 && !showNFCModal) {
      startNfcChallenge();
      // Clear method from state to prevent re-triggering
      navigateHook(location.pathname, { replace: true, state: { ...location.state, method: null } });
    } else if (location.state?.method === 'QR' && tickets.length > 0 && !showQRModal) {
      validateQR();
      // Clear method from state to prevent re-triggering
      navigateHook(location.pathname, { replace: true, state: { ...location.state, method: null } });
    }
  }, [location.state, tickets.length, showNFCModal, showQRModal]);

  useEffect(() => {
    let timer;
    if (showQRModal && qrTimeRemaining > 0) {
      timer = setInterval(() => {
        setQRTimeRemaining((prev) => {
          if (prev <= 1) {
            setShowQRModal(false);
            setQrPayload('');
            setNotification({
              type: 'error',
              title: 'QR Code expire',
              message: 'Generez un nouveau code pour continuer',
            });
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, qrTimeRemaining]);

  useEffect(() => {
    let pollingInterval;
    if (showQRModal && activeTicket) {
      pollingInterval = setInterval(async () => {
        try {
          const updatedTicket = await fetchTicketDetails(activeTicket.uuid);
          if (updatedTicket) {
            const hasStatusChanged = activeTicket.status === 'active' && updatedTicket.status === 'used';
            const hasUsesDecreased = updatedTicket.remaining_uses < activeTicket.remaining_uses;
            
            if (hasStatusChanged || hasUsesDecreased) {
              clearInterval(pollingInterval);
              setShowQRModal(false);
              setQRTimeRemaining(300);
              setQrPayload('');
              navigateHook('/validation-success', { state: { ticket: updatedTicket } });
            }
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du billet:", error);
        }
      }, 3000); // Polling every 3 seconds
    }
    return () => clearInterval(pollingInterval);
  }, [showQRModal, activeTicket, navigateHook]);

  useEffect(() => {
    let timer;
    if (showNFCModal && nfcSecondsRemaining > 0) {
      timer = setInterval(() => {
        setNfcSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }

    if (showNFCModal && nfcSecondsRemaining === 0 && nfcToken) {
      setNfcStatusMessage('Token NFC expire. Cliquez sur Annuler puis recommencez.');
    }

    return () => clearInterval(timer);
  }, [showNFCModal, nfcSecondsRemaining, nfcToken]);

  const goBack = () => {
    navigateHook(-1);
  };

  const closeNFCModal = () => {
    setShowNFCModal(false);
    setNfcToken('');
    setNfcTicketUuidInput('');
    setNfcSecondsRemaining(0);
    setNfcStatusMessage('');
    setIsNfcSubmitting(false);
  };

  const validateQR = async () => {
    if (!activeTicket || isGeneratingQR) {
      if (!activeTicket) {
        setNotification({
          type: 'error',
          title: 'Aucun billet',
          message: 'Vous n avez pas de billet actif a valider.',
        });
      }
      return;
    }

    setIsGeneratingQR(true);
    try {
      const tokenData = await createQrValidationToken({ ticket_uuid: activeTicket.uuid });
      const validationToken = tokenData?.validation_token || '';
      const expiresIn = Number(tokenData?.expires_in || 300);

      if (!validationToken) {
        setNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Token QR introuvable.',
        });
        return;
      }

      setQrPayload(validationToken);
      setShowQRModal(true);
      setQRTimeRemaining(expiresIn);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: err?.response?.data?.message || 'Impossible de generer le token QR.',
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const startNfcChallenge = async () => {
    if (!activeTicket || isGeneratingNFC) {
      if (!activeTicket) {
        setNotification({
          type: 'error',
          title: 'Aucun billet',
          message: 'Vous n avez pas de billet actif a valider.',
        });
      }
      return;
    }

    setIsGeneratingNFC(true);
    try {
      const data = await createNfcChallenge();
      setNfcToken(data?.nfc_token || '');
      setNfcSecondsRemaining(Number(data?.expires_in || 60));
      setNfcTicketUuidInput(selectedTicketUuid || '');
      setNfcStatusMessage('Token genere. Collez le UUID du ticket avant expiration.');
      setShowNFCModal(true);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: err?.response?.data?.message || 'Impossible de generer le token NFC.',
      });
    } finally {
      setIsGeneratingNFC(false);
    }
  };

  const submitNfcTicket = async () => {
    if (isNfcSubmitting) return;

    if (!nfcToken || nfcSecondsRemaining <= 0) {
      setNotification({
        type: 'error',
        title: 'Token expire',
        message: 'Le token NFC a expire. Relancez la validation NFC.',
      });
      return;
    }

    const ticketUuid = nfcTicketUuidInput.trim();
    if (!ticketUuid) {
      setNotification({
        type: 'error',
        title: 'UUID manquant',
        message: 'Collez le UUID du ticket avant de valider.',
      });
      return;
    }

    setIsNfcSubmitting(true);
    setNfcStatusMessage('Validation en cours...');

    try {
      const result = await consumeNfcChallenge({
        ticket_uuid: ticketUuid,
        nfc_token: nfcToken,
      });

      setNotification({
        type: 'success',
        title: 'Validation NFC reussie',
        message: result?.message || 'Le ticket actif a ete valide.',
      });

      setTimeout(() => {
        closeNFCModal();
        navigateHook('/validation-success', { state: { ticket: activeTicket } });
      }, 700);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Echec NFC',
        message: err?.response?.data?.message || 'Validation NFC echouee.',
      });
    } finally {
      setIsNfcSubmitting(false);
    }
  };

  const infoItems = [
    'Validez votre titre avant de monter a bord',
    'NFC: token actif pendant 60 secondes',
    'Le QR Code est valable 30 secondes',
  ];

  return (
    <>
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

      <div className="app-shell">
        <div className="app-frame">
          <ValidationCard className="app-card">
            <Header title="Validation" onBack={goBack} showBackButton={true} className="p-6 pb-4" />

            <div className="app-content no-scrollbar">
              <div className="flex justify-center py-8">
                <TicketIconAnimation size={128} showWaves={true} pulseSpeed="normal" />
              </div>

              <div className="text-center px-6 pb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Valider votre titre</h2>
                <p className="text-white/60 text-sm">Choisissez votre methode de validation</p>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  {isGeneratingNFC && (
                      <div className="absolute inset-0 bg-[#400106]/50 backdrop-blur-sm z-20 flex items-center justify-center">
                          <GoldenSpinner size={40} />
                      </div>
                  )}
                  <ActionButtonCard
                    variant="validation"
                    icon={
                      <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                    }
                    label="Valider avec NFC"
                    description={selectedTicketUuid ? 'Carte par defaut preselectionnee' : 'Generer un token NFC (60s)'}
                    onClick={startNfcChallenge}
                    showArrow={true}
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden">
                  {isGeneratingQR && (
                      <div className="absolute inset-0 bg-[#400106]/50 backdrop-blur-sm z-20 flex items-center justify-center">
                          <GoldenSpinner size={40} />
                      </div>
                  )}
                  <ActionButtonCard
                    variant="validation"
                    icon={
                      <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    }
                    label="Valider avec QR Code"
                    description="Scannez le code"
                    onClick={validateQR}
                    showArrow={true}
                  />
                </div>
              </div>

              <div className="px-6 pb-8">
                <InfoCard title="Informations importantes" items={infoItems} maxHeight={128} />
              </div>
            </div>

            {!hideBottomNav && <BottomNavigation />}
          </ValidationCard>
        </div>

        <ModalOverlay
          show={showNFCModal}
          onClose={closeNFCModal}
          showCloseButton={false}
          className="w-full h-full"
          overlayClassName={styles.noScrollbar}
        >
          <div className="relative rounded-none w-screen h-screen border-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">

            <div className="mb-6">
              <NFCAnimation isActive={true} size={128} showWaves={true} pulseSpeed="normal" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Token NFC</h3>
            <p className="text-white/70 mb-2 text-xs">Expira dans {nfcSecondsRemaining}s</p>
            <p className="text-yellow-400 text-lg font-bold tracking-wider mb-4">{nfcToken || '---'}</p>
            <p className="text-white/60 mb-4 text-sm">{nfcStatusMessage}</p>

            <input
              type="text"
              value={nfcTicketUuidInput}
              onChange={(e) => setNfcTicketUuidInput(e.target.value)}
              placeholder="Coller UUID du ticket"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm mb-4"
            />

            {isNfcSubmitting ? (
              <ProcessingIndicator message="Validation..." dotCount={3} dotSize="sm" showMessage={true} />
            ) : (
              <button
                type="button"
                onClick={submitNfcTicket}
                disabled={nfcSecondsRemaining <= 0}
                className="w-full rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Valider le ticket actif
              </button>
            )}

            <div className="mt-4">
              <ActionButtonCard
                variant="default"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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

        <ModalOverlay
          show={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setQRTimeRemaining(300);
            setQrPayload('');
          }}
          showCloseButton={false}
          className="w-full h-full"
          overlayClassName={styles.noScrollbar}
        >
          <div className="relative rounded-none w-screen h-screen border-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">

            <div className="mb-6">
              <div className="w-64 h-64 mx-auto">
                <QRCodeDisplay
                  value={qrPayload}
                  isValid={qrTimeRemaining > 0}
                  size={256}
                  className="rounded-2xl p-4 bg-white"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Presentez ce QR Code</h3>
            <p className="text-white/60 mb-4">au controleur pour valider votre titre</p>
            {activeTicket?.uuid && (
              <p className="text-white/50 text-xs mb-4">Ticket: {activeTicket.uuid.slice(0, 8).toUpperCase()}</p>
            )}

            <div className="bg-yellow-500/20 rounded-xl p-3 mb-6">
              <TimerDisplay seconds={qrTimeRemaining} totalSeconds={300} showLabel={false} size="sm" />
            </div>

            <ActionButtonCard
              variant="default"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              label="Fermer"
              onClick={() => {
                setShowQRModal(false);
                setQRTimeRemaining(300);
                setQrPayload('');
              }}
              showArrow={false}
              className="w-full"
            />
          </div>
        </ModalOverlay>
      </div>
    </>
  );
}
