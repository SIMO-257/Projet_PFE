import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useForm } from '@inertiajs/react';

import ProgressSteps from '../../Components/NavBar/ProgressSteps';
import styles from '../../Styles/TicketSelection.module.css'

export default function TicketSelection(props) {
    const [quantity, setQuantity] = useState(1);
    const [purchase, setPurchase] = useState({});

    const fetch_purchase = useForm({
        id: props.purchase_id
    });

    const selected_ticket = useForm({
        quantity:quantity,
        purchase:purchase
    });

 
    useEffect(() => {

        fetch_purchase.get('/purchases', {

            onSuccess: (page) => {

                setPurchase(page.props.purchase);

            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };
    const Confirmer_Payer = () => {
        selected_ticket.post('/paiment')
    }

    const totalPrice = (purchase.price || 0) * quantity;

    return (
        <>
            <Outlet />
            <div className={styles.container}>
                {/* Progress Steps */}
                <ProgressSteps />
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
                            {/* Ticket Summary */}
                            <div className={styles.ticketSummary}>
                                <div className={styles.ticketHeader}>
                                    <div className={styles.ticketInfo}>
                                        <div className={styles.ticketDot}></div>
                                        <span className={styles.ticketType}>Billet Unitaire</span>
                                    </div>
                                    <span className={styles.ticketPrice}>{purchase.price} DH</span>
                                </div>
                                <p className={styles.ticketDescription}>{purchase.description}</p>
                            </div>

                            {/* Section Title */}
                            <h3 className={styles.sectionTitle}>Choisissez votre mode de paiement</h3>

                            {/* Quantity Selector */}
                            <div className={styles.quantityCard}>
                                <div className={styles.quantityHeader}>
                                    <div className={styles.quantityLabel}>
                                        <div className={styles.radioOuter}>
                                            <div className={styles.radioInner}></div>
                                        </div>
                                        <span className={styles.quantityText}>Quantité</span>
                                    </div>
                                    <svg className={styles.chevronIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                <div className={styles.quantityControls}>
                                    <div className={styles.quantityButtons}>
                                        <button
                                            onClick={decrementQuantity}
                                            className={styles.quantityButton}
                                        >
                                            <span>−</span>
                                        </button>
                                        <div className={styles.quantityDisplay}>
                                            <span className={styles.quantityNumber}>{quantity}</span>
                                        </div>
                                        <button
                                            onClick={incrementQuantity}
                                            className={styles.quantityButton}
                                        >
                                            <span>+</span>
                                        </button>
                                    </div>
                                    <div className={styles.priceSection}>
                                        <div className={styles.totalPrice}>{totalPrice} DH</div>
                                        <div className={styles.priceDetails}>{quantity} billet{quantity > 1 ? 's' : ''} × {purchase.price} DH</div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <label className={styles.termsContainer}>
                                <div className={styles.checkboxWrapper}>
                                    <input type="checkbox" className={styles.checkbox} />
                                </div>
                                <span className={styles.termsText}>
                                    J'ai pris connaissance et j'accepte les <a href="#" className={styles.termsLink}>conditions générales de vente</a> et la <a href="#" className={styles.termsLink}>politique de confidentialité</a>.
                                </span>
                            </label>

                            {/* Continue Button */}
                            <button className={styles.continueButton} onClick={Confirmer_Payer}>
                                Confirmer et payer {totalPrice} DH
                            </button>

                            {/* Payment Methods Footer */}
                            <div className={styles.paymentMethodsFooter}>
                                <div className={styles.paymentIcon}>
                                    <span className={styles.paymentIconText}>CB</span>
                                </div>
                                <div className={styles.paymentIcon}>
                                    <span className={`${styles.paymentIconText} ${styles.paymentIconRed}`}>⬤⬤</span>
                                </div>
                                <div className={styles.paymentIcon}>
                                    <span className={styles.paymentIconText}>€</span>
                                </div>
                                <span className={styles.paymentMoreText}>+Plus</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className={styles.securityNotice}>
                        <div className={styles.securityContent}>
                            <svg className={styles.securityIcon} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Paiement sécurisé SSL</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
