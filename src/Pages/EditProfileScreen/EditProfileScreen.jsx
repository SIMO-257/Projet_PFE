import React, { useState } from 'react';
import Header from '../../Components/Layout/Header';
import SettingsMenuItem from '../../Components/UI/SettingsMenuItem';
import ProfileImageUpload from '../../Components/UI/ProfileImageUpload';
import FormField from '../../Components/Form/FormField';
import FormSection from '../../Components/Form/FormSection';
import CountryFlag from '../../Components/UI/CountryFlag';
import styles from '../../styles/EditProfile.module.css';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('Sarah Martinez');
  const [email, setEmail] = useState('sarah.martinez@email.com');
  const [phone, setPhone] = useState('+212 661 23 45 67');
  const [profileImage, setProfileImage] = useState(null);

  const goBack = () => {
    console.log('Going back...');
  };

  const handleImageUpload = () => {
    console.log('Opening image picker...');
    // In a real app: open image picker
  };

  const handleChangePassword = () => {
    console.log('Navigating to change password...');
  };

  const handleSaveChanges = () => {
    console.log('Saving changes...', { fullName, email, phone });
  };

  const handleClearField = (field) => {
    if (field === 'name') setFullName('');
    if (field === 'email') setEmail('');
    if (field === 'phone') setPhone('');
  };

  const isEmailValid = email.includes('@') && email.includes('.');

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
      `}</style>

      <div className={styles['edit-profile-container']}>
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto p-4">
          {/* Edit Profile Card */}
          <div className={styles['edit-profile-card']}>
            
            {/* Header */}
            <Header 
              title="Modifier le profil"
              showBackButton={true}
              onBack={goBack}
              className="px-6 pt-6 pb-4"
            />

            {/* Main Content - Scrollable */}
            <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${styles['edit-profile-scrollbar']}`}>
              
              {/* Profile Photo Section */}
              <div className={`flex flex-col items-center ${styles['profile-section']}`}>
                <ProfileImageUpload
                  imageUrl={profileImage}
                  onUpload={handleImageUpload}
                  initials="SM"
                  size="xl"
                />
              </div>

              {/* Form Section */}
              <div className={styles['form-container']}>
                <FormSection title="Informations personnelles">
                  {/* Full Name Field */}
                  <FormField
                    label="Nom complet"
                    type="text"
                    value={fullName}
                    onChange={setFullName}
                    onClear={() => handleClearField('name')}
                    placeholder="Entrez votre nom complet"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    }
                    characterLimit={50}
                  />

                  {/* Email Field */}
                  <FormField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    onClear={() => handleClearField('email')}
                    placeholder="votre@email.com"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    }
                    showValidation={true}
                    isValid={isEmailValid}
                    rightIcon={
                      isEmailValid ? (
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      ) : null
                    }
                  />

                  {/* Phone Field */}
                  <FormField
                    label="Téléphone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    onClear={() => handleClearField('phone')}
                    placeholder="+212 XXX XX XX XX"
                    icon={
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    }
                    prefix={<CountryFlag country="MA" />}
                  />

                  {/* Change Password Button */}
                  <div className={styles['vertical-space']}>
                    <SettingsMenuItem
                      title="Modifier le mot de passe"
                      icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                      }
                      onClick={handleChangePassword}
                    />
                  </div>
                </FormSection>

                {/* Save Button */}
                <div className="mt-8">
                  <button
                    onClick={handleSaveChanges}
                    className={`w-full ${styles['save-button']}`}
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}