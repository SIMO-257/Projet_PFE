import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Layout/Header';
import BalanceCard from '../Components/Cards/BalanceCard';
import ActionButtonCard from '../Components/Cards/ActionButtonCard';
import BottomNavigation from '../Components/Layout/BottomNavigation';
import TransactionItem from '../Components/Cards/TransactionItem';
import SectionHeader from '../Components/Layout/SectionHeader';
import BalanceCardSkeleton from '../Components/Skeletons/BalanceCardSkeleton';
import TicketHistorySkeleton from '../Components/Skeletons/TicketHistorySkeleton';
import styles from '../Styles/WalletScreen.module.css';
import { useDispatch } from 'react-redux';
import { setGlobalLoading } from '../Redux/Slices/uiSlice';
import { useWallet } from '../hooks/useWallet';

export default function Wallet() {
  const { balance, transactions, isLoading, refreshWallet } = useWallet();
  const navigateHook = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!isLoading) {
      dispatch(setGlobalLoading(false));
    }
  }, [isLoading, dispatch]);

  const handleRecharge = () => {
    navigateHook('/recharge-payment');
  };

  const viewAllTransactions = () => {
    navigateHook('/payment-history');
  };

  const safeBalance = Number.isFinite(balance) ? balance : 0;
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const latestSixTransactions = [...safeTransactions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const mappedTransactions = latestSixTransactions.map(t => ({
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
      <div className="app-shell">
        <div className="app-frame">
          <div className={`${styles.walletCard} app-card relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
            
            <Header 
              title="Portefeuille" 
            />

            <div className="app-content no-scrollbar px-6 pb-24">
              
              {isLoading && balance === undefined ? (
                <BalanceCardSkeleton />
              ) : (
                <BalanceCard 
                  title="Solde disponible"
                  amount={`${safeBalance.toFixed(2)} DH`}
                  gradientFrom="#7A3B47"
                  gradientTo="#5C2A36"
                  showCircles={false}
                />
              )}

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
                    <>
                      <TicketHistorySkeleton />
                      <TicketHistorySkeleton />
                      <TicketHistorySkeleton />
                    </>
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

;
