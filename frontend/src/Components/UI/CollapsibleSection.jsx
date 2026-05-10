import React from 'react';

const CollapsibleSection = ({ 
    title,
    children,
    isOpen = false,
    onToggle,
    className = "",
    icon = "chevron"
}) => {
    const getIcon = () => {
        if (icon === 'chevron') {
            return (
                <svg 
                    className={`w-5 h-5 text-yellow-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            );
        }
        if (icon === 'plus') {
            return (
                <svg 
                    className={`w-5 h-5 text-yellow-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
            );
        }
        return null;
    };

    return (
        <div className={className}>
            <button 
                onClick={onToggle}
                className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors flex items-center justify-between"
            >
                <span className="text-white font-medium">{title}</span>
                {getIcon()}
            </button>
            
            {isOpen && (
                <div className="mt-2 animate-fade-in-up">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;