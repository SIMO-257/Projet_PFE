import React from 'react';
import styles from '../../Styles/NFCValidation.module.css';

const NFCAnimation = ({ 
    isActive = true,
    size = 96,
    showWaves = true,
    pulseSpeed = "normal" // 'slow' | 'normal' | 'fast'
}) => {
    const getPulseClass = () => {
        if (!isActive) return '';
        switch(pulseSpeed) {
            case 'slow': return styles.pulseGlowSlow;
            case 'fast': return styles.pulseGlowFast;
            default: return styles.pulseGlow;
        }
    };

    const getWaveClass = () => {
        if (!isActive) return '';
        return styles.nfcWave;
    };

    return (
        <div className="relative flex justify-center">
            <div className={`${styles.nfcIconContainer} ${getPulseClass()}`} 
                 style={{ width: size, height: size }}>
                <svg className={`w-1/2 h-1/2 text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                </svg>
            </div>
            
            {showWaves && isActive && (
                <>
                    <div className={`${styles.nfcWave} ${getWaveClass()}`} 
                         style={{ animationDelay: '0s' }} />
                    <div className={`${styles.nfcWave} ${getWaveClass()}`} 
                         style={{ animationDelay: '0.5s' }} />
                    <div className={`${styles.nfcWave} ${getWaveClass()}`} 
                         style={{ animationDelay: '1s' }} />
                </>
            )}
        </div>
    );
};

export default NFCAnimation;