import React from 'react';

const PaymentSummary = ({ 
    card = 'Visa****6342',
    date = '05/10/2026',
    totalAmount = '0,00 DH',
    currency = 'DH',
    className = ""
}) => {
    return (
        <div className={`bg-white/5 rounded-2xl p-4 border border-white/10 ${className}`}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Carte:</span>
                    <span className="text-white text-sm font-medium">{card}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Date:</span>
                    <span className="text-white text-sm">{date}</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total à payer:</span>
                    <span className="text-white text-xl font-bold">{totalAmount}</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;