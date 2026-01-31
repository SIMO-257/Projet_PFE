import React from 'react';

const SummaryCard = ({ 
    income = 0,
    expense = 0,
    balance = 0,
    currency = 'DH',
    onToggle
}) => {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/80 text-sm">Résumé du mois</h3>
                {onToggle && (
                    <button 
                        onClick={onToggle}
                        className="text-yellow-500 text-xs hover:text-yellow-400"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {/* Income */}
                <div className="bg-green-900/30 rounded-2xl p-3 border border-green-500/20">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-4 4m4-4l4 4"/>
                        </svg>
                    </div>
                    <p className="text-green-400 text-xs mb-1">Reçus</p>
                    <p className="text-white font-semibold text-sm">+{income.toFixed(2)} {currency}</p>
                </div>

                {/* Expense */}
                <div className="bg-red-900/30 rounded-2xl p-3 border border-red-500/20">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20v-16m0 16l-4-4m4 4l4-4"/>
                        </svg>
                    </div>
                    <p className="text-red-400 text-xs mb-1">Dépenses</p>
                    <p className="text-white font-semibold text-sm">-{expense.toFixed(2)} {currency}</p>
                </div>

                {/* Balance */}
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                    </div>
                    <p className="text-white/60 text-xs mb-1">Solde</p>
                    <p className="text-white font-semibold text-sm">{balance.toFixed(2)} {currency}</p>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;