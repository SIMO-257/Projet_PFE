import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Layout/Header';
import styles from '../Styles/ChangeCard.module.css';

export default function ChangeCard () {
  const navigate = useNavigate();

  // Mock card data with various statuses
  const initialCards = [
    {
      id: 1,
      cardNumber: '**** **** **** 1234',
      balance: 125.50,
      status: 'active',      // active, inactive, blocked, expired
      validUntil: '12/2026',
      type: 'Virtual',
    },
    {
      id: 2,
      cardNumber: '**** **** **** 5678',
      balance: 45.20,
      status: 'inactive',
      validUntil: '03/2025',
      type: 'Physical',
    },
    {
      id: 3,
      cardNumber: '**** **** **** 9012',
      balance: 0,
      status: 'blocked',
      validUntil: '01/2024',
      type: 'Virtual',
    },
    {
      id: 4,
      cardNumber: '**** **** **** 3456',
      balance: 10.00,
      status: 'expired',
      validUntil: '12/2023',
      type: 'Physical',
    },
  ];

  const [cards, setCards] = useState(initialCards);
  const [activeCardId, setActiveCardId] = useState(1);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'switch', cardId } or { type: 'remove', cardId }
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardType, setNewCardType] = useState('Virtual');
  const [addCardError, setAddCardError] = useState('');
  const [showSwitchConfirmation, setShowSwitchConfirmation] = useState(false);
  const [switchSuccessCard, setSwitchSuccessCard] = useState(null);

  // Handlers
  const goBack = () => navigate(-1);

  // Helper: get active card object
  const activeCard = cards.find(card => card.id === activeCardId);

  // Helper: get status badge color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active': return { color: 'bg-green-500/20 text-green-400', label: 'Active' };
      case 'inactive': return { color: 'bg-gray-500/20 text-gray-400', label: 'Inactive' };
      case 'blocked': return { color: 'bg-red-500/20 text-red-400', label: 'Bloquée' };
      case 'expired': return { color: 'bg-orange-500/20 text-orange-400', label: 'Expirée' };
      default: return { color: 'bg-white/10 text-white/40', label: 'Inconnu' };
    }
  };

  // Card selection (switch)
  const handleSelectCard = (cardId) => {
    if (cardId === activeCardId) return;
    // Check if card is usable (not blocked or expired)
    const targetCard = cards.find(c => c.id === cardId);
    if (targetCard.status === 'blocked') {
      alert('Cette carte est bloquée et ne peut pas être activée.');
      return;
    }
    if (targetCard.status === 'expired') {
      alert('Cette carte est expirée. Veuillez en ajouter une nouvelle.');
      return;
    }
    setPendingAction({ type: 'switch', cardId });   
    setShowVerificationModal(true);
    setVerificationCode('');
    setVerificationError('');
  };

  // Remove card (unlink)
  const handleRemoveCard = (cardId) => {
    if (cardId === activeCardId) {
      alert("Vous ne pouvez pas supprimer la carte active. Veuillez d'abord en sélectionner une autre.");
      return;
    }
    setPendingAction({ type: 'remove', cardId });
    setShowVerificationModal(true);
    setVerificationCode('');
    setVerificationError('');
  };

  // Verify PIN (simulated)
  const verifyAndExecuteAction = () => {
    if (verificationCode === '1234') { // In real app, verify with backend/biometric
      if (pendingAction.type === 'switch') {
        // Switch active card
        setActiveCardId(pendingAction.cardId);
        setSwitchSuccessCard(pendingAction.cardId);
        setShowSwitchConfirmation(true);
        setTimeout(() => setShowSwitchConfirmation(false), 3000);
      } else if (pendingAction.type === 'remove') {
        // Remove card
        setCards(cards.filter(card => card.id !== pendingAction.cardId));
      }
      setShowVerificationModal(false);
      setPendingAction(null);
    } else {
      setVerificationError('Code PIN incorrect. Veuillez réessayer.');
    }
  };

  // Add new card
  const handleAddCard = () => {
    if (!newCardNumber.trim()) {
      setAddCardError('Veuillez entrer un numéro de carte.');
      return;
    }
    const cleanNumber = newCardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16) {
      setAddCardError('Numéro de carte invalide (16 chiffres requis).');
      return;
    }
    const masked = `**** **** **** ${cleanNumber.slice(-4)}`;
    const newCard = {
      id: Date.now(),
      cardNumber: masked,
      balance: 0,
      status: 'inactive',     // new cards start as inactive
      validUntil: '12/2027',
      type: newCardType,
    };
    setCards([...cards, newCard]);
    setShowAddCardModal(false);
    setNewCardNumber('');
    setAddCardError('');
  };

  // Help / Support
  const handleSupport = () => {};

  // Balance transfer (optional – not implemented in MVP)
  // Could be added later.

  return (
    <>
      <div className="app-shell">
        <div className="app-frame">
          <div className={`${styles.cardContainer} app-card`}>
            
            {/* Header */}
            <Header 
              title="Changer de carte" 
              showBackButton={true} 
              onBack={goBack} 
            />

            {/* Scrollable content */}
            <div className={`app-content ${styles.scrollContainer}`}>
              
              {/* Current active card */}
              <div className="mb-6">
                <h2 className="text-white/60 text-xs uppercase tracking-wide mb-3">Carte active</h2>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/20 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/70 text-xs mb-1">{activeCard?.type}</p>
                      <p className="text-white text-lg font-mono font-bold mb-2">{activeCard?.cardNumber}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <p className="text-white/40 text-xs">Solde</p>
                          <p className="text-white font-semibold">{activeCard?.balance.toFixed(2)} MAD</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Valide jusqu'au</p>
                          <p className="text-white">{activeCard?.validUntil}</p>
                        </div>
                      </div>
                    </div>
                    {activeCard && (
                      <div className={`${getStatusInfo(activeCard.status).color} text-xs px-2 py-1 rounded-full`}>
                        {getStatusInfo(activeCard.status).label}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Other cards */}
              <div className="mb-6">
                <h2 className="text-white/60 text-xs uppercase tracking-wide mb-3">Vos autres cartes</h2>
                <div className="space-y-3">
                  {(Array.isArray(cards) ? cards : []).filter(c => c.id !== activeCardId).map(card => {
                    const statusInfo = getStatusInfo(card.status);
                    return (
                      <div key={card.id} className="bg-black/40 rounded-xl border border-white/10 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white/60 text-xs">{card.type}</p>
                            <p className="text-white font-mono text-sm mb-1">{card.cardNumber}</p>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="text-white/40">Solde: {card.balance.toFixed(2)} MAD</span>
                              <span className="text-white/40">Exp: {card.validUntil}</span>
                            </div>
                          </div>
                          <div className={`${statusInfo.color} text-xs px-2 py-1 rounded-full`}>
                            {statusInfo.label}
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-4 mt-2">
                          {/* Disable switch button if card is blocked or expired */}
                          {card.status === 'blocked' || card.status === 'expired' ? (
                            <span className="text-white/30 text-xs" title={card.status === 'blocked' ? 'Carte bloquée' : 'Carte expirée'}>
                              Utilisation impossible
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSelectCard(card.id)}
                              className="text-yellow-500 text-xs font-medium hover:text-yellow-400"
                            >
                              Utiliser cette carte
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveCard(card.id)}
                            className="text-red-400 text-xs hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(Array.isArray(cards) ? cards : []).filter(c => c.id !== activeCardId).length === 0 && (
                    <p className="text-white/40 text-sm text-center py-4">
                      Aucune autre carte. Ajoutez-en une ci-dessous.
                    </p>
                  )}
                </div>
              </div>

              {/* Add new card button */}
              <button
                onClick={() => setShowAddCardModal(true)}
                className="w-full bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 p-4 flex items-center justify-center space-x-2 transition-all"
              >
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span className="text-white font-medium">Ajouter une nouvelle carte</span>
              </button>

              {/* Help / Support link */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleSupport}
                  className="text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                  Besoin d'aide ? Contactez le support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal (PIN) for both switch and remove */}
      {showVerificationModal && (
        <div className={styles.modalOverlay} onClick={() => setShowVerificationModal(false)}>
          <div className="bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] rounded-2xl p-6 w-80 border border-yellow-500/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-2">Vérification d'identité</h3>
            <p className="text-white/60 text-sm mb-4">
              {pendingAction?.type === 'switch' 
                ? 'Entrez votre code PIN pour changer de carte.' 
                : 'Entrez votre code PIN pour supprimer cette carte.'}
            </p>
            <input
              type="password"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Code PIN"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm mb-2 focus:border-yellow-500/30 outline-none"
            />
            {verificationError && (
              <p className="text-red-400 text-xs mb-3">{verificationError}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 bg-white/10 text-white py-2 rounded-xl hover:bg-white/20"
              >
                Annuler
              </button>
              <button
                onClick={verifyAndExecuteAction}
                className="flex-1 bg-yellow-500 text-[#400106] font-semibold py-2 rounded-xl hover:bg-yellow-400"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddCardModal(false)}>
          <div className="bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] rounded-2xl p-6 w-80 border border-yellow-500/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-2">Ajouter une carte</h3>
            <p className="text-white/60 text-sm mb-4">Entrez les détails de votre nouvelle carte.</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Type de carte</label>
                <select
                  value={newCardType}
                  onChange={(e) => setNewCardType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-yellow-500/30 outline-none"
                >
                  <option>Virtual</option>
                  <option>Physical</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Numéro de carte (16 chiffres)</label>
                <input
                  type="text"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-yellow-500/30 outline-none"
                />
              </div>
              {addCardError && (
                <p className="text-red-400 text-xs">{addCardError}</p>
              )}
            </div>
            <div className="flex space-x-3 mt-5">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="flex-1 bg-white/10 text-white py-2 rounded-xl hover:bg-white/20"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 bg-yellow-500 text-[#400106] font-semibold py-2 rounded-xl hover:bg-yellow-400"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSwitchConfirmation && switchSuccessCard && (
        <div className="toast-confirm">
          Carte changée avec succès !
        </div>
      )}
    </>
  );
};


