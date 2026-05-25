
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import ProgressSteps from '../Components/NavBar/ProgressSteps';
import styles from '../Styles/ConfirmationPaiment.module.css';

export default function Confirmation () {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language } = useTranslation();
    const { tickets, message } = location.state || {};

    // Get the first ticket to display primary info
    const mainTicket = tickets && tickets.length > 0 ? tickets[0] : null;
    const quantity = tickets ? tickets.length : 0;

    const getValidity = (ticket) => {
        if (!ticket || !ticket.ticket_type) return t('valid_for_single');
        const code = ticket.ticket_type.code;
        
        if (code === 'BILLET_SIMPLE') return t('valid_for_single');
        if (code === 'CARTE_NORMALE') return t('valid_for_two');
        if (code === 'BILLET_SEMAINE') return t('valid_for_week');
        if (code === 'BILLET_MOIS') return t('valid_for_month');
        
        return ticket.ticket_type.duration_minutes ? `${ticket.ticket_type.duration_minutes} min` : t('valid_for_single');
    };

    const getLocale = () => language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR';

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleString();
        return new Date(dateString).toLocaleString(getLocale(), {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ticketData = {
        type: mainTicket?.ticket_type?.name || t('ticket_type'),
        validity: getValidity(mainTicket),
        purchaseDate: formatDate(mainTicket?.created_at),
        price: mainTicket ? `${(mainTicket.price_paid * quantity).toFixed(2)} ${t('currency')}` : `0.00 ${t('currency')}`,
        paymentMethod: t('internal_wallet'),
        status: mainTicket?.status === 'active' ? t('ready_to_use') : t('activated'),
        transactionNumber: mainTicket?.uuid ? `#TRX-${mainTicket.uuid.split('-')[0].toUpperCase()}` : "#TRX-UNKNOWN",
        transactionDateTime: formatDate(mainTicket?.created_at),
        paymentMethodFull: t('payment_by_wallet'),
        receiptEmail: "Client@PFE.com"
    };

    const handleViewTicket = () => {
        if (quantity > 1) {
            // If multiple tickets, go to the list so they can see all of them
            navigate('/mytickets');
        } else if (mainTicket) {
            // If single ticket, go straight to the detail/QR
            navigate(`/viewticket/${mainTicket.uuid}`);
        } else {
            navigate('/mytickets');
        }
    };

    const handleBuyAnother = () => {
        navigate('/ticket-selection');
    };

    const handleReturnHome = () => {
        navigate('/home');
    };

    const handleDownloadReceipt = () => {
        alert("Téléchargement du reçu en cours...");
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.container}>

                {/* Close button */}

                <ProgressSteps currentStep={2} />

                {/* Success Icon */}
                <div className={styles.successIcon}>
                    <svg viewBox="0 0 100 100" className={styles.checkmark}>
                        <circle cx="50" cy="50" r="45" className={styles.circleBg}/>
                        <polyline points="30,50 45,65 70,35" className={styles.check}/>
                    </svg>
                </div>

                {/* Header */}
                <header className={styles.header}>
                    <h2 className={styles.subTitle}>{message === 'Achat réussi !' ? t('purchase_success') : (message || t('purchase_confirmed'))}</h2>
                    <p className={styles.description}>
                        {quantity > 1 
                            ? t('tickets_added').replace('{count}', quantity)
                            : t('ticket_added')
                        }
                    </p>
                </header>

                {/* Ticket Card */}
                <section className={styles.ticketCard}>
                    <div className={styles.ticketHeader}>
                        <svg className={styles.ticketIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                        </svg>
                        <span className={styles.ticketType}>
                            {ticketData.type} {quantity > 1 ? `(x${quantity})` : ""}
                        </span>
                    </div>
                    
                    <div className={styles.ticketDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>{t('validity_label')}</span>
                            <span className={styles.value}>{ticketData.validity}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>{t('purchase_date')}</span>
                            <span className={styles.value}>{ticketData.purchaseDate}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>{t('total_to_pay')}</span>
                            <span className={styles.value}>{ticketData.price}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>{t('payment_method')}</span>
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
                        {quantity > 1 ? t('view_tickets_btn') : t('view_my_ticket_btn')}
                    </button>
                    <button className={styles.btnSecondary} onClick={handleBuyAnother}>
                        <span className={styles.plusIcon}>+</span>
                        {t('buy_another_ticket')}
                    </button>
                    <button className={styles.btnLink} onClick={handleReturnHome}>
                        <svg className={styles.homeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/>
                        </svg>
                        {t('return_home')}
                    </button>
                </div>

                {/* Transaction Details Accordion */}
                <details className={styles.transactionAccordion}>
                    <summary className={styles.accordionHeader}>
                        {t('transaction_details')}
                        <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                        </svg>
                    </summary>
                    <div className={styles.accordionContent}>
                        <div className={styles.transactionInfo}>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>{t('transaction_number')}</span>
                                <span className={styles.value}>{ticketData.transactionNumber}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>{t('date_and_time')}</span>
                                <span className={styles.value}>{ticketData.transactionDateTime}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>{t('payment_method_full')}</span>
                                <span className={styles.value}>{ticketData.paymentMethodFull}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>{t('client_label')}</span>
                                <span className={styles.value}>{ticketData.receiptEmail}</span>
                            </div>
                        </div>
                        <button className={styles.btnDownload} onClick={handleDownloadReceipt}>
                            <svg className={styles.downloadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
                                <polyline points="7 10 12 15 17 10" strokeWidth="2"/>
                                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2"/>
                            </svg>
                            {t('download_receipt')}
                        </button>
                    </div>
                </details>
            </div>
        </div>
    );
};


