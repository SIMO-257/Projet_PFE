import React from 'react';

const TransactionDetailsCard = ({ 
    transactionId = "TXN-2026012715053421",
    method = "NFC",
    terminal = "TERM-0542",
    operator = "Casablanca Tramway",
    validity = "15 / 5 minutes",
    className = ""
}) => {
    const getMethodIcon = () => {
        if (method === 'NFC') {
            return (
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                </svg>
            );
        }
        if (method === 'QR') {
            return (
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                </svg>
            );
        }
        return null;
    };

    return (
        <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 ${className}`}>
            <div className="space-y-4">
                {/* ID Transaction */}
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">ID Transaction</span>
                    <span className="text-white font-mono font-medium text-sm">{transactionId}</span>
                </div>
                
                {/* Méthode */}
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Méthode</span>
                    <div className="flex items-center space-x-2">
                        {getMethodIcon()}
                        <span className="text-white font-medium">{method}</span>
                    </div>
                </div>
                
                {/* Terminal */}
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Terminal</span>
                    <span className="text-white font-mono font-medium text-sm">{terminal}</span>
                </div>
                
                {/* Opérateur */}
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Opérateur</span>
                    <span className="text-white font-medium text-sm">{operator}</span>
                </div>
                
                {/* Validité */}
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Validité</span>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-white font-medium text-sm">{validity}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsCard;