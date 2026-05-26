import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const Header = ({ 
    title: titleProp, 
    onBack, 
    showBackButton = false,
    onMenu,
    showMenuButton = false,
    onClose,
    showCloseButton = false,
    variant = "default", // 'default' | 'centered'
    className = ""
}) => {
    const { t } = useTranslation();
    const title = titleProp || t('header_title_default');
    const renderLeftButton = () => {
        if (showBackButton) {
            return (
                <button 
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6 text-white rtl-flip" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
            );
        }
        return <div className="w-10"></div>;
    };

    const renderRightButton = () => {
        if (showCloseButton) {
            return (
                <button 
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            );
        } else if (showMenuButton) {
            return (
                <button 
                    onClick={onMenu}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4049] to-[#5C2A2E] flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                </button>
            );
        }
        return <div className="w-10"></div>;
    };

    if (variant === 'centered') {
        return (
            <div className={`flex items-center justify-center mb-6 ${className}`}>
                <h1 className={`text-2xl font-bold text-white ${className}`}>
                    {title}
                </h1>
            </div>
        );
    }

    const getTitleSize = () => {
        if (showBackButton || showMenuButton || showCloseButton) {
            return 'text-lg font-medium';
        }
        return 'text-2xl font-light';
    };

    return (
        <div className={`flex items-center justify-between px-6 pt-6 pb-4 ${className}`}>
            {renderLeftButton()}
            
            <h1 className={`${getTitleSize()} text-white ${className}`}>
                {title}
            </h1>
            
            {renderRightButton()}
        </div>
    );
};

export default Header;