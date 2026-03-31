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
    const activeColor = "#FFD700"; // Gold
    const inactiveColor = "#FFFFFF"; // White

    if (isCenter) {
        return (
            <button 
                onClick={onClick}
                className={`relative flex flex-col items-center space-y-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
            >
                <div className={`${styles.centerNavButton} ${isActive ? styles.active : ''} ${centerButtonClass}`}>
                    <div style={{ color: isActive ? '#400106' : inactiveColor }}>
                        {icon}
                    </div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors duration-300`} 
                      style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.6)' }}>
                    {label}
                </span>
                {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-yellow-500 shadow-[0_0_8px_#FFD700]"></div>
                )}
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            className={`relative flex flex-col items-center space-y-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
        >
            <div style={{ color: isActive ? activeColor : inactiveColor }} className="transition-colors duration-300">
                {icon}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors duration-300`}
                  style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.6)' }}>
                {label}
            </span>
            {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-yellow-500 shadow-[0_0_8px_#FFD700]"></div>
            )}
        </button>
    );
};

export default NavButton;