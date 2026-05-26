import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/Security.module.css';
import { getUserPreferences, updateUserPreferences } from '../../services/notificationService';

const SecurityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- State for toggles ---
  const [pinEnabled, setPinEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [requireAuthSensitive, setRequireAuthSensitive] = useState(false);
  const [antiReplayAlerts, setAntiReplayAlerts] = useState(true);
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true);
  const [cardFrozen, setCardFrozen] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          setPinEnabled(prefs.pin_enabled ?? true);
          setBiometricEnabled(prefs.biometric_enabled ?? false);
          setRequireAuthSensitive(prefs.auth_purchase ?? false);
          setAntiReplayAlerts(prefs.anti_replay_alerts ?? true);
          setSuspiciousActivityAlerts(prefs.suspicious_activity_alerts ?? true);
          setCardFrozen(prefs.card_frozen ?? false);
        }
      } catch (err) {
        console.error('Failed to load security preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, []);

  // --- Handlers ---
  const goBack = () => navigate(-1);
  const handleChangePassword = () => {};
  const handleSetRecovery = () => {};
  
  const handlePreferenceChange = async (key, value) => {
    // Optimistic update
    const setters = {
      pin_enabled: setPinEnabled,
      biometric_enabled: setBiometricEnabled,
      auth_purchase: setRequireAuthSensitive,
      anti_replay_alerts: setAntiReplayAlerts,
      suspicious_activity_alerts: setSuspiciousActivityAlerts,
      card_frozen: setCardFrozen
    };

    if (setters[key]) setters[key](value);

    try {
      await updateUserPreferences({ [key]: value });
    } catch (err) {
      console.error(`Failed to update ${key}:`, err);
      // Revert on failure
      if (setters[key]) setters[key](!value);
    }
  };
  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };
  const handleLogoutAll = () => {
    setSessions(sessions.filter(s => s.current));
  };
  const handleFreezeCard = () => {
    handlePreferenceChange('card_frozen', !cardFrozen);
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* Security Card */}
        <div className={`${styles.securityCard} app-card`}>
          
          <Header 
            title={t('security_title')} 
            showBackButton={true} 
            onBack={goBack} 
          />

          {/* Scrollable content */}
          <div className={`app-content ${styles.scrollContainer}`}>
            
            {/* Authentication Section */}
            <Section title={t('app_auth_section')}>
              <ToggleItem
                icon="lock"
                label={t('pin_label')}
                description={t('pin_desc')}
                value={pinEnabled}
                onChange={(v) => handlePreferenceChange('pin_enabled', v)}
              />
              <ToggleItem
                icon="faceid"
                label={t('biometric_label')}
                description={t('biometric_desc')}
                value={biometricEnabled}
                onChange={(v) => handlePreferenceChange('biometric_enabled', v)}
              />
              <ToggleItem
                icon="shield"
                label={t('sensitive_actions_label')}
                description={t('sensitive_actions_desc')}
                value={requireAuthSensitive}
                onChange={(v) => handlePreferenceChange('auth_purchase', v)}
              />
            </Section>

            {/* Session Management */}
            <Section title={t('sessions')}>
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="bg-black/40 rounded-xl border border-white/10 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium text-sm">{session.device}</p>
                          {session.current && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">{t('current_session_badge')}</span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs mt-1">{session.location}</p>
                        <p className="text-white/40 text-xs">{t('last_activity')}: {session.lastActive}</p>
                      </div>
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-400 text-xs hover:text-red-300"
                        >
                          {t('revoke_session')}
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
                    {t('disconnect_other_devices')}
                  </button>
                )}
              </div>
            </Section>

            {/* Fraud Prevention */}
            <Section title={t('fraud_prevention')}>
              <ToggleItem
                icon="alert"
                label={t('anti_replay_label')}
                description={t('anti_replay_desc')}
                value={antiReplayAlerts}
                onChange={(v) => handlePreferenceChange('anti_replay_alerts', v)}
              />
              <ToggleItem
                icon="suspicious"
                label={t('suspicious_activity_label')}
                description={t('suspicious_activity_desc')}
                value={suspiciousActivityAlerts}
                onChange={(v) => handlePreferenceChange('suspicious_activity_alerts', v)}
              />
            </Section>

            {/* Encryption & Security Info */}
            <Section title={t('encryption_section')}>
              <div className="bg-black/40 rounded-xl border border-white/10 p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-white/70 text-xs">{t('aes_encryption')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-white/70 text-xs">{t('rsa_signing')}</p>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="text-white/40 text-xs">{t('last_security_audit')}</p>
                </div>
              </div>
            </Section>

            {/* Card Security */}
            <Section title={t('card_security_section')}>
              <div className="bg-black/40 rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t('freeze_virtual_card')}</p>
                      <p className="text-white/40 text-xs">{t('prevent_use_loss')}</p>
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
                  <p className="text-yellow-500 text-xs mt-3">{t('card_frozen_alert')}</p>
                )}
              </div>
            </Section>

            {/* Password & Recovery */}
            <Section title={t('password_recovery_section')}>
              <div className="space-y-2">
                <ArrowItem
                  icon="key"
                  label={t('change_password')}
                  onClick={handleChangePassword}
                />
                <ArrowItem
                  icon="recovery"
                  label={t('set_recovery')}
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
    <svg className="w-5 h-5 text-white/40 rtl-flip" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default SecurityPage;
