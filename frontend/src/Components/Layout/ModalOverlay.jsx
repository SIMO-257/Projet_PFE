import React from 'react';

const ModalOverlay = ({ 
    children,
    onClose,
    showCloseButton = true,
    className = "",
    overlayClassName = "",
    show = true
}) => {
    if (!show) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div 
            className={`fixed inset-0 bg-gradient-to-br from-[#2a0b0f]/95 to-[#1a0507]/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${overlayClassName}`}
            onClick={handleOverlayClick}
        >
            <div className={`relative ${className}`}>
                {children}
                
                {showCloseButton && onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModalOverlay;