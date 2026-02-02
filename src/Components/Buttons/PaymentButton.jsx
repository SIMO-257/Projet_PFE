// components/PaymentButton.jsx
import React from 'react';
import styles from '../../Styles/Paiment.module.css';

const PaymentButton = ({ amount, onConfirm, disabled }) => {
  return (
    <button
      onClick={onConfirm}
      disabled={disabled}
      className={`${styles.paymentButton} ${disabled ? styles.paymentButtonDisabled : styles.paymentButtonEnabled}`}
    >
      <svg className={styles.paymentButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Confirmer et payer {amount}</span>
    </button>
  );
};

export default PaymentButton;