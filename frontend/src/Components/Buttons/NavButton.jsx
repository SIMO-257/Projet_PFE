import React from 'react';
import styles from '../../styles/HomeScreen.module.css';

const NavButton = ({ 
    icon, 
    label, 
    isActive = false, 
    onClick,
    isCenter = false,
    centerButtonClass = ""
}) => {
    if (isCenter) {
        return (
            <button 
                onClick={onClick}
                className="relative flex flex-col items-center space-y-1 group"
            >
                <div className={`${styles.centerNavButton} ${isActive ? styles.active : ''} ${centerButtonClass}`}>
                    {icon}
                </div>
                <span className={`text-xs ${isActive ? 'text-yellow-500 font-medium' : 'text-white/40'} transition-colors`}>
                    {label}
                </span>
                {isActive && (
                    <div className={styles.navIndicator}></div>
                )}
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            className={`relative flex flex-col items-center space-y-1 group ${isActive ? styles.navActive : ''}`}
        >
            {icon}
            <span className={`text-xs ${isActive ? 'text-yellow-500 font-medium' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                {label}
            </span>
            {isActive && (
                <div className={styles.navIndicator}></div>
            )}
        </button>
    );
};

export default NavButton;