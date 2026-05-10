import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Layout/Header';
import styles from '../Styles/EditProfile.module.css';
import {
  clearAuthData,
  fetchClientProfile,
  forgotPasswordClient,
  getAuthToken,
  updateClientProfile,
} from '../services/clientService';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialProfile = location.state?.profile ?? null;
  const [fullName, setFullName] = useState(initialProfile?.name ?? '');
  const [email, setEmail] = useState(initialProfile?.email ?? '');
  const [phone, setPhone] = useState(initialProfile?.phone ?? '');
  const [profileImage, setProfileImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [resetStatus, setResetStatus] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (initialProfile) return;

    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    fetchClientProfile()
      .then((res) => {
        const data = res ?? null;
        if (!data) return;
        setFullName(data?.name ?? '');
        setEmail(data?.email ?? '');
        setPhone(data?.phone ?? '');
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          clearAuthData();
          navigate('/login');
        }
      });
  }, [initialProfile, navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    setResetStatus('');
    if (!email) {
      setErrors((prev) => ({ ...prev, form: ['Email is missing for password reset.'] }));
      return;
    }

    try {
      setSendingReset(true);
      const res = await forgotPasswordClient({ email });
      setResetStatus(res?.data?.message ?? 'Reset link sent successfully.');
    } catch (err) {
      const responseErrors = err?.response?.data?.errors;
      if (responseErrors) {
        setErrors((prev) => ({ ...prev, ...responseErrors }));
      } else {
        setErrors((prev) => ({ ...prev, form: ['Failed to send reset link.'] }));
      }
    } finally {
      setSendingReset(false);
    }
  };

  const handleSaveChanges = () => {
    setErrors({});

    setProcessing(true);

    updateClientProfile({
      payload: { full_name: fullName, phone },
      avatarFile,
    })
      .then(() => navigate('/profile'))
      .catch((err) => {
        if (err?.response?.status === 401) {
          clearAuthData();
          navigate('/login');
          return;
        }

        const responseErrors = err?.response?.data?.errors;
        if (responseErrors) {
          setErrors(responseErrors);
        } else {
          setErrors({ form: ['Erreur lors de la mise à jour du profil.'] });
        }
      })
      .finally(() => setProcessing(false));
  };

  const handleClearField = (field) => {
    if (field === 'name') setFullName('');
  };

  return (
    <div className="app-shell">
      {/* Main Container */}
      <div className="app-frame">
        {/* Edit Profile Card */}
        <div className={`${styles.editProfileCard} app-card`}>
          
          <Header 
            title="Modifier le profil" 
            showBackButton={true} 
            onBack={goBack}
          />

          {/* Main Content - Scrollable */}
          <div className={`app-content ${styles.scrollContainer}`}>
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageSelected}
                />
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
                {errors.full_name?.[0] && <p className="text-red-400 text-xs mt-1">{errors.full_name[0]}</p>}
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
                      placeholder="(07/06) XX XX XX XX"
                    />
                  </div>
                </div>
                 {errors.phone?.[0] && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={sendingReset}
                className="w-full bg-black/40 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all mt-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm">
                      {sendingReset ? 'Envoi du lien...' : 'Modifier le mot de passe'}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
              {resetStatus && <p className="text-green-400 text-xs mt-2">{resetStatus}</p>}
            </div>

            {/* Save Button */}
            <div className="mt-8">
              {errors.form?.[0] && <p className="text-red-400 text-sm mb-3">{errors.form[0]}</p>}
              <button
                onClick={handleSaveChanges}
                disabled={processing}
                className="w-full bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] font-semibold py-4 rounded-2xl hover:from-[#E5C5A1] hover:to-[#D9B971] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
