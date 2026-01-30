import styles from '../../Styles/Ticket.module.css';

export default function NavBar(){

const navItems = [
    { name: "Home", icon: "🏠" },
    { name: "Tickets", icon: "🎫" },
    { name: "Routes", icon: "🗺️" },
    { name: "Profile", icon: "👤" }
];    

    return(
        <footer className={styles.navigation}>
        {navItems.map((item, index) => (
          <button key={index} className={`${styles.navItem} ${item.name === 'Tickets' ? styles.activeNav : ''}`}>
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.name}</span>
          </button>
        ))}
      </footer>
    )
}