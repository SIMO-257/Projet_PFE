import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../Styles/ConfirmationPaiment.module.css';

export default function ValidationSuccess () {
    const location = useLocation();
    const navigate = useNavigate();
    const { ticket } = location.state || {};

    const handleReturnHome = () => {
        navigate('/home');
    };

    const handleViewTicket = () => {
        if (ticket?.uuid) {
            navigate(`/viewticket/${ticket.uuid}`);
        } else {
            navigate('/mytickets');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleString();
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.container}>

                {/* Success Icon */}
                <div className={styles.successIcon}>
                    <svg viewBox="0 0 100 100" className={styles.checkmark}>
                        <circle cx="50" cy="50" r="45" className={styles.circleBg}/>
                        <polyline points="30,50 45,65 70,35" className={styles.check}/>
                    </svg>
                </div>

                {/* Header */}
                <header className={styles.header}>
                    <h2 className={styles.subTitle}>Validation Réussie !</h2>
                    <p className={styles.description}>
                        Votre billet a été validé avec succès. Bon voyage !
                    </p>
                </header>

                {/* Ticket Card */}
                {ticket && (
                <section className={styles.ticketCard}>
                    <div className={styles.ticketHeader}>
                        <svg className={styles.ticketIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                        </svg>
                        <span className={styles.ticketType}>
                            {ticket.ticket_type?.name_fr || "Billet"}
                        </span>
                    </div>
                    
                    <div className={styles.ticketDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>ID Billet</span>
                            <span className={styles.value}>{ticket.uuid.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Date de validation</span>
                            <span className={styles.value}>{formatDate(new Date())}</span>
                        </div>
                    </div>

                    <div className={styles.statusBadge}>
                        <svg className={styles.statusIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                            <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="0"/>
                        </svg>
                        Billet Utilisé
                    </div>
                </section>
                )}

                {/* Action Buttons */}
                <div className={styles.buttonContainer} style={{ marginTop: '24px' }}>
                    <button className={styles.btnPrimary} onClick={handleReturnHome}>
                        <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/>
                        </svg>
                        Retour à l'accueil
                    </button>
                    <button className={styles.btnSecondary} onClick={handleViewTicket}>
                        <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                        </svg>
                        Voir les détails du billet
                    </button>
                </div>
            </div>
        </div>
    );
};

;
