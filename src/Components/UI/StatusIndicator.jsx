import React from 'react';
import styles from '../../styles/ValidationResult.module.css';

const StatusIndicator = ({ 
    isValid = true,
    message = "",
    variant = "badge", // 'badge' | 'simple' | 'success' | 'success-animated' | 'success-circle'
    className = "",
    showIcon = true,
    title = "",
    iconSize = "md" // 'sm' | 'md' | 'lg'
}) => {
    const getIconSize = () => {
        switch(iconSize) {
            case 'sm': return 'w-10 h-10';
            case 'lg': return 'w-24 h-24';
            default: return 'w-16 h-16';
        }
    };

    const getContent = () => {
        if (variant === 'success-circle') {
            return (
                <div className={`text-center ${className}`}>
                    <div className="relative mb-6">
                        {/* Pulse Rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 pulse-ring"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 pulse-ring" style={{animationDelay: '0.5s'}}></div>
                        
                        {/* Main Circle */}
                        <div className={`relative ${getIconSize()} rounded-full border-4 border-yellow-500 flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 animate-circle-grow`}>
                            {/* Checkmark */}
                            <svg className="w-1/2 h-1/2" viewBox="0 0 50 50">
                                <path
                                    className={styles.checkmarkPath}
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 25 L20 35 L40 15"
                                />
                            </svg>
                        </div>
                    </div>
                    {title && <h1 className="text-white text-2xl font-bold text-center mb-2">{title}</h1>}
                    <p className="text-white/60 text-sm text-center">{message}</p>
                </div>
            );
        }

        // ... rest of existing code
    };

    return getContent();
};

export default StatusIndicator;