import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import BalanceCard from '../components/Cards/BalanceCard';
import ActionButtonCard from '../components/Cards/ActionButtonCard';
import NotificationButton from '../components/UI/NotificationButton';
import BottomNavigation from '../components/Layout/BottomNavigation';
import styles from '../styles/HomeScreen.module.css';

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navigate = (section) => {
    setActiveTab(section);
    console.log('Navigating to:', section);
  };

  const handleAction = (action) => {
    console.log('Action:', action);
    switch(action) {
      case 'notifications':
        alert('Notifications clicked!');
        break;
      case 'scanner':
        alert('Scanner clicked!');
        break;
      case 'recharge':
        alert('Recharger clicked!');
        break;
      case 'history':
        alert('Historique clicked!');
        break;
    }
  };

  const actionButtons = [
    {
      id: 'scanner',
      label: 'Scanner',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
        </svg>
      )
    },
    {
      id: 'recharge',
      label: 'Recharger',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      )
    },
    {
      id: 'history',
      label: 'Historique',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Home Card */}
        <div className={`${styles.homeCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
          bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
          
          {/* Golden Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-t-3xl"></div>
          
          <Header title="Home" />

          {/* Main Content - NO SCROLLBAR VISIBLE */}
          <div className={`max-h-[calc(100vh-200px)] overflow-y-auto ${styles.hideScrollbar} px-6 pb-24`}>
            {/* Welcome Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className={styles.welcomeText}>Bonjour,</p>
                  <h2 className={styles.userName}>Alexandre</h2>
                </div>
                <NotificationButton 
                  onClick={() => handleAction('notifications')}
                  hasNotifications={true}
                />
              </div>
            </div>

            {/* Balance Card 1 - Purple/Burgundy */}
            <BalanceCard 
              title="Solde disponible"
              amount="42,50 €"
              cardType="Carte virtuelle"
              cardNumber="**** 7842"
              gradientFrom="#7A3B47"
              gradientTo="#5C2A36"
              circlesPosition="right"
            />

            {/* Action Buttons */}
            <div className={styles.actionButtonsGrid}>
              {actionButtons.map((button) => (
                <ActionButtonCard
                  key={button.id}
                  icon={button.icon}
                  label={button.label}
                  onClick={() => handleAction(button.id)}
                />
              ))}
            </div>

            {/* Balance Card 2 - Brown/Gold */}
            <BalanceCard 
              title="Solde disponible"
              amount="42,50 €"
              cardType="Carte virtuelle"
              cardNumber="**** 7842"
              gradientFrom="#8B6914"
              gradientTo="#6B5110"
              circlesPosition="left"
            />
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation 
            activeTab={activeTab}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;