import React, { useState } from 'react';
import Header from '../../Components/Layout/Header';
import InfoCard from '../../Components/Cards/InfoCard';
import CollapsibleSection from '../../Components/UI/CollapsibleSection';
import Notification from '../../Components/UI/Notification';
import SettingsToggle from '../../Components/UI/SettingsToggle';
import SettingsMenuItem from '../../Components/UI/SettingsMenuItem';
import SectionHeader from '../../Components/Layout/SectionHeader';
import styles from '../../styles/Settings.module.css';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [tripAlerts, setTripAlerts] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  const goBack = () => {
    console.log('Going back...');
  };

  const navigateTo = (screen) => {
    console.log('Navigating to:', screen);
    setShowNotification(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setShowNotification(true);
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    setShowNotification(true);
  };

  const infoItems = [
    "Paramètres synchronisés automatiquement",
    "Certains paramètres nécessitent une connexion Internet",
    "Les modifications prennent effet immédiatement"
  ];

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
      `}</style>

      <div className={styles['settings-container']}>
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto p-4">
          {/* Settings Card */}
          <div className={styles['settings-card']}>
            
            {/* Header */}
            <Header 
              title="Paramètres"
              showBackButton={true}
              onBack={goBack}
              className="px-6 pt-6 pb-4 border-b border-white/10"
            />

            {/* Main Content - Scrollable */}
            <div className={`max-h-[calc(100vh-150px)] overflow-y-auto ${styles['custom-scrollbar']} px-6 py-6`}>
              
              {/* Profile Section */}
              <div className={styles['mb-6']}>
                <SettingsMenuItem
                  title="Amina Benali"
                  subtitle="amina.benali@email.com"
                  icon={
                    <span className={styles['profile-initials']}>AB</span>
                  }
                  onClick={() => navigateTo('profile')}
                  variant="gradient"
                  className="items-center"
                />
              </div>

              {/* NOTIFICATIONS Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>Notifications</h2>
                <div className={styles['space-y-3']}>
                  <SettingsToggle
                    title="Notifications push"
                    description="Recevoir les notifications importantes"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                      </svg>
                    }
                    isActive={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />

                  <SettingsToggle
                    title="Alertes de trajet"
                    description="Rappels avant expiration de ticket"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/>
                      </svg>
                    }
                    isActive={tripAlerts}
                    onChange={() => setTripAlerts(!tripAlerts)}
                  />
                </div>
              </div>

              {/* LANGUE Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>Langue</h2>
                <SettingsMenuItem
                  title="Langue"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                    </svg>
                  }
                  onClick={() => navigateTo('language')}
                  rightContent={<span className="text-white/60 text-sm">Français</span>}
                />
              </div>

              {/* SÉCURITÉ Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>Sécurité</h2>
                <div className={styles['space-y-3']}>
                  <SettingsToggle
                    title="Authentification biométrique"
                    description="Utiliser Face ID/Touch ID"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd"/>
                        <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11z" clipRule="evenodd"/>
                      </svg>
                    }
                    isActive={biometricAuth}
                    onChange={() => setBiometricAuth(!biometricAuth)}
                  />

                  <SettingsMenuItem
                    title="Code PIN"
                    subtitle="Protéger l'accès à l'application"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={() => navigateTo('pin')}
                    rightContent={<span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Activé</span>}
                  />

                  <SettingsMenuItem
                    title="Changer le mot de passe"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={() => navigateTo('password')}
                  />

                  <SettingsMenuItem
                    title="Appareils connectés"
                    subtitle="2 appareils actifs"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={() => navigateTo('devices')}
                  />

                  <SettingsToggle
                    title="Authentification 2FA"
                    description="Sécurité renforcée"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    }
                    isActive={twoFactorAuth}
                    onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                  />
                </div>
              </div>

              {/* PRÉFÉRENCES Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>Préférences</h2>
                <div className={styles['space-y-3']}>
                  <SettingsMenuItem
                    title="Thème sombre"
                    subtitle="Toujours activé"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                      </svg>
                    }
                    onClick={() => navigateTo('theme')}
                    rightContent={<span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Activé</span>}
                  />

                  <SettingsToggle
                    title="Économiser les données"
                    description="Limiter l'usage des données mobiles"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                    }
                    isActive={dataSaver}
                    onChange={() => setDataSaver(!dataSaver)}
                  />

                  <SettingsToggle
                    title="Actualisation auto"
                    description="Synchroniser automatiquement"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                    }
                    isActive={autoSync}
                    onChange={() => setAutoSync(!autoSync)}
                  />

                  <SettingsToggle
                    title="Sons"
                    description="Sons de validation et notifications"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd"/>
                      </svg>
                    }
                    isActive={sounds}
                    onChange={() => setSounds(!sounds)}
                  />
                </div>
              </div>

              {/* À PROPOS Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>À propos</h2>
                <div className={styles['space-y-3']}>
                  {/* Version Display */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-white font-medium text-sm">Version</span>
                      </div>
                      <span className="text-white/60 text-sm">2.4.1</span>
                    </div>
                  </div>

                  <SettingsMenuItem
                    title="Conditions d'utilisation"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={() => navigateTo('terms')}
                  />

                  <SettingsMenuItem
                    title="Politique de confidentialité"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={() => navigateTo('privacy')}
                  />

                  <SettingsMenuItem
                    title="Licences"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    }
                    onClick={() => navigateTo('licenses')}
                  />
                </div>
              </div>

              {/* COMPTE Section */}
              <div className={styles['mb-6']}>
                <h2 className={styles['section-title']}>Compte</h2>
                <div className={styles['space-y-3']}>
                  <SettingsMenuItem
                    title="Se déconnecter"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={handleLogout}
                    variant="danger"
                  />

                  <SettingsMenuItem
                    title="Supprimer mon compte"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                    }
                    onClick={handleDeleteAccount}
                    variant="danger"
                  />
                </div>
              </div>

              {/* Information Card */}
              <InfoCard
                title="Informations importantes"
                items={infoItems}
                maxHeight={80}
                className="mb-6"
              />

              {/* Footer */}
              <div className={styles['settings-footer']}>
                <p className={styles['settings-footer-text']}>Version 2.4.1</p>
                <p className={styles['settings-footer-text']}>Dernière synchronisation il y a 2 min</p>
                <p className={styles['settings-footer-text']}>© 2026 Casablanca Transport</p>
                <div className={styles['settings-footer-links']}>
                  <button className={styles['settings-footer-link']}>Conditions</button>
                  <span className={styles['settings-footer-separator']}>•</span>
                  <button className={styles['settings-footer-link']}>Confidentialité</button>
                  <span className={styles['settings-footer-separator']}>•</span>
                  <button className={styles['settings-footer-link']}>Licences</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <Notification
          type="info"
          title="Action effectuée"
          message="Cette fonctionnalité est en cours de développement"
          duration={3000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}