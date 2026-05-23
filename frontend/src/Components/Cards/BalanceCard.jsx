import React from 'react';
import styles from '../../Styles/HomeScreen.module.css';

const BalanceCard = ({ 
    title = "Solde disponible", 
    amount = "42,50 €", 
    gradientFrom = "#7A3B47",
    gradientTo = "#5C2A36",
    circlesPosition = "right", // 'right' or 'left'
    onAction = null,
    actionLabel = "Action"
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
                    </div>
                    {onAction ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAction();
                        }}
                        aria-label={actionLabel}
                        className="relative w-16 h-16 rounded-full bg-yellow-500/15 border border-yellow-300/25 text-yellow-300 flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 shadow-[0_18px_45px_rgba(212,175,55,0.18)] group"
                      >
                        <span className="sr-only">{actionLabel}</span>
                        <svg className="w-8 h-8 text-yellow-300 transition-colors duration-300 group-hover:text-yellow-100" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.65 6.35a7.95 7.95 0 0 0-11.3 0l1.42 1.42A6 6 0 0 1 12 7c1.66 0 3.17.69 4.24 1.76l-2.12 2.12H20V5.5l-2.35 2.35zM6.35 17.65a7.95 7.95 0 0 0 11.3 0l-1.42-1.42A6 6 0 0 1 12 17c-1.66 0-3.17-.69-4.24-1.76l2.12-2.12H4v5.5l2.35-2.35z"/>
                        </svg>
                        <span className="absolute inset-0 rounded-full ring-2 ring-yellow-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 animate-pulse"></span>
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;