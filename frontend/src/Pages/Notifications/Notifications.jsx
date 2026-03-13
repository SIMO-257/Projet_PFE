import React from 'react';
import '../../Styles/Notifications.module.css';

export default  function Notifications (){
  const notifications = [
    {
      id: 1,
      type: 'error',
      icon: '🔴',
      title: 'Aujourd\'hui',
      category: 'Connexion',
      time: '9h 45',
      mainText: 'Connexion depuis un nouvel appareil détecté',
      subText: 'Une connexion à votre compte a été détectée depuis un nouvel appareil.',
      buttons: [
        { text: 'Sécuriser mon compte', type: 'danger' },
        { text: 'C\'était moi', type: 'secondary' }
      ]
    },
    {
      id: 2,
      type: 'info',
      icon: '⏱️',
      title: 'Passe',
      category: 'Passe',
      time: '14h 22',
      mainText: 'Votre Pass expire dans 10 jours',
      subText: 'Votre billet de tramway expire le 15/04. Pensez à le recharger à temps.',
      buttons: [
        { text: 'Recharger maintenant', type: 'secondary' },
        { text: 'Voir le ticket', type: 'link' }
      ]
    },
    {
      id: 3,
      type: 'promo',
      icon: '🎉',
      title: 'Promotions',
      category: 'Promotions',
      time: '12 j',
      mainText: 'Offre spéciale : 20% sur les pass mensuels',
      subText: 'Profitez de cette offre limitée en temps de commander votre pass mensuel.',
      banner: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        logo: 'PASS',
        buttonText: 'Profiter de l\'offre'
      }
    },
    {
      id: 4,
      type: 'success',
      icon: '✅',
      title: 'Trajet',
      category: 'Trajet',
      time: '3 sem',
      mainText: 'Validation réussie - Bon voyage!',
      subText: 'Votre billet a été validé avec succès. Bon trajet et pensez à composter.',
      buttons: [
        { text: 'Voir le trajet', type: 'link' }
      ]
    },
    {
      id: 5,
      type: 'info',
      icon: 'ℹ️',
      title: 'Info',
      category: 'Service',
      time: 'Il y a 1 mois',
      mainText: 'Entretien de la ligne A ce week-end',
      subText: 'Des travaux de maintenance sont prévus samedi et dimanche. Bus de remplacement disponible.',
      buttons: [
        { text: 'Afficher les détails', type: 'link' }
      ]
    },
    {
      id: 6,
      type: 'warning',
      icon: '💳',
      title: 'Paiement',
      category: 'Paiement',
      time: 'Il y a 2 mois',
      mainText: 'Carte de paiement expirée',
      subText: 'Votre carte bancaire se terminant par 2345 a expiré. Veuillez la mettre à jour.',
      buttons: [
        { text: 'Carte enregistré', type: 'disabled' }
      ]
    },
    {
      id: 7,
      type: 'info',
      icon: '📋',
      title: 'Commandes',
      category: 'Commandes',
      time: '',
      mainText: 'Nouvelle station ouverte: Ah Chock',
      subText: 'La nouvelle station Ah Chock est maintenant ouverte sur la ligne rouge.',
      footer: 'Il y a 3 mois',
      bottomButton: 'Charger plus'
    }
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #4d1a1a, #3d0a0a)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between" style={{ backgroundColor: '#3d0a0a', borderBottom: '1px solid #5d1a1a' }}>
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Notifications</h1>
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-4 space-y-4">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification }) => {
  const categoryColors = {
    'Connexion': { bg: '#7f1d1d', text: '#fca5a5' },
    'Passe': { bg: '#422006', text: '#fbbf24' },
    'Promotions': { bg: '#581c87', text: '#c084fc' },
    'Trajet': { bg: '#064e3b', text: '#6ee7b7' },
    'Service': { bg: '#1e3a8a', text: '#93c5fd' },
    'Paiement': { bg: '#713f12', text: '#fbbf24' },
    'Commandes': { bg: '#1e3a8a', text: '#93c5fd' }
  };

  const categoryStyle = categoryColors[notification.category] || { bg: '#374151', text: '#9ca3af' };

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#2d0505', border: '1px solid #4d1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{notification.icon}</span>
          <span className="text-sm font-medium text-gray-400">{notification.title}</span>
        </div>
        <span className="text-xs text-gray-500">{notification.time}</span>
      </div>

      {/* Category Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3" style={{ backgroundColor: categoryStyle.bg }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryStyle.text }}></div>
        <span className="text-xs font-medium" style={{ color: categoryStyle.text }}>{notification.category}</span>
      </div>

      {/* Main Content */}
      <h3 className="font-semibold text-base mb-2">{notification.mainText}</h3>
      <p className="text-sm text-gray-400 mb-4">{notification.subText}</p>

      {/* Banner (for promotional notifications) */}
      {notification.banner && (
        <div 
          className="rounded-lg p-6 mb-4 text-center"
          style={{ background: notification.banner.gradient }}
        >
          <div className="text-5xl font-black mb-3 tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
            {notification.banner.logo}
          </div>
          <button className="w-full bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-900 font-semibold py-3 rounded-lg transition-all">
            {notification.banner.buttonText}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {notification.buttons && (
        <div className="flex gap-2">
          {notification.buttons.map((button, index) => (
            <ActionButton key={index} button={button} />
          ))}
        </div>
      )}

      {/* Footer */}
      {notification.footer && (
        <div className="text-center text-xs text-gray-500 mt-4">
          {notification.footer}
        </div>
      )}

      {/* Bottom Button */}
      {notification.bottomButton && (
        <div className="mt-4">
          <button className="w-full py-2.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            {notification.bottomButton}
          </button>
        </div>
      )}
    </div>
  );
};

// Action Button Component
const ActionButton = ({ button }) => {
  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white font-medium',
    link: 'bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 font-medium',
    disabled: 'bg-gray-800 text-gray-600 cursor-not-allowed'
  };

  return (
    <button 
      className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${buttonStyles[button.type]}`}
      disabled={button.type === 'disabled'}
    >
      {button.text}
    </button>
  );
};
