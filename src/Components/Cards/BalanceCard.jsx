import React from 'react';
import styles from '../../styles/HomeScreen.module.css';

const BalanceCard = ({ 
    title = "Solde disponible", 
    amount = "42,50 €", 
    cardType = "Carte virtuelle", 
    cardNumber = "**** 7842",
    gradientFrom = "#7A3B47",
    gradientTo = "#5C2A36",
    circlesPosition = "right" // 'right' or 'left'
}) => {
    return (
        <div className={`${styles.balanceCard} relative rounded-3xl p-6 mb-6 overflow-hidden shadow-xl hover:-translate-y-1 transition-all duration-300`}
            style={{ background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` }}>
            
            {/* Decorative circles */}
            {circlesPosition === 'right' ? (
                <>
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 animate-float"></div>
                    <div className="absolute -right-4 top-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{animationDelay: '1s'}}></div>
                </>
            ) : (
                <>
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 animate-float"></div>
                    <div className="absolute left-12 -bottom-4 w-20 h-20 rounded-full bg-white/5 animate-float" style={{animationDelay: '1s'}}></div>
                </>
            )}
            
            <div className="relative z-10">
                <p className="text-white/70 text-sm mb-2">{title}</p>
                <h3 className="text-white text-4xl font-bold mb-6">{amount}</h3>
                
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/60 text-xs mb-1">{cardType}</p>
                        <p className="text-white/80 text-sm font-mono">{cardNumber}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;