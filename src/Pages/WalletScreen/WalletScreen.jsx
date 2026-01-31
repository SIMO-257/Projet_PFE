import React, { useState } from 'react';
import Header from '../../components/Layout/Header';
import BalanceCard from '../../components/Cards/BalanceCard';
import ActionButtonCard from '../../components/Cards/ActionButtonCard';
import BottomNavigation from '../../components/Layout/BottomNavigation';
import TransactionItem from '../../components/Cards/TransactionItem';
import SectionHeader from '../../components/Layout/SectionHeader';
import styles from '../../styles/WalletScreen.module.css';

const WalletScreen = () => {
  const [activeTab, setActiveTab] = useState('wallet');

  const navigate = (section) => {
    setActiveTab(section);
    console.log('Navigating to:', section);
  };

  const handleRecharge = () => {
    console.log('Recharge wallet');
  };

  const handleMenuAction = () => {
    console.log('Menu action');
  };

  const viewAllTransactions = () => {
    console.log('View all transactions');
  };

  // Sample transactions data
  const transactions = [
    {
      id: 1,
      type: 'recharge',
      title: 'Rechargement',
      date: "Aujourd'hui, 14:32",
      amount: '+50,00 €',
      isPositive: true,
      icon: 'plus'
    },
    {
      id: 2,
      type: 'ticket',
      title: 'Trajet Premium',
      date: 'Hier, 18:45',
      amount: '-8,50 €',
      isPositive: false,
      icon: 'ticket'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto">
          {/* Wallet Card */}
          <div className={`${styles.walletCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
            
            {/* Header */}
            <Header 
              title="Portefeuille" 
              onMenu={handleMenuAction}
              showMenuButton={true}
            />

            {/* Main Content - Scrollable */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar px-6 pb-24">
              
              {/* Balance Card */}
              <BalanceCard 
                title="Solde disponible"
                amount="245 DH"
                cardType="Carte Virtuelle"
                cardNumber="**** 4729"
                gradientFrom="#7A3B47"
                gradientTo="#5C2A36"
                showCircles={false}
              />

              {/* Recharge Button */}
              <ActionButtonCard
                variant="validation"
                icon={
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                }
                label="Recharger le portefeuille"
                onClick={handleRecharge}
                className="mb-6 shadow-lg"
                showArrow={false}
              />

              {/* Transactions Section */}
              <div className="mb-6">
                <SectionHeader 
                  title="Transactions récentes"
                  buttonText="Tout voir"
                  onButtonClick={viewAllTransactions}
                />

                {/* Transaction List */}
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      type={transaction.type}
                      title={transaction.title}
                      date={transaction.date}
                      amount={transaction.amount}
                      isPositive={transaction.isPositive}
                      icon={transaction.icon}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation 
              activeTab={activeTab}
              onNavigate={navigate}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletScreen;