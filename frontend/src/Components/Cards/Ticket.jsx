import styles from '../../Styles/Ticket.module.css';
import CardButton from '../Buttons/CardButton';


export default function Ticket(props) {

const view_ticket = ()=>{
  props.navigate(`/viewticket/${props.ticket.id}`)
}

  return (

    <div key={props.ticket.id} className={`${styles.ticketCard} ${styles.activeTicket}`}>
      <div className={styles.ticketTop}>
        <div className={styles.ticketHeaderRow}>
          <div className={styles.ticketTitleSection}>
            <span className={styles.ticketIcon}>🎫</span>
            <div>
              <h2 className={styles.ticketTitle}>{props.ticket.title}</h2>
              <p className={styles.ticketDescription}>{props.ticket.description}</p>
            </div>
          </div>
          <span className={`${styles.statusBadge} ${styles.activeBadge}`}>
            {props.ticket.status}
          </span>
        </div>
      </div>

      <div className={styles.ticketDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Price</span>
          <span className={styles.priceValue}>{props.ticket.price}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{props.ticket.validInfo}</span>
          <span className={styles.detailValue}>{props.ticket.validTime}</span>
        </div>

      </div>

      <CardButton active={props.ticket.isActive} btnText={props.ticket.buttonText} method={view_ticket} />

    </div>

  );
};