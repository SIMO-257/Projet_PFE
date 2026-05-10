import React from 'react';

const AmountDisplay = ({ 
    label = "Montant sélectionné",
    amount = "0,00 DH",
    icon = "wallet",
    gradientFrom = "#5C2A36",
    gradientTo = "#3D1A24",
    className = ""
}) => {
    const getIcon = () => {
        if (icon === 'wallet') {
            return (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
            );
        }
        return null;
    };

    return (
        <div 
            className={`bg-gradient-to-br rounded-2xl p-4 border border-white/10 ${className}`}
            style={{ 
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
        >
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    {getIcon()}
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-0.5">{label}</p>
                    <p className="text-white text-2xl font-bold">{amount}</p>
                </div>
            </div>
        </div>
    );
};

export default AmountDisplay;