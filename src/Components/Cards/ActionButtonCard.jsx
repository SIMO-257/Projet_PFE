import React from 'react';

const ActionButtonCard = ({ 
    icon, 
    label, 
    description = "", 
    onClick, 
    className = "",
    variant = "default", // 'default' | 'validation' | 'payment'
    showArrow = false,
    isSelected = false,
    children,
    showExpressBadge = false
}) => {
    // Determine styling based on variant
    const getButtonClasses = () => {
        if (variant === 'validation') {
            return `w-full rounded-2xl p-6 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] hover:from-[#9B5059] hover:to-[#6C3A3E] group ${className}`;
        } else if (variant === 'payment') {
            return `w-full rounded-2xl p-4 border-2 transition-all ${
                isSelected 
                    ? 'bg-[#0a2f1a] border-green-500/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
            } ${className}`;
        }
        // Default variant (HomeScreen grid buttons)
        return `bg-[#2a2a2a] rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:bg-[#333333] transition-colors ${className}`;
    };

    const getContent = () => {
        if (variant === 'validation') {
            return (
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-white font-semibold text-lg">{label}</h3>
                        {description && <p className="text-white/50 text-sm">{description}</p>}
                    </div>
                    {showArrow && (
                        <svg className="w-6 h-6 text-white/40 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    )}
                </div>
            );
        } else if (variant === 'payment') {
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
                        <div className="flex-1 text-left">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    {icon}
                                    <span className="text-white font-medium text-sm">{label}</span>
                                </div>
                                {showExpressBadge && (
                                    <span className="text-yellow-500 text-xs">+ Paiement express</span>
                                )}
                            </div>
                            {description && <p className="text-white/50 text-xs mb-1">{description}</p>}
                        </div>
                    </div>
                    {children}
                </>
            );
        }
        
        // Default variant (grid buttons - HomeScreen)
        return (
            <>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-white text-xs font-medium">{label}</span>
            </>
        );
    };

    return (
        <button 
            onClick={onClick}
            className={getButtonClasses()}
        >
            {getContent()}
        </button>
    );
};

export default ActionButtonCard;