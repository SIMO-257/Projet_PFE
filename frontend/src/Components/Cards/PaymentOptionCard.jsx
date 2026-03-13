import React from 'react';

const PaymentOptionCard = ({ 
    title,
    subtitle,
    description,
    isSelected = false,
    onClick,
    icon,
    children,
    showExpressBadge = false,
    variant = "default", // 'default' | 'email' | 'paypal'
    rightIcon // For email variant
}) => {
    const getContent = () => {
        if (variant === 'email') {
            return (
                <div className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        isSelected ? 'border-green-500' : 'border-white/30'
                    }`}>
                        {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                    </div>
                    <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{title}</span>
                            {rightIcon}
                        </div>
                        {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}
                        {description && <p className="text-white/40 text-xs mt-2">{description}</p>}
                    </div>
                </div>
            );
        }

        if (variant === 'paypal') {
            return (
                <>
                    <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            isSelected ? 'border-green-500' : 'border-white/30'
                        }`}>
                            {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    {icon}
                                    <span className="text-white font-medium text-sm">{title}</span>
                                </div>
                                {showExpressBadge && (
                                    <span className="text-yellow-500 text-xs">+ Paiement express</span>
                                )}
                            </div>
                            {subtitle && <p className="text-white/50 text-xs mb-1">{subtitle}</p>}
                            {description && <p className="text-white/40 text-xs mt-2">{description}</p>}
                        </div>
                    </div>
                    {children}
                </>
            );
        }

        // Default variant (card)
        return (
            <>
                <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-green-500' : 'border-white/30'
                    }`}>
                        {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                        {icon}
                        <span className="text-white font-medium text-sm">{title}</span>
                    </div>
                </div>
                {children}
            </>
        );
    };

    return (
        <div className={`rounded-2xl p-4 border-2 transition-all ${
            isSelected 
                ? 'bg-[#0a2f1a] border-green-500/50' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}>
            <button 
                onClick={onClick}
                className="w-full text-left"
            >
                {getContent()}
            </button>
        </div>
    );
};

export default PaymentOptionCard;