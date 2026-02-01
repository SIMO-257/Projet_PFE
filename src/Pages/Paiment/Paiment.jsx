
import styles from '../../Styles/TicketSelection.module.css'; // Assuming similar styles

export default function Paiment() {
    return (
        <div className={styles.container}>
            {/* Progress Steps */}
            <div className={styles.progressContainer}>
                <div className={styles.progressSteps}>
                    {/* Steps */}
                    <div className={styles.stepWrapper}>
                        <div className={`${styles.stepCircle} ${styles.stepCircleCompleted}`}>
                            ✓
                        </div>
                        <span className={`${styles.stepLabel} ${styles.stepLabelCompleted}`}>Sélection</span>
                    </div>

                    {/* Line between steps */}
                    <div className={styles.progressLine}></div>

                    <div className={styles.stepWrapper}>
                        <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>
                            2
                        </div>
                        <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>Paiement</span>
                    </div>

                    {/* Line between steps */}
                    <div className={styles.progressLine}></div>

                    <div className={styles.stepWrapper}>
                        <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>
                            3
                        </div>
                        <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Confirmation</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.headerTitle}>Paiement</h1>
                            <button className={styles.closeButton}>
                                <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <h3 className={styles.sectionTitle}>Traitement du paiement en cours...</h3>
                        <p>Veuillez patienter pendant que nous traitons votre paiement.</p>
                        {/* Placeholder for payment form - to be implemented */}
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Formulaire de paiement à implémenter</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
