import React, { useState } from 'react';
import Header from '../../Components/Layout/Header';
import FilterTabs from '../../Components/UI/FilterTabs';
import SummaryCard from '../../Components/Cards/SummaryCard';
import TransactionGroup from '../../Components/Layout/TransactionGroup';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import styles from '../../Styles/TransactionHistoryScreen.module.css';

const TransactionHistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState('Tous');

  const goBack = () => {
    console.log('Going back...');
  };

  const handleMenuAction = () => {
    console.log('Menu action');
  };

  const refreshTransactions = () => {
    console.log('Refreshing transactions...');
  };

  const toggleSummary = () => {
    console.log('Toggle summary view...');
  };

  // Filter options
  const filters = ['Tous', 'Reçus', 'Dépenses'];

  // Sample transactions grouped by date
  const transactionsByDate = {
    "Aujourd'hui": [
      {
        id: 1,
        type: 'expense',
        title: 'Billet Unitaire',
        subtitle: 'Casa Voyageurs',
        time: '14:32',
        amount: '-8,00 DH',
        isPositive: false
      },
      {
        id: 2,
        type: 'income',
        title: 'Rechargement',
        subtitle: 'Carte ****4729',
        time: '09:15',
        amount: '+50,00 DH',
        isPositive: true
      }
    ],
    "Hier": [
      {
        id: 3,
        type: 'expense',
        title: 'Billet 10 trajets',
        subtitle: 'Forfait illimité',
        time: '18:45',
        amount: '-30,00 DH',
        isPositive: false
      },
      {
        id: 4,
        type: 'expense',
        title: 'Billet Unitaire',
        subtitle: 'Aïn Diab',
        time: '08:20',
        amount: '-8,00 DH',
        isPositive: false
      }
    ],
    "23 Janvier 2026": [
      {
        id: 5,
        type: 'income',
        title: 'Rechargement',
        subtitle: 'Carte ****4729',
        time: '16:22',
        amount: '+100,00 €',
        isPositive: true
      },
      {
        id: 6,
        type: 'expense',
        title: 'Abonnement Mensuel',
        subtitle: 'Valable 30 jours',
        time: '16:25',
        amount: '-75,00 DH',
        isPositive: false
      }
    ],
    "20 Janvier 2026": [
      {
        id: 7,
        type: 'income',
        title: 'Rechargement',
        subtitle: 'Apple Pay',
        time: '12:10',
        amount: '+100,00 DH',
        isPositive: true
      },
      {
        id: 8,
        type: 'expense',
        title: 'Billet 10 trajets',
        subtitle: 'Forfait illimité',
        time: '12:15',
        amount: '-18,00 DH',
        isPositive: false
      }
    ]
  };

  // Calculate summary
  const calculateSummary = () => {
    let totalIncome = 0;
    let totalExpense = 0;

    Object.values(transactionsByDate).forEach(transactions => {
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount.replace(/[^0-9.-]/g, ''));
        if (transaction.isPositive) {
          totalIncome += amount;
        } else {
          totalExpense += Math.abs(amount);
        }
      });
    });

    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  };

  const summary = calculateSummary();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto">
          {/* Transaction History Card */}
          <div className={`${styles.historyCard} relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm`}>
            
            {/* Header */}
            <Header 
              title="Historique des transactions"
              onBack={goBack}
              showBackButton={true}
              onMenu={handleMenuAction}
              showMenuButton={true}
            />

            {/* Filter Tabs */}
            <div className="px-6 pb-4">
              <FilterTabs 
                tabs={filters}
                activeTab={activeFilter}
                onTabChange={setActiveFilter}
              />
            </div>

            {/* Main Content - Scrollable */}
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar px-6 pb-6">
              
              {/* Summary Card */}
              <SummaryCard 
                income={summary.totalIncome}
                expense={summary.totalExpense}
                balance={summary.balance}
                currency="DH"
                onToggle={toggleSummary}
              />

              {/* Transactions by Date */}
              {Object.entries(transactionsByDate).map(([date, transactions]) => (
                <TransactionGroup
                  key={date}
                  date={date}
                  transactions={transactions}
                />
              ))}

              {/* Refresh Button */}
              <ActionButtonCard
                variant="default"
                icon={
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                }
                label="Actualiser"
                onClick={refreshTransactions}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 justify-center"
              />

              {/* Footer Info */}
              <p className="text-center text-white/30 text-xs mt-6">
                Affichage des 30 derniers jours
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionHistoryScreen;