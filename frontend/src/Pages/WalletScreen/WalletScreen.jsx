import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BalanceCard from '../../Components/Cards/BalanceCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import TransactionItem from '../../Components/Cards/TransactionItem';
import SectionHeader from '../../Components/Layout/SectionHeader';
import styles from '../../Styles/WalletScreen.module.css';
import { useWallet } from '../../hooks/useWallet';
import { confirmRecharge } from '../../services/clientService';
import { useTranslation } from '../../hooks/useTranslation';

const WalletScreen = () => {
  const { balance, card_last_four, transactions, isLoading, refreshWallet } = useWallet();
  const navigateHook = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || null);

  useEffect(() => {
    const verifyAndRefresh = async () => {
      const piId = location.state?.paymentIntentId;
      
      if (piId) {
        setVerifyingPayment(true);
        try {
          await confirmRecharge({ paymentIntentId: piId });
        } catch (err) {
          console.error("[Wallet] Verification error:", err);
        } finally {
          setVerifyingPayment(false);
          navigateHook(location.pathname, { replace: true, state: {} });
        }
      }
      
      refreshWallet();
    };

    verifyAndRefresh();
  }, [refreshWallet, location.state, location.pathname, navigateHook]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRecharge = () => {
    navigateHook('/recharge-payment');
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
    title: t.reference || (t.type === 'recharge' ? t('recharge') : t('buy')),
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
              title={t('wallet')} 
              onMenu={handleMenuAction}
              showMenuButton={true}
            />

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar px-6 pb-24">
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 text-xs font-bold text-center animate-bounce">
                  {successMessage}
                </div>
              )}

              {verifyingPayment && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-xs font-bold text-center flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mise à jour du solde en cours...</span>
                </div>
              )}

              <BalanceCard 
                title={t('wallet')}
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
                  <span>{t('change_card')}</span>
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
                label={t('recharge_wallet')}
                onClick={handleRecharge}
                className="mb-6 shadow-lg"
                showArrow={false}
              />

              <div className="mb-6">
                <SectionHeader 
                  title={t('last_activity')}
                  buttonText={t('see_all')}
                  onButtonClick={viewAllTransactions}
                />

                <div className="space-y-3">
                  {isLoading && transactions.length === 0 ? (
                    <div className="text-center text-white/50 py-4">Loading...</div>
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
                    <div className="text-center text-white/50 py-4">No recent transactions</div>
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
