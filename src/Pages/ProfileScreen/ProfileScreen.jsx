import React, { useState } from 'react';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import SettingsMenuItem from '../../Components/UI/SettingsMenuItem';
import ProfileAvatar from '../../Components/UI/ProfileAvatar';
import ContactInfoItem from '../../Components/UI/ContactInfoItem';
import ProfileMenuCard from '../../Components/UI/ProfileMenuCard';
import styles from '../../Styles/ProfileScreen.module.css';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('profile');

  const navigate = (section) => {
    setActiveTab(section);
    console.log('Navigating to:', section);
  };

  const handleEditProfile = () => {
    console.log('Navigating to edit profile...');
  };

  const handleSettings = () => {
    console.log('Navigating to settings...');
  };

  const handleSupport = () => {
    console.log('Navigating to support...');
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
      `}</style>

      <div className={styles['profile-container']}>
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto p-4">
          {/* Profile Card */}
          <div className={styles['profile-card']}>
            
            {/* Header */}
            <div className={styles['profile-header']}>
              <h1 className={styles['profile-header-title']}>Mon Profil</h1>
            </div>

            {/* Main Content - Scrollable */}
            <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${styles['profile-scrollbar']} px-6 pb-24`}>
              
              {/* Profile Info Card */}
              <div className={`${styles['profile-info-card']} ${styles['mb-6']}`}>
                {/* Profile Avatar */}
                <div className="flex justify-center mb-6">
                  <ProfileAvatar
                    size="lg"
                    showPremiumBadge={true}
                    initials="SM"
                  />
                </div>

                {/* Name & Status */}
                <div className="text-center mb-6">
                  <h2 className={styles['profile-name']}>Sophie Marchand</h2>
                  <p className={styles['profile-status']}>Membre Premium</p>
                </div>

                {/* Contact Info */}
                <div className={styles['contact-info-container']}>
                  {/* Email */}
                  <ContactInfoItem
                    label="Email"
                    value="sophie.marchand@email.fr"
                    truncate={true}
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    }
                  />

                  {/* Phone */}
                  <ContactInfoItem
                    label="Téléphone"
                    value="+33 6 12 34 56 78"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    }
                  />

                  {/* Member Since */}
                  <ContactInfoItem
                    label="Membre depuis"
                    value="Janvier 2024"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    }
                  />
                </div>

                {/* Edit Profile Button */}
                <ActionButtonCard
                  variant="validation"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  }
                  label="Modifier le profil"
                  onClick={handleEditProfile}
                  showArrow={false}
                  className="w-full mt-6"
                />
              </div>

              {/* Menu Options */}
              <div className={styles['menu-options-container']}>
                {/* Settings */}
                <ProfileMenuCard
                  title="Paramètres"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    </svg>
                  }
                  onPress={handleSettings}
                />

                {/* Help & Support */}
                <ProfileMenuCard
                  title="Aide & Support"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  }
                  onPress={handleSupport}
                />

                {/* Logout */}
                <SettingsMenuItem
                  title="Déconnexion"
                  icon={
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                    </svg>
                  }
                  onClick={handleLogout}
                  variant="danger"
                />
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-white/10 px-6 py-4">
              <BottomNavigation 
                activeTab={activeTab}
                onNavigate={navigate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}