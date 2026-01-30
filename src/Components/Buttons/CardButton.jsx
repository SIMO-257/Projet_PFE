import styles from '../../Styles/Ticket.module.css';

export default function CardButton(props){
    return(
        <button className={`${styles.ticketButton} ${props.active ? styles.viewButton : styles.purchaseButton}`}>
              <span className={styles.buttonIcon}>🎫</span>
              {props.btnText}
        </button>
    )
}