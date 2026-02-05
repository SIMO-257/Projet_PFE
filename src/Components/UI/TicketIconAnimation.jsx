import React from 'react';
import styles from '../../Styles/ValidationScreen.module.css';

const TicketIconAnimation = ({ 
    size = 128,
    showWaves = true,
    pulseSpeed = "normal"
}) => {
    const getPulseClass = () => {
        switch(pulseSpeed) {
            case 'slow': return styles.ticketPulseSlow;
            case 'fast': return styles.ticketPulseFast;
            default: return styles.ticketPulse;
        }
    };

    return (
        <div className="relative flex justify-center">
            <div 
                className={`${styles.ticketIcon} ${getPulseClass()}`}
                style={{ width: size, height: size }}
            >
                <svg className="w-1/2 h-1/2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
                </svg>
            </div>
            
            {showWaves && (
                <>
                    <div className={`${styles.ticketWave}`} style={{ animationDelay: '0s' }} />
                    <div className={`${styles.ticketWave}`} style={{ animationDelay: '0.5s' }} />
                    <div className={`${styles.ticketWave}`} style={{ animationDelay: '1s' }} />
                </>
            )}
        </div>
    );
};

export default TicketIconAnimation;