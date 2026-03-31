import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/EditProfile.module.css';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Sarah Martinez');
  const [email, setEmail] = useState('sarah.martinez@email.com');
  const [phone, setPhone] = useState('+212 661 23 45 67');
  const [profileImage, setProfileImage] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  const handleImageUpload = () => {
    console.log('Opening image picker...');
  };

  const handleChangePassword = () => {
    console.log('Navigating to change password...');
  };

  const handleSaveChanges = () => {
    console.log('Saving changes...', { fullName, email, phone });
  };

  const handleClearField = (field) => {
    if (field === 'name') setFullName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Edit Profile Card */}
        <div className={styles.editProfileCard}>
          
          <Header 
            title="Modifier le profil" 
            showBackButton={true} 
            onBack={goBack}
          />

          {/* Main Content - Scrollable */}
          <div className={styles.scrollContainer}>
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                {/* Profile Image */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-yellow-500/50 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-14 h-14 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-4 border-[#400106] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <svg className="w-4 h-4 text-[#400106]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Section Title */}
            <h2 className="text-white/60 text-xs uppercase tracking-wide mb-4">
              Informations personnelles
            </h2>

            {/* Form Fields */}
            <div className="space-y-4">
              
              {/* Full Name Field */}
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wide mb-2 block">
                  Nom complet
                </label>
                <div className="relative bg-black/40 rounded-xl border border-white/10 focus-within:border-yellow-500/30 transition-all">
                  <div className="flex items-center px-4 py-3">
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                      placeholder="Entrez votre nom complet"
                    />
                    {fullName && (
                      <button
                        onClick={() => handleClearField('name')}
                        className="w-5 h-5 flex items-center justify-center ml-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="px-4 pb-2">
                    <div className="text-white/40 text-xs">{fullName.length}/50</div>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wide mb-2 block">
                  Email
                </label>
                <div className="relative bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center px-4 py-3">
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                      placeholder="votre @email.com"
                      disabled
                    />
                    {email && email.includes('@') && email.includes('.') && (
                      <div className="w-5 h-5 flex items-center justify-center ml-2">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wide mb-2 block">
                  Téléphone
                </label>
                <div className="relative bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center px-4 py-3">
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </div>
                    {/* Morocco Flag */}
                    <div className="flex items-center mr-2">
                      <div className="w-5 h-3 rounded-sm overflow-hidden border border-white/20">
                        <svg viewBox="0 0 900 600" className="w-full h-full">
                          <rect width="900" height="600" fill="#C1272D"/>
                          <path d="M 450,200 L 480,300 L 590,270 L 500,330 L 540,440 L 450,360 L 360,440 L 400,330 L 310,270 L 420,300 Z" fill="none" stroke="#006233" strokeWidth="15"/>
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                      placeholder="+212 XXX XX XX XX"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                className="w-full bg-black/40 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all mt-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm">Modifier le mot de passe</span>
                  </div>
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSaveChanges}
                className="w-full bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] font-semibold py-4 rounded-2xl hover:from-[#E5C5A1] hover:to-[#D9B971] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;