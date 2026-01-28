import React from 'react';
import styles from './Home.module.css';

const WalletApp = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Home</h1>
        <div className={styles.avatar}>
          <span className={styles.avatarText}>A</span>
        </div>
      </div>

      {/* Greeting */}
      <div className={styles.greeting}>
        <p className={styles.greetingLabel}>Bonjour,</p>
        <p className={styles.greetingName}>Alexandre</p>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Solde disponible</p>
        <p className={styles.balanceAmount}>42,50 €</p>
        
        {/* Virtual Card */}
        <div className={styles.virtualCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardType}>Carte virtuelle</p>
              <div className={styles.cardNumber}>
                <div className={styles.hiddenNumbers}>•••• •••• ••••</div>
                <div className={styles.visibleNumbers}>7842</div>
              </div>
            </div>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.actionButton}>
          <div className={`${styles.iconContainer} ${styles.scanIcon}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className={styles.buttonText}>Scanner</span>
        </button>
        
        <button className={styles.actionButton}>
          <div className={`${styles.iconContainer} ${styles.rechargeIcon}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className={styles.buttonText}>Recharger</span>
        </button>
      </div>

      {/* History Section */}
      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>Historique</h2>
          <button className={styles.viewAll}>Voir tout</button>
        </div>
        
        <div className={styles.transactionList}>
          <div className={styles.transactionItem}>
            <div className={styles.transactionInfo}>
              <div className={`${styles.transactionIcon} ${styles.amazonIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className={styles.transactionDetails}>
                <h3>Amazon</h3>
                <p>Aujourd'hui, 10:24</p>
              </div>
            </div>
            <div className={styles.transactionAmount}>
              <p className={styles.negativeAmount}>-29,99 €</p>
              <p className={styles.transactionMethod}>Carte •••• 7842</p>
            </div>
          </div>
          
          <div className={styles.transactionItem}>
            <div className={styles.transactionInfo}>
              <div className={`${styles.transactionIcon} ${styles.rechargeIconSmall}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.transactionDetails}>
                <h3>Rechargement</h3>
                <p>Hier, 14:18</p>
              </div>
            </div>
            <div className={styles.transactionAmount}>
              <p className={styles.positiveAmount}>+50,00 €</p>
              <p className={styles.transactionMethod}>Virement bancaire</p>
            </div>
          </div>
          
          <div className={styles.transactionItem}>
            <div className={styles.transactionInfo}>
              <div className={`${styles.transactionIcon} ${styles.bakeryIcon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className={styles.transactionDetails}>
                <h3>Boulangerie</h3>
                <p>26 jan, 08:45</p>
              </div>
            </div>
            <div className={styles.transactionAmount}>
              <p className={styles.negativeAmount}>-4,50 €</p>
              <p className={styles.transactionMethod}>Carte •••• 7842</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={styles.bottomNav}>
        <button className={styles.navButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={styles.activeNav}>Accueil</span>
        </button>
        
        <button className={styles.navButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={styles.inactiveNav}>Transactions</span>
        </button>
        
        <button className={styles.navButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={styles.inactiveNav}>Statistiques</span>
        </button>
        
        <button className={styles.navButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={styles.inactiveNav}>Paramètres</span>
        </button>
      </div>
    </div>
  );
};

export default WalletApp;