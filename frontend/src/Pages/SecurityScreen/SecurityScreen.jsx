import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/Security.module.css';

const SecurityScreen = () => {
  const navigate = useNavigate();

  // --- State for toggles ---
  const [pinEnabled, setPinEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [requireAuthSensitive, setRequireAuthSensitive] = useState(true);
  const [antiReplayAlerts, setAntiReplayAlerts] = useState(true);
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true);
  const [cardFrozen, setCardFrozen] = useState(false);

  // --- Mock active sessions ---
  const [sessions, setSessions] = useState([
    { id: 1, device: 'iPhone 13 Pro', location: 'Casablanca, Maroc', lastActive: 'Aujourd\'hui, 14:32', current: true },
    { id: 2, device: 'MacBook Pro', location: 'Casablanca, Maroc', lastActive: 'Hier, 09:15', current: false },
    { id: 3, device: 'Samsung Galaxy S21', location: 'Rabat, Maroc', lastActive: 'Il y a 3 jours', current: false },
  ]);

  // --- Handlers ---
  const goBack = () => navigate(-1);
  const handleChangePassword = () => {};
  const handleSetRecovery = () => {};
  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };
  const handleLogoutAll = () => {
    setSessions(sessions.filter(s => s.current));
  };
  const handleFreezeCard = () => {
    const newState = !cardFrozen;
    setCardFrozen(newState);
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* Security Card */}
        <div className={`${styles.securityCard} app-card`}>
          
          <Header 
            title="Sécurité" 
            showBackButton={true} 
            onBack={goBack} 
          />

          {/* Scrollable content */}
          <div className={`app-content ${styles.scrollContainer}`}>
            
            {/* Authentication Section */}
            <Section title="Authentification de l'application">
              <ToggleItem
                icon="lock"
                label="Code PIN"
                description="Verrouiller l'application avec un code"
                value={pinEnabled}
                onChange={setPinEnabled}
              />
              <ToggleItem
                icon="faceid"
                label="Authentification biométrique"
                description="Face ID / Touch ID"
                value={biometricEnabled}
                onChange={setBiometricEnabled}
              />
              <ToggleItem
                icon="shield"
                label="Authentification pour actions sensibles"
                description="Paiements, changement de carte, etc."
                value={requireAuthSensitive}
                onChange={setRequireAuthSensitive}
              />
            </Section>

            {/* Session Management */}
            <Section title="Sessions actives">
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="bg-black/40 rounded-xl border border-white/10 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium text-sm">{session.device}</p>
                          {session.current && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">En cours</span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs mt-1">{session.location}</p>
                        <p className="text-white/40 text-xs">Dernière activité: {session.lastActive}</p>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-400 text-xs hover:text-red-300"
                        >
                          Révoquer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.filter(s => !s.current).length > 0 && (
                  <button
                    onClick={handleLogoutAll}
                    className="w-full bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 p-3 text-center text-white/70 text-sm mt-2 transition-all"
                  >
                    Se déconnecter de tous les autres appareils
                  </button>
                )}
              </div>
            </Section>

            {/* Fraud Prevention */}
            <Section title="Prévention des fraudes">
              <ToggleItem
                icon="alert"
                label="Alertes anti‑rejeu"
                description="Notifier si un ticket est utilisé deux fois"
                value={antiReplayAlerts}
                onChange={setAntiReplayAlerts}
              />
              <ToggleItem
                icon="suspicious"
                label="Alertes d'activité suspecte"
                description="Connexions multiples, échecs répétés"
                value={suspiciousActivityAlerts}
                onChange={setSuspiciousActivityAlerts}
              />
            </Section>

            {/* Encryption & Security Info */}
            <Section title="Chiffrement & Sécurité">
              <div className="bg-black/40 rounded-xl border border-white/10 p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-white/70 text-xs">Vos données personnelles sont chiffrées avec AES-256</p>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-white/70 text-xs">Les QR tickets sont signés avec RSA-256</p>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="text-white/40 text-xs">Dernier audit de sécurité: 15 janvier 2026</p>
                </div>
              </div>
            </Section>

            {/* Card Security */}
            <Section title="Sécurité de la carte">
              <div className="bg-black/40 rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Geler la carte virtuelle</p>
                      <p className="text-white/40 text-xs">Empêche toute utilisation en cas de perte</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFreezeCard}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      cardFrozen ? 'bg-yellow-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        cardFrozen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {cardFrozen && (
                  <p className="text-yellow-500 text-xs mt-3">Carte actuellement gelée. Les validations sont bloquées.</p>
                )}
              </div>
            </Section>

            {/* Password & Recovery */}
            <Section title="Mot de passe & Récupération">
              <div className="space-y-2">
                <ArrowItem
                  icon="key"
                  label="Changer le mot de passe"
                  onClick={handleChangePassword}
                />
                <ArrowItem
                  icon="recovery"
                  label="Définir email / téléphone de récupération"
                  onClick={handleSetRecovery}
                />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable subcomponents ---

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-white/60 text-xs uppercase tracking-wide mb-3">{title}</h2>
    {children}
  </div>
);

const ToggleItem = ({ icon, label, description, value, onChange }) => (
  <div className="bg-black/40 rounded-xl border border-white/10 p-3 mb-2 last:mb-0">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Icon name={icon} />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{label}</p>
          <p className="text-white/40 text-xs">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? 'bg-yellow-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  </div>
);

const ArrowItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-black/40 rounded-xl border border-white/10 hover:border-white/20 transition-all p-3 text-left flex items-center justify-between"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
        <Icon name={icon} />
      </div>
      <span className="text-white text-sm font-medium">{label}</span>
    </div>
    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
    </svg>
  </button>
);

const Icon = ({ name }) => {
  const icons = {
    lock: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
    faceid: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>,
    shield: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
    alert: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
    suspicious: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>,
    key: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1-2 1-2 1H2v-2l2-2 2-2 1-1 1.257-1.257A6 6 0 1118 8z" clipRule="evenodd"/></svg>,
    recovery: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
  };
  return icons[name] || null;
};

export default SecurityScreen;
