import React from 'react';

const WalletApp = () => {
  // Sample transaction history
  const transactions = [
    { id: 1, merchant: "Amazon", amount: "-29,99 €", date: "Aujourd'hui, 10:24", type: "shopping" },
    { id: 2, merchant: "Rechargement", amount: "+50,00 €", date: "Hier, 14:18", type: "recharge" },
    { id: 3, merchant: "Boulangerie", amount: "-4,50 €", date: "26 jan, 08:45", type: "food" },
    { id: 4, merchant: "Netflix", amount: "-15,99 €", date: "25 jan, 19:30", type: "entertainment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0b0f] to-[#1a0507] p-4 font-sans max-w-md mx-auto">
      
      {/* Status Bar (Mobile) */}
      <div className="flex justify-between items-center mb-6 pt-2 px-1">
        <div className="text-white text-sm font-medium">19:01</div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-[#FF9800] rounded-full"></div>
          <div className="text-white text-sm">•</div>
          <div className="text-white text-sm">•</div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 px-2">
        <h1 className="text-2xl font-bold text-white mb-2">Home</h1>
        <div>
          <p className="text-[#E0E0E0] text-base">Bonjour,</p>
          <p className="text-2xl font-bold text-white">Alexandre</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-[#400106] to-[#260101] rounded-2xl p-5 mb-4 shadow-xl border border-[#5a1a1a]">
        <p className="text-[#F5D9A8] text-sm mb-1">Solde disponible</p>
        <div className="flex items-baseline mb-4">
          <span className="text-4xl font-bold text-white">42,50</span>
          <span className="text-2xl font-bold text-white ml-1">€</span>
        </div>
        
        {/* Virtual Card */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] rounded-xl p-4 border border-[#3D3D3D]">
          <p className="text-[#B0B0B0] text-sm mb-2">Carte virtuelle</p>
          <div className="flex items-center">
            <span className="text-lg font-mono text-white tracking-widest">•••• •••• ••••</span>
            <span className="text-lg font-mono text-white ml-3 font-semibold">7842</span>
            <div className="ml-auto">
              <svg className="w-8 h-8 text-[#D9B991]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Scanner Button */}
        <button className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0C00] rounded-xl p-4 flex flex-col items-center justify-center border border-[#3D3D3D] hover:border-[#FF9800] transition-all active:scale-95">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#400106] to-[#260101] flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Scanner</span>
        </button>
        
        {/* Recharger Button */}
        <button className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0C00] rounded-xl p-4 flex flex-col items-center justify-center border border-[#3D3D3D] hover:border-[#FF9800] transition-all active:scale-95">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d1b00] to-[#1a0f00] flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Recharger</span>
        </button>
        
        {/* Historique Button */}
        <button className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0C00] rounded-xl p-4 flex flex-col items-center justify-center border border-[#3D3D3D] hover:border-[#FF9800] transition-all active:scale-95">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Historique</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-gradient-to-b from-[#0D0C00] to-[#1A1A1A] rounded-2xl p-5 border border-[#3D3D3D] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Dernières transactions</h2>
          <button className="text-[#FF9800] text-sm font-medium">Voir tout →</button>
        </div>
        
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 px-2 hover:bg-[#2D2D2D] rounded-lg transition-colors">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === 'recharge' ? 'bg-gradient-to-br from-[#388E3C] to-[#2E7D32]' :
                  transaction.type === 'shopping' ? 'bg-gradient-to-br from-[#E53935] to-[#C62828]' :
                  transaction.type === 'food' ? 'bg-gradient-to-br from-[#FF9800] to-[#F57C00]' :
                  'bg-gradient-to-br from-[#757575] to-[#616161]'
                }`}>
                  {transaction.type === 'recharge' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : transaction.type === 'shopping' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ) : transaction.type === 'food' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">{transaction.merchant}</h3>
                  <p className="text-[#B0B0B0] text-xs">{transaction.date}</p>
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                transaction.amount.startsWith('+') ? 'text-[#4CAF50]' : 'text-[#E53935]'
              }`}>
                {transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0D0C00] to-[#1A1A1A] border-t border-[#3D3D3D] py-3 px-6 flex justify-around max-w-md mx-auto">
        <button className="flex flex-col items-center">
          <svg className="w-6 h-6 text-[#FF9800] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs text-[#FF9800] font-semibold">Accueil</span>
        </button>
        
        <button className="flex flex-col items-center">
          <svg className="w-6 h-6 text-[#B0B0B0] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-[#B0B0B0]">Transactions</span>
        </button>
        
        <button className="flex flex-col items-center">
          <svg className="w-6 h-6 text-[#B0B0B0] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs text-[#B0B0B0]">Statistiques</span>
        </button>
        
        <button className="flex flex-col items-center">
          <svg className="w-6 h-6 text-[#B0B0B0] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-[#B0B0B0]">Paramètres</span>
        </button>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default WalletApp;