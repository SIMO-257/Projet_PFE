import React from 'react';

const TransactionItem = ({ 
    type = 'recharge',
    title = 'Transaction',
    subtitle = '',
    date = 'Date',
    time = '',
    amount = '+0,00 €',
    isPositive = true,
    icon = 'plus',
    showTime = false,
    variant = 'default' // 'default' | 'detailed'
}) => {
    const getIcon = () => {
        if (icon === 'plus') {
            return (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-4 4m4-4l4 4"/>
                </svg>
            );
        } else if (icon === 'ticket') {
            return (
                <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/>
                </svg>
            );
        }
        return null;
    };

    const bgColor = isPositive ? 'bg-green-500/20' : 'bg-red-500/20';
    const textColor = isPositive ? 'text-green-400' : 'text-red-400';

    if (variant === 'detailed') {
        return (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/10">
                <div className="flex items-center space-x-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                        {getIcon()}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                        <h5 className="text-white font-medium text-sm mb-0.5 truncate">
                            {title}
                        </h5>
                        <p className="text-white/50 text-xs truncate">
                            {subtitle}
                        </p>
                        {showTime && time && (
                            <p className="text-white/40 text-xs mt-0.5">
                                {time}
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className={`text-right flex-shrink-0 ${textColor}`}>
                        <p className="font-semibold text-base">
                            {amount}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant (WalletScreen)
    return (
        <div className="bg-[#1a1a1a]/50 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isPositive ? 'bg-yellow-500/20' : 'bg-white/10'
                }`}>
                    {getIcon()}
                </div>

                {/* Transaction Info */}
                <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">
                        {title}
                    </h4>
                    <p className="text-white/50 text-xs">
                        {date}
                    </p>
                </div>

                {/* Amount */}
                <div className={`text-lg font-semibold ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                    {amount}
                </div>
            </div>
        </div>
    );
};

export default TransactionItem;
