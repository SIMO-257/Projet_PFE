import styles from '../../Styles/Ticket.module.css';
import CardButton from '../Buttons/CardButton';

export default function Ticket(props){



 

  return (
   
      <div key={props.ticket.id} className={`${styles.ticketCard} ${props.ticket.isActive ? styles.activeTicket : ''}`}>
            <div className={styles.ticketTop}>
              <div className={styles.ticketHeaderRow}>
                <div className={styles.ticketTitleSection}>
                  <span className={styles.ticketIcon}>🎫</span>
                  <div>
                    <h2 className={styles.ticketTitle}>{props.ticket.title}</h2>
                    <p className={styles.ticketDescription}>{props.ticket.description}</p>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${props.ticket.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                  {props.ticket.status}
                </span>
              </div>
            </div>

            <div className={styles.ticketDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Price</span>
                <span className={styles.priceValue}>{props.ticket.price}</span>
              </div>

              {props.ticket.isActive ? (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{props.ticket.validInfo}</span>
                  <span className={styles.detailValue}>{props.ticket.validTime}</span>
                </div>
              ) : (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>{props.ticket.duration}</span>
                </div>
              )}
            </div>

            <CardButton active={props.ticket.isActive} btnText={props.ticket.buttonText}/>

          </div>
  
  );
};