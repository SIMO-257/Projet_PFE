import React from 'react';
import styles from '../../Styles/HomeScreen.module.css';

const NavButton = ({ 
    icon, 
    label, 
    isActive = false, 
    onClick,
    isCenter = false,
    centerButtonClass = "",
    badge = 0
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
            <div className="relative">
                <div style={{ color: isActive ? activeColor : inactiveColor }} className="transition-colors duration-300">
                    {icon}
                </div>
                {badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-[#1a0507] shadow-lg">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
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