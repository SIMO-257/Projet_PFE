import React from 'react';

const ValidationCard = ({ 
    title = "Valider votre titre",
    subtitle = "Choisissez votre méthode de validation",
    children,
    className = ""
}) => {
    return (
        <div className={`relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
            bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm ${className}`}>
            
            {/* Golden Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-t-3xl"></div>

            {children}
        </div>
    );
};

export default ValidationCard;