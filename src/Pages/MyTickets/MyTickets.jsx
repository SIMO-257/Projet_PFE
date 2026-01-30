import styles from '../../Styles/Ticket.module.css';
import Ticket from "../../Components/Cards/Ticket";
import NavBar from "../../Components/NavBar/NavBar";
export default function MyTickets(){



  const tickets = [
    {
      id: 1,
      title: "Single Ticket",
      status: "Active",
      description: "Valid for one journey",
      price: "8 DH",
      validInfo: "Valid until",
      validTime: "18:30 Today",
      buttonText: "View Ticket",
      buttonVariant: "primary",
      isActive: true
    },
    {
      id: 2,
      title: "Daily Ticket",
      status: "Inactive",
      description: "1 journey",
      price: "8 DH",
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 3,
      title: "Daily Ticket",
      status: "Inactive",
      description: "2 journeys",
      price: "14 DH",
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 4,
      title: "Weekly Pass",
      status: "Inactive",
      description: "Unlimited journeys",
      price: "60 DH",
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 5,
      title: "Monthly Pass",
      status: "Inactive",
      description: "Unlimited journeys",
      price: "230 DH",
      duration: "30 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    }
  ];

  return (
    <div className={styles.appContainer}>
    
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>My Tickets</h1>
      </header>

      <p className={styles.subtitle}>Select or purchase your travel ticket</p>

      <main className={styles.mainContent}>
        {tickets.map((ticket) => (
            <Ticket ticket={ticket}/>
        ))}
      </main>

      {/* Navigation Footer */}

      <NavBar/>
     
    </div>
  
  );

}