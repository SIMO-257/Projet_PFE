import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressSteps from '../../Components/NavBar/ProgressSteps';
import styles from '../../Styles/TicketSelection.module.css';

export default function TicketSelection() {

    const apiBase = import.meta.env.VITE_API_URL ?? '';
    const navigate = useNavigate();

    const [ticketTypes, setTicketTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await axios.get(`${apiBase}/api/ticket-types`);
                setTicketTypes(res.data);

                if (res.data.length > 0) {
                    setSelectedType(res.data[0]);
                }

            } catch (err) {
                console.error("Failed to fetch ticket types", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();

    }, [apiBase]);

    const incrementQuantity = () => setQuantity(prev => prev < 10 ? prev + 1 : prev);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : prev);

    const handlePurchase = async () => {

        if (!selectedType) return;

        if (!acceptedTerms) {
            setErrors({ terms: "Vous devez accepter les conditions générales." });
            return;
        }

        const clientUuid = sessionStorage.getItem('client_uuid') || '';

        if (!clientUuid) {
            setErrors({ form: "Session expirée. Veuillez vous reconnecter." });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setProcessing(true);
        setErrors({});

        try {

            const payload = {
                ticket_type_id: selectedType.id,
                quantity: quantity,
                client_uuid: clientUuid
            };

            const res = await axios.post(`${apiBase}/api/tickets/purchase`, payload);

            navigate('/payment-confirmation', {
                state: {
                    message: res.data.message,
                    tickets: res.data.tickets
                }
            });

        } catch (err) {

            const responseErrors = err?.response?.data?.errors;

            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setErrors({
                    form: err?.response?.data?.message || "Échec de l'achat. Réessayez."
                });
            }

        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <p style={{ color: 'white', textAlign: 'center' }}>Chargement...</p>
            </div>
        );
    }

    const totalPrice = selectedType ? (selectedType.price * quantity).toFixed(2) : 0;

    return (
        <div className={styles.container}>
            <ProgressSteps currentStep={1} />

            <div className={styles.mainContent}>

                <div className={styles.card}>

                    <div className={styles.header}>
                        <div className={styles.headerContent}>

                            <h1 className={styles.headerTitle}>
                                Sélection du Billet
                            </h1>

                            <button
                                className={styles.closeButton}
                                onClick={() => navigate('/home')}
                            >
                                ✕
                            </button>

                        </div>
                    </div>

                    <div className={styles.content}>

                        <h3 className={styles.sectionTitle}>
                            Choisissez votre type de billet
                        </h3>

                        <div className="grid gap-4">

                            {ticketTypes.map((type) => (

                                <div
                                    key={type.id}
                                    className={styles.ticketSummary}
                                    onClick={() => setSelectedType(type)}
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedType?.id === type.id
                                            ? '2px solid #8b6f47'
                                            : '1px solid #4a2a2a'
                                    }}
                                >

                                    <div className={styles.ticketHeader}>

                                        <span className={styles.ticketType}>
                                            {type.name_fr}
                                        </span>

                                        <span className={styles.ticketPrice}>
                                            {type.price} DH
                                        </span>

                                    </div>

                                    <p className={styles.ticketDescription}>
                                        {type.description}
                                    </p>

                                </div>

                            ))}

                        </div>

                        <div className={styles.quantityCard}>

                            <div className={styles.quantityControls}>

                                <button
                                    onClick={decrementQuantity}
                                    className={styles.quantityButton}
                                >
                                    −
                                </button>

                                <div className={styles.quantityDisplay}>
                                    {quantity}
                                </div>

                                <button
                                    onClick={incrementQuantity}
                                    className={styles.quantityButton}
                                >
                                    +
                                </button>

                            </div>

                            <div className={styles.totalPrice}>
                                {totalPrice} DH
                            </div>

                        </div>

                        {errors.balance && (
                            <p className="text-red-500 text-sm">
                                {errors.balance[0]}
                            </p>
                        )}

                        {errors.form && (
                            <p className="text-red-500 text-sm">
                                {errors.form}
                            </p>
                        )}

                        {errors.terms && (
                            <p className="text-red-500 text-sm">
                                {errors.terms}
                            </p>
                        )}

                        <label className={styles.termsContainer}>

                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={() => setAcceptedTerms(!acceptedTerms)}
                            />

                            <span className={styles.termsText}>
                                J'accepte les conditions générales de vente
                            </span>

                        </label>

                        <button
                            className={styles.continueButton}
                            onClick={handlePurchase}
                            disabled={processing || !selectedType}
                        >

                            {processing
                                ? 'Transaction en cours...'
                                : `Confirmer et payer ${totalPrice} DH`
                            }

                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}