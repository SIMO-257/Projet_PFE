import styles from '../../Styles/Ticket.module.css';
import CardButton from '../Buttons/CardButton';
import { useForm } from '@inertiajs/react';

export default function PurchaseCard(props) {

  const { Data } = useForm({
    id: props.purchase_id
  });

  const purchase_ticket = () => {
    post('/ticketselection');
  }
  return (

    <div key={props.purchase.id} className={styles.ticketCard} >
      <div className={styles.ticketTop}>
        <div className={styles.ticketHeaderRow}>
          <div className={styles.ticketTitleSection}>
            <span className={styles.ticketIcon}>🎫</span>
            <div>
              <h2 className={styles.ticketTitle}>{props.purchase.title}</h2>
              <p className={styles.ticketDescription}>{props.purchase.description}</p>
            </div>
          </div>
          <span className={`${styles.statusBadge} ${styles.inactiveBadge}`}>
            {props.purchase.status}
          </span>
        </div>
      </div>

      <div className={styles.ticketDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Price</span>
          <span className={styles.priceValue}>{props.purchase.price}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Duration</span>
          <span className={styles.detailValue}>{props.purchase.duration}</span>
        </div>

      </div>

      <CardButton active={props.purchase.isActive} btnText={props.purchase.buttonText} method={purchase_ticket} />

    </div>

  );
};