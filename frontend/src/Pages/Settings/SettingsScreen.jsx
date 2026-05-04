import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/Settings.module.css';

const SettingsScreen = () => {
  const navigate = useNavigate();

  // --- State for toggles ---
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [wifiSyncOnly, setWifiSyncOnly] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [authPurchase, setAuthPurchase] = useState(false);
  const [language, setLanguage] = useState('fr');

  // --- Handlers ---
  const goBack = () => navigate(-1);
  const handleClearCache = () => {};
  const handleManageOffline = () => {};
  const handleHelpSupport = () => {};
  const handleAbout = () => {};
  const handlePrivacyPolicy = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Settings Card */}
        <div className={styles.settingsCard}>
          
          <Header 
            title="Paramètres" 
            showBackButton={true} 
            onBack={goBack} 
          />

          {/* Scrollable content */}
          <div className={styles.scrollContainer}>
            
            {/* ========== NOTIFICATIONS ========== */}
            <Section title="Notifications">
              <ToggleItem
                icon="bell"
                label="Notifications push"
                description="Toutes les alertes"
                value={pushEnabled}
                onChange={setPushEnabled}
              />
              <ToggleItem
                icon="alert"
                label="Rappels de validation"
                description="Avant chaque trajet"
                value={reminderEnabled}
                onChange={setReminderEnabled}
              />
              <ToggleItem
                icon="promo"
                label="Offres promotionnelles"
                description="Messages marketing"
                value={promoEnabled}
                onChange={setPromoEnabled}
              />
            </Section>

            {/* ========== LANGUE ========== */}
            <Section title="Langue">
              <SelectItem
                icon="language"
                label="Langue de l'application"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={[
                  { value: 'fr', label: 'Français' },
                  { value: 'ar', label: 'العربية' },
                  { value: 'en', label: 'English' }
                ]}
              />
            </Section>

            {/* ========== APPARENCE ========== */}
            <Section title="Apparence">
              <ToggleItem
                icon="darkmode"
                label="Mode sombre"
                description="Thème sombre / clair"
                value={darkMode}
                onChange={setDarkMode}
              />
            </Section>

            {/* ========== MODE HORS LIGNE ========== */}
            <Section title="Mode hors ligne">
              <ToggleItem
                icon="offline"
                label="Validations hors ligne"
                description="Utiliser des tickets en cache"
                value={offlineEnabled}
                onChange={setOfflineEnabled}
              />
              <ToggleItem
                icon="wifi"
                label="Synchronisation Wi-Fi uniquement"
                description="Économise les données mobiles"
                value={wifiSyncOnly}
                onChange={setWifiSyncOnly}
              />
            </Section>

            {/* ========== DONNÉES & STOCKAGE ========== */}
            <Section title="Données & Stockage">
              <ArrowItem
                icon="trash"
                label="Vider le cache"
                onClick={handleClearCache}
              />
              <ArrowItem
                icon="data"
                label="Gérer les données hors ligne"
                onClick={handleManageOffline}
              />
            </Section>

            {/* ========== CONFIDENTIALITÉ ========== */}
            <Section title="Confidentialité">
              <ToggleItem
                icon="analytics"
                label="Partage des données d'analyse"
                description="Aider à améliorer l'application"
                value={analyticsEnabled}
                onChange={setAnalyticsEnabled}
              />
              <ToggleItem
                icon="lock"
                label="Authentification pour achats"
                description="Demander le code PIN/biométrie"
                value={authPurchase}
                onChange={setAuthPurchase}
              />
            </Section>

            {/* ========== SUPPORT & LÉGAL ========== */}
            <Section title="Support & Légal">
              <ArrowItem
                icon="help"
                label="Aide & Support"
                onClick={handleHelpSupport}
              />
              <ArrowItem
                icon="info"
                label="À propos"
                value="Version 2.4.1"
                onClick={handleAbout}
              />
              <ArrowItem
                icon="privacy"
                label="Politique de confidentialité"
                onClick={handlePrivacyPolicy}
              />
            </Section>

            {/* Footer */}
            <div className="text-center text-white/30 text-xs mt-6 pb-4">
              <p>© 2026 CasaWay • Tous droits réservés</p>
            </div>
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
    <div className="space-y-2">{children}</div>
  </div>
);

const ToggleItem = ({ icon, label, description, value, onChange }) => (
  <div className="bg-black/40 rounded-xl border border-white/10 p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <Icon name={icon} />
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

const SelectItem = ({ icon, label, value, onChange, options }) => (
  <div className="bg-black/40 rounded-xl border border-white/10 p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Icon name={icon} />
        <span className="text-white text-sm font-medium">{label}</span>
      </div>
      <select
        value={value}
        onChange={onChange}
        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:border-yellow-500/30 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a0507]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const ArrowItem = ({ icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-black/40 rounded-xl border border-white/10 hover:border-white/20 transition-all p-3 text-left flex items-center justify-between"
  >
    <div className="flex items-center space-x-3">
      <Icon name={icon} />
      <span className="text-white text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {value && <span className="text-white/60 text-xs">{value}</span>}
      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  </button>
);

const Icon = ({ name }) => {
  const icons = {
    bell: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>,
    alert: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
    promo: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8 2a2 2 0 100-4 2 2 0 000 4z"/></svg>,
    language: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.514.15-.285.12-.62.34-.95.657-.446.426-.86 1.013-1.181 1.693-.294.622-.489 1.313-.575 2H10v4H5.18c.138 1.17.496 2.266 1.015 3.206.519.94 1.166 1.655 1.796 2.111.296.215.579.373.83.48.25.107.476.148.612.148.136 0 .362-.041.612-.148.251-.107.534-.265.83-.48.63-.456 1.277-1.17 1.796-2.111.519-.94.877-2.036 1.015-3.206H14v-4h-2.61c-.086-.687-.281-1.378-.575-2-.321-.68-.735-1.267-1.181-1.693-.33-.317-.665-.537-.95-.657-.282-.118-.438-.15-.514-.15z" clipRule="evenodd"/></svg>,
    darkmode: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>,
    offline: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12l-6-3-6 3V4z" clipRule="evenodd"/></svg>,
    wifi: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4z"/></svg>,
    trash: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
    data: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12l-6-3-6 3V4z"/></svg>,
    analytics: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
    lock: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
    help: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>,
    info: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>,
    privacy: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
  };
  return <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">{icons[name]}</div>;
};

export default SettingsScreen;