import React, { useState } from 'react';
import styles from '../Styles/OfflineMode.module.css';


export default function OfflineMode () {
  const [lastSync, setLastSync] = useState('il y a 5 minutes');

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: 'linear-gradient(to bottom, #4d1a1a, #3d0a0a)' }}>
      {/* Mode hors ligne banner */}
      <div className="px-4 pt-4">
        <div className="bg-orange-500 px-4 py-2.5 rounded-t-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Mode hors ligne</span>
        </div>

        {/* Main offline card */}
        <div className="rounded-b-lg p-6" style={{ background: 'linear-gradient(to bottom, #3d0a0a, #2d0505)' }}>
          {/* Status icon and message */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`${styles.dashedCircle} w-24 h-24 rounded-full border-4 border-dashed border-orange-400 flex items-center justify-center mb-4`}>
              <span className="text-5xl">?</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Mode hors ligne activé</h2>
            
            <p className="text-gray-300 mb-1">Vous n'êtes pas connecté à Internet.</p>
            <p className="text-gray-300 mb-4">Certaines fonctionnalités sont limitées.</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Dernière synchro: {lastSync}</span>
            </div>
          </div>

          {/* Retry button */}
          <button className="w-full bg-amber-200 hover:bg-amber-300 text-gray-900 font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Réessayer la connexion</span>
          </button>

          {/* Disponible hors ligne section */}
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-lg">Disponible hors ligne</h3>
            </div>

            {/* Ticket card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-4 border border-green-500 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-green-400 text-xs font-medium mb-1">Dernier billet</div>
                  <div className="font-bold text-lg">Ticket Unitaire</div>
                </div>
                <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded">Valide</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Valide jusqu'à 16:45</span>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <div className={styles.qrCode}>
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.qrPixel} ${
                        [0,1,2,3,4,5,6,8,14,16,20,22,24,30,32,34,36,38,40,42,44,46,48,50,52,54,56,62,63,9,10,11,12,13,15,17,18,19,21,23,25,26,27,28,29,31,33,35,37,39,41,43,45,47,49,51,53,55,57,58,59,60,61].includes(i)
                          ? 'bg-black'
                          : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button className="w-full bg-amber-200 hover:bg-amber-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors">
                Utiliser ce billet
              </button>
            </div>

            {/* Fonctionnalités disponibles */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Fonctionnalités disponibles</span>
              </h4>
              
              <FeatureItem
                icon={<WalletIcon />}
                text="Voir les billets sauvegardés"
                available={true}
              />
              
              <FeatureItem
                icon={<HistoryIcon />}
                text="Consulter l'historique"
                available={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Non disponible hors ligne section */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-4 text-red-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="font-semibold">Non disponible hors ligne</h3>
        </div>
        
        <div className="space-y-2">
          <DisabledFeatureItem
            icon={<ShoppingIcon />}
            text="Acheter des billets"
            subtitle="Connexion requise"
          />
          <DisabledFeatureItem
            icon={<RechargeIcon />}
            text="Recharger le solde"
            subtitle="Connexion requise"
          />
          <DisabledFeatureItem
            icon={<ValidateIcon />}
            text="Valider un nouveau billet"
            subtitle="Connexion requise"
          />
          <DisabledFeatureItem
            icon={<SearchIcon />}
            text="Recherche de trajets"
            subtitle="Voir des itinéraires et horaires"
          />
          <DisabledFeatureItem
            icon={<StarIcon />}
            text="Services premium"
            subtitle="Réservez votre place"
          />
          <DisabledFeatureItem
            icon={<ProfileIcon />}
            text="Modifier le profil"
            subtitle="Gérer les informations du compte"
          />
        </div>
      </div>

      {/* Tentative de reconnexion */}
      <div className="mx-4 mt-6 bg-blue-900 bg-opacity-40 rounded-lg p-4 border border-blue-800">
        <div className="flex items-start gap-3">
          <svg className={`w-6 h-6 text-blue-400 ${styles.spin}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="flex-1">
            <div className="font-semibold mb-1">Tentative de reconnexion automatique...</div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Dernière tentative: il y a 30 secondes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils section */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="font-semibold">Conseils</h3>
        </div>
        
        <div className="space-y-3">
          <TipItem text="Achetez des billets avant de partir pour les utiliser hors ligne" />
          <TipItem text="Les QR codes restent valides même sans connexion" />
          <TipItem text="Votre historique reste accessible hors ligne" />
        </div>
      </div>

      {/* Footer status */}
      <div className="fixed bottom-0 left-0 right-0 border-t py-3" style={{ backgroundColor: '#3d0a0a', borderColor: '#5d1a1a' }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Mode hors ligne</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">Dernière synchro: {lastSync}</div>
        </div>
      </div>
    </div>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text, available }) => (
  <div className="flex items-center justify-between py-3 px-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
    {available && (
      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )}
  </div>
);

// Disabled Feature Item Component
const DisabledFeatureItem = ({ icon, text, subtitle }) => (
  <div className="flex items-center justify-between py-3 px-4 bg-gray-800 bg-opacity-40 rounded-lg opacity-50">
    <div className="flex items-center gap-3">
      <div className="text-gray-600">{icon}</div>
      <div>
        <div className="text-sm text-gray-400">{text}</div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>
    </div>
    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  </div>
);

// Tip Item Component
const TipItem = ({ text }) => (
  <div className="flex items-start gap-3 py-3 px-4 bg-gray-800 rounded-lg">
    <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-gray-300">{text}</p>
  </div>
);

// Icon Components
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShoppingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const RechargeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ValidateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
