// components/PaymentMethod.jsx

import styles from '../../Styles/Paiment.module.css';

const PaymentMethod = ({ method, isSelected, onSelect }) => {
  const cardStyle = isSelected ? {
    '--bg-from': method.bgColor.split(', ')[0],
    '--bg-to': method.bgColor.split(', ')[1],
    '--border-color': method.borderColor
  } : {};

  return (
    <div 
      className={isSelected ? styles.methodCardSelected : styles.methodCardUnselected}
      onClick={onSelect}
      style={cardStyle}
    >
      <div className={styles.methodHeader}>
        <div className={styles.methodTitleWrapper}>
          {method.id === 'apple' ? (
            <>
              <svg className={styles.appleIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className={styles.methodTitle}>{method.title}</span>
            </>
          ) : (
            <>
              <span className={styles.methodIcon}>{method.icon}</span>
              <span className={styles.methodTitle}>{method.title}</span>
            </>
          )}
          {method.id === 'bank' && (
            <svg className={styles.methodInfoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <div className={isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected}>
          {isSelected && <div className={styles.radioButtonInner}></div>}
        </div>
      </div>
      
      {/* Card Virtual - Expanded View */}
      {method.id === 'card' && isSelected && (
        <div>
          <div className={styles.cardChipsWrapper}>
            <div className={styles.cardChip}></div>
            <div className={styles.cardChip}></div>
          </div>
          <p className={styles.cardSubtext}>Sous-options</p>
          <p className={styles.cardBalance}>{method.balance}</p>
          <p className={styles.cardType}>{method.cardType}</p>
          <div className={styles.cardNote}>
            <svg className={styles.cardNoteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{method.note}</span>
          </div>
        </div>
      )}
      
      {/* Bank Card */}
      {method.id === 'bank' && (
        <>
          <div className={styles.bankCardNumber}>
            <p className={styles.bankCardNumberText}>{method.cardNumber}</p>
          </div>
          {!isSelected && (
            <p className={styles.bankNote}>{method.note}</p>
          )}
        </>
      )}
      
      {/* Portfolio */}
      {method.id === 'portfolio' && (
        <div className={styles.portfolioWrapper}>
          <p className={styles.portfolioBalance}>{method.balance}</p>
          <p className={styles.portfolioLabel}>Solde disponible</p>
          {isSelected && (
            <div className={styles.portfolioStatus}>
              <svg className={styles.portfolioCheckIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={styles.portfolioStatusText}>{method.note}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Apple Pay */}
      {method.id === 'apple' && (
        <div className={styles.applePayWrapper}>
          <div className={styles.applePayInfo}>
            <span className={styles.applePayCardNumber}>{method.cardNumber}</span>
            {method.express && (
              <span className={styles.applePayBadge}>Express</span>
            )}
          </div>
          <p className={styles.applePayNote}>{method.note}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;