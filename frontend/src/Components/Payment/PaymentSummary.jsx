// components/PaymentSummary.jsx
import React from 'react';
import styles from '../../Styles/Paiment.module.css';

const PaymentSummary = ({ ticketInfo }) => {
  return (
    <div className={styles.paymentSummary}>
      <h3 className={styles.summaryTitle}>Récapitulatif</h3>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Billet</span>
          <span className={styles.summaryValue}>{ticketInfo.type}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Expiration</span>
          <span className={styles.summaryValue}>{ticketInfo.expiration}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Montant</span>
          <span className={styles.summaryValue}>{ticketInfo.total}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
