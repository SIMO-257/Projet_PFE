import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import ProfilInfo from '../../Components/Cards/ProfilInfo';
import ProfileOpt from '../../Components/Cards/ProfileOpt';
import styles from '../../Styles/ProfileScreen.module.css';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchClientProfile,
} from '../../services/clientService';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const navigateHook = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchClientProfile()
      .then((res) => setProfile(res ?? null))
      .catch(() => {
        setProfile(null);
      });
  }, []);

  const handleEditProfile = () => {
    navigateHook('/edit-profile', { state: { profile } });
  };

  const handleSettings = () => {
    navigateHook("/settings");
  };

  const handleSupport = () => {
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result && result.meta && result.meta.requestStatus === 'fulfilled') {
      navigateHook('/login');
    } else {
      navigateHook('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Profile Card */}
        <div className={styles.profileCard}>
          
          <Header title="Mon Profil" />

          {/* Main Content - Scrollable */}
          <div className={styles.scrollContainer}>
            
            {/* Profile Info Card */}
            <div className="bg-gradient-to-br from-[#5C2A36] to-[#3D1A24] rounded-3xl p-6 mb-6 border border-white/10 shadow-xl">
              {/* Profile Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full border-4 border-yellow-500 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-14 h-14 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  {/* Premium Badge */}
                  <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-4 border-[#3D1A24] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#400106]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Name & Status */}
              <div className="text-center mb-6">
                <h2 className="text-white text-2xl font-bold mb-1">{profile?.name ?? '—'}</h2>
                <p className="text-yellow-500 text-sm font-medium">Membre Premium</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {/* Email */}
                <ProfilInfo
                  label="Email"
                  value={profile?.email ?? '—'}
                  truncate={true}
                  icon={
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  }
                />

                {/* Phone */}
                <ProfilInfo
                  label="Téléphone"
                  value={profile?.phone ?? '—'}
                  icon={
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  }
                />

                {/* Member Since */}
                <ProfilInfo
                  label="Membre depuis"
                  value={profile?.created_at ?? '—'}
                  icon={
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={handleEditProfile}
                className="w-full mt-6 bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] text-white font-semibold py-3 rounded-2xl hover:from-[#9B5059] hover:to-[#6C3A3E] transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                <span>Modifier le profil</span>
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-3 mb-6">
              {/* Settings */}
              <ProfileOpt
                label="Paramètres"
                onClick={handleSettings}
                icon={
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              {/* Help & Support */}
              <ProfileOpt
                label="Aide & Support"
                onClick={handleSupport}
                icon={
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-red-400 font-medium text-sm">Déconnexion</span>
                  </div>
                  <svg className="w-5 h-5 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
