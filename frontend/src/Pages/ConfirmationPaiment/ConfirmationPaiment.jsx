import React from 'react';
import styles from '../../Styles/ConfirmationPaiment.module.css';


const Confirmation = () => {
    const ticketData = {
        type: "Billet Unitaire",
        validity: "1 trajet",
        purchaseDate: "27 Jan 2026, 14:30",
        price: "8 DH",
        paymentMethod: "Carte ***** 7865",
        status: "Non activé",
        transactionNumber: "#TRX-123456",
        transactionDateTime: "27 Jan 2026, 14:30:45",
        paymentMethodFull: "Carte Visa ****7865",
        receiptEmail: "user@example.com"
    };

    const handleViewTicket = () => {
        alert("Voir mon billet - Cette fonctionnalité afficherait le billet détaillé.");
    };

    const handleBuyAnother = () => {
        alert("Acheter un autre billet - Cette fonctionnalité redirigerait vers l'achat.");
    };

    const handleReturnHome = () => {
        alert("Retour à l'accueil - Cette fonctionnalité redirigerait vers la page d'accueil.");
    };

    const handleDownloadReceipt = () => {
        alert("Télécharger le reçu - Cette fonctionnalité téléchargerait le reçu en PDF.");
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.container}>
                {/* Close button */}
                <button className={styles.closeBtn} onClick={handleReturnHome}>×</button>

                {/* Success Icon */}
                <div className={styles.successIcon}>
                    <svg viewBox="0 0 100 100" className={styles.checkmark}>
                        <circle cx="50" cy="50" r="45" className={styles.circleBg}/>
                        <polyline points="30,50 45,65 70,35" className={styles.check}/>
                    </svg>
                </div>

                {/* Header */}
                <header className={styles.header}>
                    <h2 className={styles.subTitle}>Achat confirmé !</h2>
                    <p className={styles.description}>Votre billet a été ajouté à votre portefeuille</p>
                </header>

                {/* Ticket Card */}
                <section className={styles.ticketCard}>
                    <div className={styles.ticketHeader}>
                        <svg className={styles.ticketIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                        </svg>
                        <span className={styles.ticketType}>{ticketData.type}</span>
                    </div>
                    
                    <div className={styles.ticketDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Validité</span>
                            <span className={styles.value}>{ticketData.validity}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Date d'achat</span>
                            <span className={styles.value}>{ticketData.purchaseDate}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Prix payé</span>
                            <span className={styles.value}>{ticketData.price}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Mode de paiement</span>
                            <span className={styles.value}>{ticketData.paymentMethod}</span>
                        </div>
                    </div>

                    <div className={styles.statusBadge}>
                        <svg className={styles.statusIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                            <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="0"/>
                        </svg>
                        {ticketData.status}
                    </div>
                </section>

                {/* Action Buttons */}
                <div className={styles.buttonContainer}>
                    <button className={styles.btnPrimary} onClick={handleViewTicket}>
                        <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                        </svg>
                        Voir mon billet
                    </button>
                    <button className={styles.btnSecondary} onClick={handleBuyAnother}>
                        <span className={styles.plusIcon}>+</span>
                        Acheter un autre billet
                    </button>
                    <button className={styles.btnLink} onClick={handleReturnHome}>
                        <svg className={styles.homeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/>
                        </svg>
                        Retour à l'accueil
                    </button>
                </div>

                {/* Transaction Details Accordion */}
                <details className={styles.transactionAccordion}>
                    <summary className={styles.accordionHeader}>
                        Détails de la transaction
                        <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                        </svg>
                    </summary>
                    <div className={styles.accordionContent}>
                        <div className={styles.transactionInfo}>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Numéro de transaction</span>
                                <span className={styles.value}>{ticketData.transactionNumber}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Date et heure</span>
                                <span className={styles.value}>{ticketData.transactionDateTime}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Moyen de paiement</span>
                                <span className={styles.value}>{ticketData.paymentMethodFull}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Reçu envoyé à</span>
                                <span className={styles.value}>{ticketData.receiptEmail}</span>
                            </div>
                        </div>
                        <button className={styles.btnDownload} onClick={handleDownloadReceipt}>
                            <svg className={styles.downloadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
                                <polyline points="7 10 12 15 17 10" strokeWidth="2"/>
                                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2"/>
                            </svg>
                            Télécharger le reçu
                        </button>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default Confirmation;