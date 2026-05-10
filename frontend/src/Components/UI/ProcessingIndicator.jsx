import React from 'react';
import styles from '../../Styles/NFCValidation.module.css';

const ProcessingIndicator = ({ 
    message = "Traitement en cours...",
    dotCount = 3,
    dotSize = "sm", // 'sm' | 'md' | 'lg'
    showMessage = true
}) => {
    const getDotSize = () => {
        switch(dotSize) {
            case 'sm': return 'w-2 h-2';
            case 'md': return 'w-3 h-3';
            case 'lg': return 'w-4 h-4';
            default: return 'w-3 h-3';
        }
    };

    const dots = Array.from({ length: dotCount }).map((_, index) => (
        <div 
            key={index}
            className={`${getDotSize()} rounded-full bg-yellow-500 ${styles.progressPulse}`}
            style={{ animationDelay: `${index * 0.2}s` }}
        />
    ));

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-3">
                {dots}
            </div>
            {showMessage && (
                <p className="text-white/60 text-sm font-medium">{message}</p>
            )}
        </div>
    );
};

export default ProcessingIndicator;