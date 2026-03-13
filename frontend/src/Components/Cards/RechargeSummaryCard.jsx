import React from 'react';

const RechargeSummaryCard = ({ 
    amount = "0,00 DH",
    rechargeAmount = "0,00 DH",
    timestamp = "crédité le 27 Jan. 2026, 14:35",
    currency = "DH",
    className = ""
}) => {
    return (
        <div className={`bg-gradient-to-br from-[#5C2A36] to-[#3D1A24] rounded-2xl p-6 border border-white/10 ${className}`}>
            {/* New Balance */}
            <div className="mb-4">
                <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Nouveau solde</p>
                <h2 className="text-white text-4xl font-bold mb-1">{amount}</h2>
            </div>

            {/* Recharge Amount */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-4 4m4-4l4 4"/>
                    </svg>
                    <span className="text-green-400 text-lg font-semibold">+ {rechargeAmount}</span>
                </div>
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
            </div>

            {/* Timestamp */}
            <p className="text-white/40 text-xs mt-3">{timestamp}</p>
        </div>
    );
};

export default RechargeSummaryCard;