import React from 'react';

const TransactionDetailsCard = ({
    transactionNumber,
    method,
    transactionDateTime,
    paymentMethodFull,
    receiptEmail,
    t = (key) => key,
    className = ""
}) => {
    const getMethodIcon = () => {
        const normalizedMethod = (method || '').toLowerCase();
        if (normalizedMethod === 'nfc') {
            return (
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                </svg>
            );
        }
        if (normalizedMethod === 'qr') {
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
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{t('transaction_number')}</span>
                    <span className="text-white font-mono font-medium text-sm">{transactionNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{t('payment_method')}</span>
                    <div className="flex items-center space-x-2">
                        {getMethodIcon()}
                        <span className="text-white font-medium">{method}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{t('date_and_time')}</span>
                    <span className="text-white font-mono font-medium text-sm">{transactionDateTime}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{t('payment_method_full')}</span>
                    <span className="text-white font-medium text-sm">{paymentMethodFull}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{t('client_label')}</span>
                    <span className="text-white font-mono font-medium text-sm">{receiptEmail}</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsCard;