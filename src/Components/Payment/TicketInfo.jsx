// components/TicketInfo.jsx
import React from 'react';
import styles from '../../Styles/Paiment.module.css';

const TicketInfo = ({ ticket }) => {
  return (
    <div className={styles.ticketInfoCard}>
      <div className={styles.ticketInfoGrid}>
        <div>
          <p className={styles.ticketInfoLabel}>Type</p>
          <p className={styles.ticketInfoValue}>{ticket.type}</p>
        </div>
        <div>
          <p className={styles.ticketInfoLabel}>Single</p>
          <p className={styles.ticketInfoValue}>{ticket.expiration}</p>
        </div>
      </div>
      
      <div className={styles.ticketInfoDivider}>
        <div className={styles.ticketTotal}>
          <p className={styles.ticketTotalLabel}>Total à payer</p>
          <p className={styles.ticketTotalValue}>{ticket.total}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketInfo;