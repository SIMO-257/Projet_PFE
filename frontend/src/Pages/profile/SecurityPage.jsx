import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/Security.module.css';
import { getUserPreferences, updateUserPreferences } from '../../services/notificationService';
import { setPin, disablePin, getPinStatus, resetPin, setRecoveryEmail as setRecoveryEmailApi, getRecoveryEmail as getRecoveryEmailApi } from '../../services/pinService';

const PIN_LENGTH = 4;

const SecurityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Preference toggles
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinSet, setPinSet] = useState(false);

  // --- PIN Setup Modal State ---
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinSetupMode, setPinSetupMode] = useState('setup'); // 'setup' | 'change'
  const [pinSetupStep, setPinSetupStep] = useState('password'); // 'password' | 'enter' | 'confirm'
  const [pinPassword, setPinPassword] = useState('');
  const [pinTemp, setPinTemp] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');
  const [pinSetting, setPinSetting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const pwInputRef = useRef(null);

  // --- PIN Disable Modal State ---
  const [showPinDisable, setShowPinDisable] = useState(false);
  const [pinDisableValue, setPinDisableValue] = useState('');
  const [pinDisableError, setPinDisableError] = useState('');
  const [pinDisabling, setPinDisabling] = useState(false);
  const [pinDisableShake, setPinDisableShake] = useState(false);

  // --- PIN Recovery Modal State ---
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState('password'); // 'password' | 'sent'
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPwError, setRecoveryPwError] = useState('');
  const [recoveryPwShow, setRecoveryPwShow] = useState(false);
  const [recoverySending, setRecoverySending] = useState(false);
  const [recoverySentTo, setRecoverySentTo] = useState('');

  // --- Recovery Email Modal State ---
  const [showRecoveryEmail, setShowRecoveryEmail] = useState(false);
  const [recoveryEmailData, setRecoveryEmailData] = useState(null); // { email, masked } | null
  const [recoveryEmailStep, setRecoveryEmailStep] = useState('verify'); // 'verify' | 'email'
  const [recoveryEmailPassword, setRecoveryEmailPassword] = useState('');
  const [recoveryEmailPin, setRecoveryEmailPin] = useState('');
  const [recoveryEmailNew, setRecoveryEmailNew] = useState('');
  const [recoveryEmailError, setRecoveryEmailError] = useState('');
  const [recoveryEmailSaving, setRecoveryEmailSaving] = useState(false);
  const [recoveryEmailShowPw, setRecoveryEmailShowPw] = useState(false);
  const [recoveryEmailShowPin, setRecoveryEmailShowPin] = useState(false);

  // ========== Load ==========
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [prefs, pinStatus, recoveryRes] = await Promise.all([
          getUserPreferences(),
          getPinStatus(),
          getRecoveryEmailApi(),
        ]);
        const ps = pinStatus?.data || pinStatus;
        setPinSet(ps?.pin_set ?? false);
        setPinEnabled(prefs?.pin_enabled ?? ps?.pin_set ?? false);

        // Load recovery email data
        const recoveryData = recoveryRes?.data || recoveryRes;
        if (recoveryData?.masked) {
          setRecoveryEmailData({ masked: recoveryData.masked });
        }

      } catch (err) {
        console.error('Failed to load security preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ========== Navigation ==========
  const goBack = () => navigate(-1);

  // ========== Preference Toggle ==========
  const handlePreferenceChange = async (key, value) => {
    const setters = {
      pin_enabled: setPinEnabled,
    };

    if (setters[key]) setters[key](value);

    try {
      await updateUserPreferences({ [key]: value });
    } catch (err) {
      console.error(`Failed to update ${key}:`, err);
      if (setters[key]) setters[key](!value);
    }
  };

  // ========== PIN Toggle Handler ==========
  const handlePinToggle = () => {
    if (!pinEnabled) {
      // Turning ON
      if (pinSet) {
        // Already set — just toggle preference
        handlePreferenceChange('pin_enabled', true);
      } else {
        // Not set — show setup
        openPinSetup('setup');
      }
    } else {
      // Turning OFF
      if (pinSet) {
        // Has a PIN — require current PIN to disable
        setShowPinDisable(true);
      } else {
        // No PIN — just toggle
        handlePreferenceChange('pin_enabled', false);
      }
    }
  };

  // ========== PIN Setup Modal ==========
  const openPinSetup = (mode) => {
    setPinSetupMode(mode);
    setPinSetupStep('password');
    setPinPassword('');
    setPinTemp('');
    setPinSetupError('');
    setShowPw(false);
    setShowPinSetup(true);
  };

  const resetPinSetup = () => {
    setShowPinSetup(false);
    setPinSetupStep('password');
    setPinPassword('');
    setPinTemp('');
    setPinSetupError('');
    setShowPw(false);
  };

  // Handle password step
  const handlePinPasswordNext = () => {
    if (!pinPassword.trim()) {
      setPinSetupError(t('pin_confirm_password'));
      return;
    }
    setPinSetupError('');
    setPinSetupStep('enter');
  };

  // Handle PIN digit input (setup)
  const handlePinDigit = (digit) => {
    if (pinTemp.length < PIN_LENGTH) {
      setPinTemp(prev => prev + digit);
      setPinSetupError('');
    }
  };

  const handlePinBackspace = () => {
    setPinTemp(prev => prev.slice(0, -1));
    setPinSetupError('');
  };

  // Confirm PIN step — advance to "confirm" step
  const confirmFirstPin = () => {
    if (pinTemp.length !== PIN_LENGTH) return;
    setPinSetupStep('confirm');
  };

  // Handle re-enter PIN
  const [pinConfirm, setPinConfirm] = useState('');

  const handleConfirmDigit = (digit) => {
    if (pinConfirm.length < PIN_LENGTH) {
      setPinConfirm(prev => prev + digit);
      setPinSetupError('');
    }
  };

  const handleConfirmBackspace = () => {
    setPinConfirm(prev => prev.slice(0, -1));
    setPinSetupError('');
  };

  // Submit PIN setup
  const submitPinSetup = async () => {
    if (pinConfirm.length !== PIN_LENGTH || pinTemp !== pinConfirm) {
      setPinSetupError(t('pin_mismatch'));
      setPinConfirm('');
      return;
    }

    setPinSetting(true);
    setPinSetupError('');

    try {
      await setPin(pinTemp, pinPassword);
      // Success — the backend already sets pin_enabled=true in preferences atomically
      setPinSet(true);
      setPinEnabled(true);
      resetPinSetup();
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.pin?.[0]
        || t('pin_setup_error');
      setPinSetupError(msg);
      setPinTemp('');
      setPinConfirm('');
      setPinSetupStep('enter');
    } finally {
      setPinSetting(false);
    }
  };

  // Reset confirm state when going back
  useEffect(() => {
    if (pinSetupStep === 'confirm') {
      setPinConfirm('');
      setPinSetupError('');
    }
    if (pinSetupStep === 'enter') {
      setPinTemp('');
      // Ne pas effacer pinSetupError ici — il est set par submitPinSetup
      // avant le changement d'étape. L'erreur est effacée quand l'utilisateur
      // commence à taper (handlePinDigit) ou en ouvrant la modale (openPinSetup).
    }
    if (pinSetupStep === 'password') {
      setPinPassword('');
      setPinSetupError('');
      setShowPw(false);
    }
  }, [pinSetupStep]);

  // Focus password input
  useEffect(() => {
    if (pinSetupStep === 'password' && showPinSetup) {
      setTimeout(() => pwInputRef.current?.focus(), 150);
    }
  }, [pinSetupStep, showPinSetup]);

  // ========== Recovery Email Helpers ==========

  const openRecoveryEmail = () => {
    setRecoveryEmailStep('verify');
    setRecoveryEmailPassword('');
    setRecoveryEmailPin('');
    setRecoveryEmailNew('');
    setRecoveryEmailError('');
    setRecoveryEmailShowPw(false);
    setRecoveryEmailShowPin(false);
    setShowRecoveryEmail(true);
  };

  const closeRecoveryEmail = () => {
    setShowRecoveryEmail(false);
    setRecoveryEmailStep('verify');
  };

  const submitRecoveryEmailVerify = () => {
    if (!recoveryEmailPassword.trim()) {
      setRecoveryEmailError('Veuillez entrer votre mot de passe.');
      return;
    }
    if (recoveryEmailPin.length < 4) {
      setRecoveryEmailError('Veuillez entrer votre code PIN.');
      return;
    }
    setRecoveryEmailError('');
    setRecoveryEmailStep('email');
  };

  const submitRecoveryEmailSave = async () => {
    const email = recoveryEmailNew.trim();
    if (!email) {
      setRecoveryEmailError('Veuillez entrer un email de récupération.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRecoveryEmailError('Email invalide.');
      return;
    }

    setRecoveryEmailSaving(true);
    setRecoveryEmailError('');

    try {
      const res = await setRecoveryEmailApi(email, recoveryEmailPassword, recoveryEmailPin);
      const data = res?.data || res;
      setRecoveryEmailData({ email, masked: data?.masked || email });
      closeRecoveryEmail();
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.email?.[0]
        || err?.response?.data?.errors?.current_password?.[0]
        || err?.response?.data?.errors?.pin?.[0]
        || 'Erreur lors de l\'enregistrement.';
      setRecoveryEmailError(msg);
    } finally {
      setRecoveryEmailSaving(false);
    }
  };

  const handleRecoveryEmailPinDigit = (digit) => {
    if (recoveryEmailPin.length < 4) {
      setRecoveryEmailPin(prev => prev + digit);
      setRecoveryEmailError('');
    }
  };

  const handleRecoveryEmailPinBackspace = () => {
    setRecoveryEmailPin(prev => prev.slice(0, -1));
    setRecoveryEmailError('');
  };

  // ========== PIN Disable Modal ==========
  const handleDisableDigit = (digit) => {
    if (pinDisableValue.length < PIN_LENGTH) {
      setPinDisableValue(prev => prev + digit);
      setPinDisableError('');
    }
  };

  const handleDisableBackspace = () => {
    setPinDisableValue(prev => prev.slice(0, -1));
    setPinDisableError('');
  };

  const submitPinDisable = async () => {
    if (pinDisableValue.length !== PIN_LENGTH || pinDisabling) return;

    setPinDisabling(true);
    setPinDisableError('');

    try {
      await disablePin(pinDisableValue);
      // Success — the backend already sets pin_enabled=false in preferences atomically
      setPinSet(false);
      setPinEnabled(false);
      setShowPinDisable(false);
      setPinDisableValue('');
    } catch (err) {
      const msg = err?.response?.data?.message || t('pin_incorrect');
      setPinDisableError(msg);
      setPinDisableShake(true);
      setTimeout(() => setPinDisableShake(false), 500);
      setPinDisableValue('');
    } finally {
      setPinDisabling(false);
    }
  };

  // ========== PIN Recovery Modal ==========
  const recoveryPwInputRef = useRef(null);

  const openRecovery = () => {
    setRecoveryStep('password');
    setRecoveryPassword('');
    setRecoveryPwError('');
    setRecoveryPwShow(false);
    setRecoverySending(false);
    setRecoverySentTo('');
    setShowRecovery(true);
  };

  // Auto-focus recovery password input
  useEffect(() => {
    if (recoveryStep === 'password' && showRecovery) {
      setTimeout(() => recoveryPwInputRef.current?.focus(), 200);
    }
  }, [recoveryStep, showRecovery]);

  const closeRecovery = () => {
    setShowRecovery(false);
    setRecoveryStep('password');
    setRecoveryPassword('');
    setRecoveryPwError('');
    setRecoverySentTo('');
  };

  const submitRecovery = async () => {
    if (recoverySending) return;
    if (!recoveryPassword.trim()) {
      setRecoveryPwError('Veuillez entrer votre mot de passe.');
      return;
    }
    setRecoverySending(true);
    setRecoveryPwError('');

    try {
      const res = await resetPin(recoveryPassword);
      const data = res?.data || res;
      setRecoverySentTo(data?.masked || '');
      setRecoveryStep('sent');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.current_password?.[0]
        || 'Erreur lors de la réinitialisation.';
      setRecoveryPwError(msg);
      setRecoveryStep('password');
    } finally {
      setRecoverySending(false);
    }
  };

  // ========== Auto-open PIN modal from navigation state ==========
  useEffect(() => {
    if (loading) return;

    const action = location.state?.openPinSetup;
    if (!action) return;

    // Clear the state so it doesn't re-trigger
    window.history.replaceState({}, document.title);

    if (action === 'setup') {
      openPinSetup('setup');
    } else if (action === 'disable') {
      setShowPinDisable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ========== Loading ==========
  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <p className="text-[#f5d579] font-bold text-lg animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className={`${styles.securityCard} app-card`}>
          <Header title={t('security_title')} showBackButton={true} onBack={goBack} />

          <div className={`app-content ${styles.scrollContainer}`}>

            {/* ── Authentication Section ── */}
            <Section title={t('app_auth_section')}>
              <ToggleItem
                icon="lock"
                label={t('pin_label')}
                description={pinSet ? t('pin_set_desc') : t('pin_desc')}
                value={pinEnabled}
                onChange={handlePinToggle}
              />
              {pinSet && pinEnabled && (
                <button
                  onClick={() => openPinSetup('change')}
                  className="w-full mt-1 text-left bg-black/40 rounded-xl border border-white/10 hover:border-white/20 transition-all p-3 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t('change_password')}</p>
                      <p className="text-white/40 text-xs">{t('pin_change_label')}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/40 rtl-flip group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              )}

            </Section>

            {/* ── Password & Recovery ── */}
            <Section title={t('password_recovery_section')}>
              {/* Recovery Email */}
              <ArrowItem
                icon="email"
                label={recoveryEmailData?.masked ? `Email de récupération : ${recoveryEmailData.masked}` : 'Ajouter un email de récupération'}
                description={recoveryEmailData?.masked ? 'Le PIN réinitialisé sera envoyé sur cet email.' : 'Recevez le code PIN de réinitialisation sur un email différent.'}
                onClick={openRecoveryEmail}
              />

              {/* PIN Reset */}
              <ArrowItem
                icon="recovery"
                label={t('set_recovery')}
                onClick={openRecovery}
              />
            </Section>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PIN SETUP / CHANGE MODAL
      ════════════════════════════════════════════════════════ */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
          <div
            className={`bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 border border-[#f5d579]/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/50 animate-countUp`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── STEP: Password ── */}
            {pinSetupStep === 'password' && (
              <>
                <div className="pt-8 pb-4 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#f5d579]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">
                    {pinSetupMode === 'change' ? t('pin_change_title') : t('pin_setup_title')}
                  </h2>
                  <p className="text-white/50 text-xs mt-1">
                    {t('pin_confirm_password')}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <div className="relative mb-4">
                    <input
                      ref={pwInputRef}
                      type={showPw ? 'text' : 'password'}
                      value={pinPassword}
                      onChange={(e) => { setPinPassword(e.target.value); setPinSetupError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handlePinPasswordNext(); }}
                      placeholder={t('pin_current_password')}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm
                        placeholder:text-white/30 focus:outline-none focus:border-[#f5d579]/40 focus:ring-1 focus:ring-[#f5d579]/20 transition-all"
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPw ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {pinSetupError && (
                    <p className="text-red-400 text-xs text-center mb-4 animate-fadeIn">{pinSetupError}</p>
                  )}                    <button
                      onClick={handlePinPasswordNext}
                      disabled={!pinPassword.trim()}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                        pinPassword.trim()
                          ? 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95'
                          : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {t('continue')}
                  </button>

                  <button onClick={resetPinSetup} className="w-full mt-3 py-3 rounded-2xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/5 transition-all">
                    {t('cancel')}
                  </button>
                </div>
              </>
            )}

            {/* ── STEP: Enter PIN ── */}
            {pinSetupStep === 'enter' && (
              <>
                <div className="pt-8 pb-2 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#f5d579]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">{t('pin_enter_new')}</h2>
                  <p className="text-white/50 text-xs mt-1">{t('pin_choose_pin', { length: PIN_LENGTH })}</p>
                </div>

                <PinDots length={PIN_LENGTH} filled={pinTemp.length} />

                {pinSetupError && (
                  <p className="text-red-400 text-xs text-center -mt-2 mb-2 animate-fadeIn">{pinSetupError}</p>
                )}

                <div className="px-6 pb-6">
                  <NumericKeypad
                    onDigit={handlePinDigit}
                    onBackspace={handlePinBackspace}
                    onSubmit={confirmFirstPin}
                    filled={pinTemp.length}
                    disabled={pinSetting}
                  />

                  <button
                    onClick={() => setPinSetupStep('password')}
                    className="w-full mt-2 py-3 rounded-2xl text-white/40 text-xs font-medium hover:text-white/60 hover:bg-white/5 transition-all"
                  >
                    {t('back')}
                  </button>
                </div>
              </>
            )}

            {/* ── STEP: Confirm PIN ── */}
            {pinSetupStep === 'confirm' && (
              <>
                <div className="pt-8 pb-2 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#f5d579]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">{t('pin_confirm_title')}</h2>
                  <p className="text-white/50 text-xs mt-1">{t('pin_reenter')}</p>
                </div>

                <PinDots length={PIN_LENGTH} filled={pinConfirm.length} />

                {pinSetupError && (
                  <p className="text-red-400 text-xs text-center -mt-2 mb-2 animate-fadeIn">{pinSetupError}</p>
                )}

                <div className="px-6 pb-6">
                  <NumericKeypad
                    onDigit={handleConfirmDigit}
                    onBackspace={handleConfirmBackspace}
                    onSubmit={submitPinSetup}
                    filled={pinConfirm.length}
                    disabled={pinSetting}
                  />

                  <button
                    onClick={() => setPinSetupStep('enter')}
                    className="w-full mt-2 py-3 rounded-2xl text-white/40 text-xs font-medium hover:text-white/60 hover:bg-white/5 transition-all"
                  >
                    {t('back')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PIN RECOVERY MODAL (forgot PIN)
      ════════════════════════════════════════════════════════ */}
      {showRecovery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
          <div
            className="bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 border border-[#f5d579]/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/50 animate-countUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── STEP 1: Password ── */}
            {recoveryStep === 'password' && (
              <>
                <div className="pt-8 pb-4 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">Réinitialiser le code PIN</h2>
                  <p className="text-white/50 text-xs mt-1">
                    Confirmez votre mot de passe pour autoriser la réinitialisation.
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <div className="relative mb-4">
                    <input
                      ref={recoveryPwInputRef}
                      type={recoveryPwShow ? 'text' : 'password'}
                      value={recoveryPassword}
                      onChange={(e) => { setRecoveryPassword(e.target.value); setRecoveryPwError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && recoveryPassword.trim()) submitRecovery(); }}
                      placeholder="Mot de passe actuel"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm
                        placeholder:text-white/30 focus:outline-none focus:border-[#f5d579]/40 focus:ring-1 focus:ring-[#f5d579]/20 transition-all"
                    />
                    <button
                      onClick={() => setRecoveryPwShow(!recoveryPwShow)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {recoveryPwShow ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {recoveryPwError && (
                    <p className="text-red-400 text-xs text-center mb-4 animate-fadeIn">{recoveryPwError}</p>
                  )}

                  <button
                    onClick={submitRecovery}
                    disabled={recoverySending || !recoveryPassword.trim()}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      !recoverySending && recoveryPassword.trim()
                        ? 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95'
                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {recoverySending ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Envoi en cours...
                      </>
                    ) : 'Envoyer le nouveau code PIN'}
                  </button>

                  <button onClick={closeRecovery} className="w-full mt-3 py-3 rounded-2xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/5 transition-all">
                    Annuler
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Confirmation ── */}
            {recoveryStep === 'sent' && (
              <>
                <div className="pt-8 pb-4 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">Code PIN envoyé !</h2>
                  <p className="text-white/50 text-xs mt-2 leading-relaxed">
                    Un nouveau code PIN à 4 chiffres a été envoyé à :
                  </p>
                  <p className="text-[#f5d579] font-semibold text-sm mt-2">{recoverySentTo}</p>
                  <p className="text-white/40 text-xs mt-3 leading-relaxed">
                    {recoveryEmailData?.masked
                      ? 'Ce code a été envoyé à votre email de récupération.'
                      : 'Utilisez ce code pour vous connecter. Vous pourrez le modifier dans les paramètres de sécurité.'}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={closeRecovery}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Terminé
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          RECOVERY EMAIL MODAL
      ════════════════════════════════════════════════════════ */}
      {showRecoveryEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
          <div
            className="bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 border border-[#f5d579]/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/50 animate-countUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── STEP 1: Verify identity (password + PIN) ── */}
            {recoveryEmailStep === 'verify' && (
              <>
                <div className="pt-8 pb-4 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">
                    {recoveryEmailData?.masked ? 'Modifier l\'email de récupération' : 'Ajouter un email de récupération'}
                  </h2>
                  <p className="text-white/50 text-xs mt-1">
                    Vérifions votre identité avant de continuer.
                  </p>
                </div>

                <div className="px-6 pb-6">
                  {/* Password */}
                  <div className="relative mb-3">
                    <input
                      type={recoveryEmailShowPw ? 'text' : 'password'}
                      value={recoveryEmailPassword}
                      onChange={(e) => { setRecoveryEmailPassword(e.target.value); setRecoveryEmailError(''); }}
                      placeholder="Mot de passe actuel"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm
                        placeholder:text-white/30 focus:outline-none focus:border-[#f5d579]/40 focus:ring-1 focus:ring-[#f5d579]/20 transition-all"
                    />
                    <button
                      onClick={() => setRecoveryEmailShowPw(!recoveryEmailShowPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* PIN */}
                  <div className="mb-4">
                    <div className="flex justify-center gap-3 mb-4">
                      {[1, 2, 3, 4].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            recoveryEmailPin.length > i
                              ? 'bg-[#f5d579] border-[#f5d579] scale-110'
                              : 'bg-transparent border-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => handleRecoveryEmailPinDigit(String(digit))}
                          className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
                            hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        onClick={handleRecoveryEmailPinBackspace}
                        disabled={recoveryEmailPin.length === 0}
                        className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white/70
                          hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all duration-150
                          disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRecoveryEmailPinDigit('0')}
                        className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
                          hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150"
                      >
                        0
                      </button>
                      <button
                        onClick={submitRecoveryEmailVerify}
                        disabled={!recoveryEmailPassword.trim() || recoveryEmailPin.length < 4}
                        className={`w-full aspect-square rounded-2xl font-bold text-lg transition-all duration-150 flex items-center justify-center
                          ${recoveryEmailPassword.trim() && recoveryEmailPin.length >= 4
                            ? 'bg-gradient-to-br from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/20 active:scale-90 hover:shadow-xl hover:shadow-[#f5d579]/30'
                            : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                          }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {recoveryEmailError && (
                    <p className="text-red-400 text-xs text-center mb-4 animate-fadeIn">{recoveryEmailError}</p>
                  )}

                  <button onClick={closeRecoveryEmail} className="w-full py-3 rounded-2xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/5 transition-all">
                    Annuler
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Enter new email ── */}
            {recoveryEmailStep === 'email' && (
              <>
                <div className="pt-8 pb-4 px-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-[#f5d579] font-bold text-lg">
                    {recoveryEmailData?.masked ? 'Nouvel email de récupération' : 'Email de récupération'}
                  </h2>
                  <p className="text-white/50 text-xs mt-1">
                    Cet email recevra le nouveau code PIN en cas de réinitialisation.
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <input
                    type="email"
                    value={recoveryEmailNew}
                    onChange={(e) => { setRecoveryEmailNew(e.target.value); setRecoveryEmailError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && recoveryEmailNew.trim()) submitRecoveryEmailSave(); }}
                    placeholder="exemple@email.com"
                    autoFocus
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm mb-3
                      placeholder:text-white/30 focus:outline-none focus:border-[#f5d579]/40 focus:ring-1 focus:ring-[#f5d579]/20 transition-all"
                  />

                  {recoveryEmailError && (
                    <p className="text-red-400 text-xs text-center mb-4 animate-fadeIn">{recoveryEmailError}</p>
                  )}

                  <button
                    onClick={submitRecoveryEmailSave}
                    disabled={recoveryEmailSaving || !recoveryEmailNew.trim()}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      !recoveryEmailSaving && recoveryEmailNew.trim()
                        ? 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95'
                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {recoveryEmailSaving ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enregistrement...
                      </>
                    ) : (recoveryEmailData?.masked ? 'Modifier' : 'Enregistrer')}
                  </button>

                  <button
                    onClick={() => setRecoveryEmailStep('verify')}
                    className="w-full mt-3 py-3 rounded-2xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/5 transition-all"
                  >
                    Retour
                  </button>

                  <button onClick={closeRecoveryEmail} className="w-full mt-1 py-3 rounded-2xl text-white/30 text-xs font-medium hover:text-white/50 hover:bg-white/5 transition-all">
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PIN DISABLE MODAL
      ════════════════════════════════════════════════════════ */}
      {showPinDisable && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
          <div
            className={`bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 border border-[#f5d579]/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-black/50 animate-countUp ${pinDisableShake ? 'animate-shake' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-8 pb-4 px-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
                </svg>
              </div>
              <h2 className="text-[#f5d579] font-bold text-lg">{t('pin_disable_title')}</h2>
              <p className="text-white/50 text-xs mt-1">{t('pin_enter_current_to_disable')}</p>
            </div>

            <PinDots length={PIN_LENGTH} filled={pinDisableValue.length} />

            {pinDisableError && (
              <p className="text-red-400 text-xs text-center -mt-2 mb-2 animate-fadeIn">{pinDisableError}</p>
            )}

            <div className="px-6 pb-6">
              <NumericKeypad
                onDigit={handleDisableDigit}
                onBackspace={handleDisableBackspace}
                onSubmit={submitPinDisable}
                filled={pinDisableValue.length}
                disabled={pinDisabling}
              />

              <button
                onClick={() => { setShowPinDisable(false); setPinDisableValue(''); setPinDisableError(''); }}
                className="w-full mt-3 py-3 rounded-2xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/5 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ── Reusable subcomponents ──

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

const ArrowItem = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-black/40 rounded-xl border border-white/10 hover:border-white/20 transition-all p-3 text-left flex items-center justify-between group"
  >
    <div className="flex items-center space-x-3 flex-1">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
        <Icon name={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm font-medium block truncate">{label}</span>
        {description && (
          <span className="text-white/40 text-xs block mt-0.5 truncate">{description}</span>
        )}
      </div>
    </div>
    <svg className="w-5 h-5 text-white/40 rtl-flip group-hover:text-white/60 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
    </svg>
  </button>
);

const Icon = ({ name }) => {
  const icons = {
    lock: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
    recovery: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
    email: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
  };
  return icons[name] || null;
};

// ── PIN Keypad Components ──

const PinDots = ({ length, filled }) => (
  <div className="flex justify-center gap-3 my-6">
    {Array.from({ length }).map((_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
          filled > i
            ? 'bg-[#f5d579] border-[#f5d579] scale-110'
            : 'bg-transparent border-white/30'
        }`}
      />
    ))}
  </div>
);

const NumericKeypad = ({ onDigit, onBackspace, onSubmit, filled, disabled }) => (
  <div className="mt-2">
    <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          onClick={() => onDigit(String(digit))}
          disabled={disabled}
          className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
            hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {digit}
        </button>
      ))}

      <button
        onClick={onBackspace}
        disabled={disabled || filled === 0}
        className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white/70
          hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all duration-150
          disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>

      <button
        onClick={() => onDigit('0')}
        disabled={disabled}
        className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl
          hover:bg-white/10 hover:border-white/20 active:scale-90 active:bg-[#f5d579]/20 transition-all duration-150
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        0
      </button>

      <button
        onClick={onSubmit}
        disabled={filled < PIN_LENGTH || disabled}
        className={`w-full aspect-square rounded-2xl font-bold text-lg transition-all duration-150 flex items-center justify-center
          ${filled >= PIN_LENGTH && !disabled
            ? 'bg-gradient-to-br from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/20 active:scale-90 hover:shadow-xl hover:shadow-[#f5d579]/30'
            : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
          }`}
      >
        {disabled ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

export default SecurityPage;
