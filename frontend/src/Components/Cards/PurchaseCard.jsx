import styles from '../../Styles/Ticket.module.css';
import CardButton from '../Buttons/CardButton';

export default function PurchaseCard(props) {

  const purchase_ticket = () => {
    props.navigate('/ticket-selection', { state: { selectedTypeId: props.purchase.id } });
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
          <span className={styles.detailLabel}>Prix</span>
          <span className={styles.priceValue}>{props.purchase.price}</span>
        </div>

      </div>

      <CardButton active={true} btnText={props.purchase.buttonText} method={purchase_ticket} />

    </div>
  );
};