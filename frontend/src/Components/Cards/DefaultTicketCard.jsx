import React from 'react';
import styles from '../../Styles/HomeScreen.module.css';
import GoldenSpinner from '../UI/GoldenSpinner';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * DefaultTicketCard Component
 * Displays the default ticket on the Home page with premium styling and dynamic states.
 *
 * @param {Object} props
 * @param {Object|null} props.defaultTicket - The default ticket object
 * @param {string} props.defaultTicket.name - Ticket name (e.g., "Ticket par défaut")
 * @param {string} props.defaultTicket.price - Ticket price (e.g., "0.00 MAD")
 * @param {string} props.defaultTicket.uuid - Full ticket UUID
 * @param {boolean} props.defaultTicket.isReusable - Reusable flag
 * @param {Function} [props.onClick] - Card click callback
 * @param {Function} [props.onAction] - Action button click callback (change card)
 * @param {boolean} [props.isNavigatingToValidation] - Loading state for navigation
 */
const DefaultTicketCard = ({
  defaultTicket = null,
  onClick = null,
  onAction = null,
  isNavigatingToValidation = false,
}) => {
  const { t } = useTranslation();
  const hasTicket = !!defaultTicket;

  // Background gradient based on color logic
  const getBackgroundStyle = () => {
    if (!hasTicket) {
      // No default ticket exists: Existing red color from screenshot (gradient from app palette)
      return 'linear-gradient(to bottom right, #7A3B47, #5C2A36)';
    }
    if (defaultTicket.isReusable === true) {
      // Default ticket exists AND isReusable === true: Golden brown (matching app palette)
      return 'linear-gradient(to bottom right, #B8965F, #8B6914)';
    }
    // Default ticket exists AND isReusable === false: Dark silver (matching app palette)
    return 'linear-gradient(to bottom right, #7D8893, #4E565E)';
  };

  const handleCardClick = (e) => {
    if (hasTicket && onClick && !isNavigatingToValidation) {
      onClick(e);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onAction) {
      onAction(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={(!hasTicket || isNavigatingToValidation) ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && hasTicket && !isNavigatingToValidation) {
          handleCardClick(event);
        }
      }}
      aria-disabled={!hasTicket || isNavigatingToValidation}
      className={`w-full text-left relative ${(!hasTicket || isNavigatingToValidation) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
    >
      {/* Loading overlay when validating */}
      {isNavigatingToValidation && (
        <div className="absolute inset-0 bg-[#400106]/55 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
          <GoldenSpinner size={48} />
        </div>
      )}

      <div
        className={`${styles.balanceCard} relative rounded-3xl p-6 overflow-hidden shadow-xl hover:-translate-y-1 transition-all duration-300`}
        style={{ background: getBackgroundStyle() }}
      >
        {/* Decorative background circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 animate-float"></div>
        <div className="absolute -right-4 top-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
          {hasTicket ? (
            <>
              {/* Ticket Name & Price */}
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                  {defaultTicket.name || t('default_ticket')}
                </p>
                <h3 className="text-white text-4xl font-extrabold tracking-tight">
                  {defaultTicket.price || '0.00 MAD'}
                </h3>
              </div>

              {/* Ticket Code and Change Card Button */}
              <div className="flex items-end justify-between mt-4">
                <div>
                  {defaultTicket.uuid && (
                    <p className="text-white/80 font-mono text-xs tracking-widest bg-black/25 px-2.5 py-1 rounded-md border border-white/5 inline-block">
                      Code: {defaultTicket.uuid.substring(0, 8).toUpperCase()}
                    </p>
                  )}
                </div>

                {onAction && (
                  <button
                    type="button"
                    onClick={handleActionClick}
                    aria-label="Changer de carte"
                    className="relative w-14 h-14 rounded-full bg-yellow-500/15 border border-yellow-300/25 text-yellow-300 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(212,175,55,0.18)] group"
                  >
                    <span className="sr-only">Changer de carte</span>
                    <svg className="w-6 h-6 text-yellow-300 transition-colors duration-300 group-hover:text-yellow-100" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.65 6.35a7.95 7.95 0 0 0-11.3 0l1.42 1.42A6 6 0 0 1 12 7c1.66 0 3.17.69 4.24 1.76l-2.12 2.12H20V5.5l-2.35 2.35zM6.35 17.65a7.95 7.95 0 0 0 11.3 0l-1.42-1.42A6 6 0 0 1 12 17c-1.66 0-3.17-.69-4.24-1.76l2.12-2.12H4v5.5l2.35-2.35z" />
                    </svg>
                    <span className="absolute inset-0 rounded-full ring-2 ring-yellow-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 animate-pulse"></span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* No Cards Purchased Display */}
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                  {t('default_ticket')}
                </p>
                <h3 className="text-white/60 text-lg font-medium italic mt-2">
                  {t('no_cards_purchased')}
                </h3>
              </div>

              {/* Decorative Card Icon */}
              <div className="flex items-center justify-between mt-6">
                <div></div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultTicketCard;
