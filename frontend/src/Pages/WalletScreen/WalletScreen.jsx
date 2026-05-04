import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BalanceCard from '../../Components/Cards/BalanceCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import TransactionItem from '../../Components/Cards/TransactionItem';
import SectionHeader from '../../Components/Layout/SectionHeader';
import styles from '../../Styles/WalletScreen.module.css';
import { useWallet } from '../../hooks/useWallet';

const WalletScreen = () => {
  const { balance, card_last_four, transactions, isLoading, refreshWallet } = useWallet();
  const navigateHook = useNavigate();

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const handleRecharge = () => {
    navigateHook('/payment'); 
  };

  const handleChangeCard = () => {
    navigateHook('/change-card');
  };

  const handleMenuAction = () => {
  };

  const viewAllTransactions = () => {
    navigateHook('/payment-history');
  };

  const safeBalance = Number.isFinite(balance) ? balance : 0;
  const safeCardLastFour = card_last_four || '****';
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const mappedTransactions = safeTransactions.map(t => ({
    id: t.id,
    type: t.type,
    title: t.reference || (t.type === 'recharge' ? 'Rechargement' : 'Achat'),
    date: new Date(t.created_at).toLocaleString('fr-FR', { 
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    }),
    amount: `${t.type === 'recharge' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)} DH`,
    isPositive: t.type === 'recharge',
    icon: t.type === 'recharge' ? 'plus' : 'ticket'
  }));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className={`${styles.walletCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
            
            <Header 
              title="Portefeuille" 
              onMenu={handleMenuAction}
              showMenuButton={true}
            />

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar px-6 pb-24">
              
              <BalanceCard 
                title="Solde disponible"
                amount={`${safeBalance.toFixed(2)} DH`}
                cardType="Carte Virtuelle"
                cardNumber={`**** **** **** ${safeCardLastFour}`}
                gradientFrom="#7A3B47"
                gradientTo="#5C2A36"
                showCircles={false}
              />

              <div className="flex justify-end -mt-4 mb-4 pr-2">
                <button 
                  onClick={handleChangeCard}
                  className="text-yellow-500 text-xs font-medium hover:text-yellow-400 flex items-center space-x-1"
                >
                  <span>Changer de carte</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

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

              <div className="mb-6">
                <SectionHeader 
                  title="Transactions récentes"
                  buttonText="Tout voir"
                  onButtonClick={viewAllTransactions}
                />

                <div className="space-y-3">
                  {isLoading && transactions.length === 0 ? (
                    <div className="text-center text-white/50 py-4">Chargement...</div>
                  ) : mappedTransactions.length > 0 ? (
                    mappedTransactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        type={transaction.type}
                        title={transaction.title}
                        date={transaction.date}
                        amount={transaction.amount}
                        isPositive={transaction.isPositive}
                        icon={transaction.icon}
                      />
                    ))
                  ) : (
                    <div className="text-center text-white/50 py-4">Aucune transaction récente</div>
                  )}
                </div>
              </div>
            </div>

            <BottomNavigation />
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletScreen;
