import styles from '../../Styles/TicketSelection.module.css'; // Assuming similar styles


export default function ProgressSteps({ currentStep = 1 }) {
    const steps = [
        { number: 1, label: 'Sélection' },
        { number: 2, label: 'Paiement' },
        { number: 3, label: 'Confirmation' }
    ];

    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressSteps}>
                {steps.map((step, index) => (
                    <div key={step.number} className={styles.stepGroup}>
                        <div className={styles.stepWrapper}>
                            <div 
                                className={`${styles.stepCircle} ${
                                    step.number <= currentStep 
                                        ? styles.stepCircleActive 
                                        : styles.stepCircleInactive
                                }`}
                            >
                                {step.number}
                            </div>
                            <span 
                                className={`${styles.stepLabel} ${
                                    step.number <= currentStep 
                                        ? styles.stepLabelActive 
                                        : styles.stepLabelInactive
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        
                        {/* Line between steps - don't render after last step */}
                        {index < steps.length - 1 && (
                            <div className={styles.progressLineWrapper}>
                                <div 
                                    className={`${styles.progressLine} ${
                                        step.number < currentStep 
                                            ? styles.progressLineActive 
                                            : ''
                                    }`}
                                ></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}