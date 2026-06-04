import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Layout/Header';
import BalanceCard from '../../Components/Cards/BalanceCard';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import TransactionItem from '../../Components/Cards/TransactionItem';
import SectionHeader from '../../Components/Layout/SectionHeader';
import BalanceCardSkeleton from '../../Components/Skeletons/BalanceCardSkeleton';
import TicketHistorySkeleton from '../../Components/Skeletons/TicketHistorySkeleton';
import styles from '../../Styles/WalletScreen.module.css';
import { useDispatch } from 'react-redux';
import { setGlobalLoading } from '../../Redux/Slices/uiSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { useWallet } from '../../hooks/useWallet';
import usePinGuard from '../../hooks/usePinGuard';

export default function WalletPage() {
  const { t, language, formatReference } = useTranslation();
  const { balance, transactions, isLoading, refreshWallet } = useWallet();
  const navigateHook = useNavigate();
  const dispatch = useDispatch();
  const { checking: pinChecking, isPinEnabled } = usePinGuard();

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

  const dateLocale = language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR';

  const mappedTransactions = latestSixTransactions.map(trx => ({
    id: trx.id,
    type: trx.type,
    title: formatReference(trx.reference) || (trx.type === 'recharge' ? t('recharge') : t('purchase')),
    date: new Date(trx.created_at).toLocaleString(dateLocale, { 
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    }),
    amount: `${trx.type === 'recharge' ? '+' : '-'}${parseFloat(trx.amount).toFixed(2)} ${t('currency')}`,
    isPositive: trx.type === 'recharge',
    icon: trx.type === 'recharge' ? 'plus' : 'ticket'
  }));

  return (
    <>
      <div className="app-shell">
        <div className="app-frame">
          <div className={`${styles.walletCard} app-card relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
            
            <div className="app-content no-scrollbar px-6 pb-24 pt-6">
              
              {pinChecking ? (
                <BalanceCardSkeleton />
              ) : isLoading && balance === undefined ? (
                <BalanceCardSkeleton />
              ) : (
                <BalanceCard 
                  title={t('available_balance')}
                  amount={`${safeBalance.toFixed(2)} ${t('currency')}`}
                  gradientFrom="#8B4049"
                  gradientTo="#5C2A2E"
                  showCircles={false}
                />
              )}

              {isPinEnabled ? (
                <div className="mb-6 p-4 rounded-2xl bg-black/30 border border-[#f5d579]/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5d579]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#f5d579]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-white/40 text-xs flex-1">Recharge verrouillée — désactivez le PIN dans Sécurité</p>
                </div>
              ) : (
                <button
                  onClick={handleRecharge}
                  className="w-full rounded-2xl p-6 mb-6 shadow-xl shadow-[#f5d579]/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 bg-gradient-to-r from-[#f5d579] to-[#d4af37] hover:from-[#f5d579] hover:to-[#d4af37] hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[#260101]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#260101]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[#260101] font-semibold text-lg">{t('recharge_wallet')}</h3>
                    </div>
                  </div>
                </button>
              )}

              <div className="mb-6">
                <SectionHeader 
                  title={t('recent_transactions')}
                  buttonText={t('view_all')}
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
                    <div className="text-center text-white/50 py-4">{t('no_recent_transactions')}</div>
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
