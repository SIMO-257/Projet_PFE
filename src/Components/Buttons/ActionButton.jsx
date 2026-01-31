import React from 'react';

const ActionButtonCard = ({ 
    icon, 
    label, 
    description = "", 
    onClick, 
    className = "",
    variant = "default", // 'default' | 'validation'
    showArrow = false
}) => {
    // Determine styling based on variant
    const getButtonClasses = () => {
        if (variant === 'validation') {
            return `w-full rounded-2xl p-6 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 bg-gradient-to-r from-[#8B4049] to-[#5C2A2E] hover:from-[#9B5059] hover:to-[#6C3A3E] group ${className}`;
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