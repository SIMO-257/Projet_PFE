import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchTicketTypes, purchaseTicket } from '../../services/ticketService';
import usePinGuard from '../../hooks/usePinGuard';

export default function TicketSelectionPage() {
    const { t, language } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();
    const { selectedTypeId } = location.state || {};

    const [ticketTypes, setTicketTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { checking: pinChecking, isPinEnabled } = usePinGuard();

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await fetchTicketTypes();
                let types = (res || []).filter(t => t.code !== 'CARTE_RECHARGE');

                if (selectedTypeId) {
                    const found = types.find(t => t.id === selectedTypeId);
                    if (found) {
                        types = [found];
                        setSelectedType(found);
                    }
                } else if (types.length > 0) {
                    setSelectedType(types[0]);
                }

                setTicketTypes(types);

            } catch (err) {
                console.error('Failed to fetch ticket types', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();

    }, [selectedTypeId]);

    useEffect(() => {
        if (selectedType?.is_reusable) {
            setQuantity(1);
        }
    }, [selectedType]);

    const incrementQuantity = () => setQuantity(prev => prev < 10 ? prev + 1 : prev);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : prev);

    const handlePurchase = () => {
        if (!selectedType || processing) return;
        setShowConfirmModal(true);
    };

    const handleConfirmPurchase = async () => {
        setShowConfirmModal(false);
        setProcessing(true);
        setErrors({});

        try {
            const payload = {
                ticket_type_id: selectedType.id,
                quantity: selectedType.is_reusable ? 1 : quantity
            };

            const res = await purchaseTicket(payload);

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
                    form: err?.response?.data?.message || t('purchase_failed')
                });
            }

        } finally {
            setProcessing(false);
        }
    };

    if (loading || pinChecking) {
        return (
            <div className="app-shell flex items-center justify-center">
                <p className="text-[#f5d579] font-bold text-lg animate-pulse">{t('loading')}</p>
            </div>
        );
    }

    // If PIN is enabled, show a locked screen — feature is unavailable
    if (isPinEnabled) {
        return (
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-card bg-gradient-to-br from-[#400106] to-[#260101] relative flex flex-col h-[100dvh]">
                        <div className="p-6 md:p-8 border-b border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-[#f5d579]">
                                    {t('select_ticket_page')}
                                </h1>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <span className="text-4xl font-light line-height-1">×</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-[#f5d579]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <h2 className="text-[#f5d579] font-bold text-xl mb-2">Fonctionnalité verrouillée</h2>
                            <p className="text-white/50 text-sm max-w-xs">
                                La protection PIN est activée. Désactivez-la dans Paramètres &gt; Sécurité pour accéder à l'achat de tickets.
                            </p>
                            <button
                                onClick={() => navigate('/settings')}
                                className="mt-8 px-6 py-3 rounded-2xl bg-[#f5d579]/10 border border-[#f5d579]/30 text-[#f5d579] font-medium text-sm hover:bg-[#f5d579]/20 transition-all"
                            >
                                Aller aux paramètres
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        if (minutes % 1440 === 0) {
            const days = minutes / 1440;
            if (language === 'ar') {
                if (days === 1) return 'المدة: يوم واحد';
                if (days === 2) return 'المدة: يومين';
                if (days >= 3 && days <= 10) return `المدة: ${days} أيام`;
                return `المدة: ${days} يوماً`;
            } else if (language === 'en') {
                return `Duration: ${days} ${days === 1 ? 'day' : 'days'}`;
            } else {
                return `Durée: ${days} ${days === 1 ? 'jour' : 'jours'}`;
            }
        }
        if (language === 'ar') {
            return `المدة: ${minutes} دقيقة`;
        } else if (language === 'en') {
            return `Duration: ${minutes} min`;
        } else {
            return `Durée: ${minutes} min`;
        }
    };

    const totalPrice = selectedType ? ((selectedType.effective_price || selectedType.price) * quantity).toFixed(2) : 0;

    return (
        <div className="app-shell font-sora">
            <div className="app-frame">
                <div className="app-card bg-gradient-to-br from-[#400106] to-[#260101] relative flex flex-col h-[100dvh]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#f5d579]">
                                {t('select_ticket_page')}
                            </h1>
                            <button 
                                onClick={() => navigate('/home')}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <span className="text-4xl font-light line-height-1">×</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="app-content p-6 md:p-8 space-y-8 scroll-smooth relative">
                        <style>{`
                            div::-webkit-scrollbar { width: 4px; }
                            div::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                            div::-webkit-scrollbar-thumb { background-color: #f5d579; border-radius: 10px; }
                        `}</style>
                        <div className="max-w-3xl mx-auto space-y-8">

                            <h3 className="text-white/80 text-lg font-medium mb-4">
                                {t('choose_ticket_type')}
                            </h3>
                            
                            <div className="grid gap-4">
                                {ticketTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                                            selectedType?.id === type.id 
                                            ? 'bg-[#f5d579]/10 border-[#f5d579] shadow-[0_0_20px_rgba(245,213,121,0.15)] scale-[1.01]' 
                                            : 'bg-black/20 border-[#f5d579]/20 hover:border-[#f5d579]/50 hover:bg-black/40'
                                        }`}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-white font-bold text-lg">{type.name}</span>
                                            <span className="text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text font-extrabold text-xl">{(type.effective_price || type.price)} {t('currency')}</span>
                                        </div>
                                        <p className="text-white/60 text-sm leading-relaxed">{type.description}</p>
                                    </div>
                                ))}
                            </div>

                            {!selectedType?.is_reusable && (
                                <div className="p-6 rounded-2xl bg-black/20 border border-[#f5d579]/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={decrementQuantity}
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-[#f5d579]/30 text-[#f5d579] font-bold flex items-center justify-center hover:bg-[#f5d579]/10 active:scale-95 transition-all text-xl"
                                        >
                                            -
                                        </button>
                                        <span className="text-white font-bold text-xl w-8 text-center">{quantity}</span>
                                        <button 
                                            onClick={incrementQuantity}
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-[#f5d579]/30 text-[#f5d579] font-bold flex items-center justify-center hover:bg-[#f5d579]/10 active:scale-95 transition-all text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text font-extrabold text-2xl">{totalPrice} {t('currency')}</div>
                                    </div>
                                </div>
                            )}

                            {/* Ticket Type Description Card */}
                            {selectedType && selectedType.description && (
                                <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-[#f5d579]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                            <h4 className="text-[#f5d579] font-semibold text-sm uppercase tracking-wider">
                                                {language === 'ar' ? 'وصف التذكرة' : language === 'en' ? 'Ticket Details' : "Détails du billet"}
                                            </h4>
                                        </div>
                                        <p className="text-white/70 text-sm leading-relaxed">
                                            {selectedType.description}
                                        </p>
                                        {selectedType.duration_minutes && (
                                            <div className="mt-3 pt-3 border-t border-[#f5d579]/10 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-[#f5d579]/60" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                                </svg>
                                                <span className="text-white/60 text-xs">
                                                    {formatDuration(selectedType.duration_minutes)}
                                                </span>
                                            </div>
                                        )}
                                        {selectedType.effective_price && selectedType.effective_price !== selectedType.price && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                </svg>
                                                <span className="text-green-400 text-xs font-medium">
                                                    {language === 'ar' ? `خصم الطالب` : language === 'en' ? 'Student discount applied' : 'Tarif étudiant appliqué'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {errors.balance && (
                                <div className="bg-red-900/40 border border-red-500/50 rounded-2xl p-5 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                    <p className="text-red-400 text-sm mb-3 font-medium">
                                        {errors.balance[0]}
                                    </p>
                                    <button
                                        onClick={() => navigate('/recharge-payment')}
                                        className="text-[#f5d579] text-sm font-bold underline hover:text-white transition-colors"
                                    >
                                        {t('recharge_account_now')}
                                    </button>
                                </div>
                            )}

                            {errors.form && (
                                <p className="text-red-400 text-sm font-medium bg-red-900/40 p-5 rounded-2xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                    {errors.form}
                                </p>
                            )}
                            
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 md:p-8 border-t border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                        <div className="max-w-3xl mx-auto">
                            <button
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all ${processing || !selectedType ? 'bg-[#f5d579]/10 text-[#f5d579]/30 cursor-not-allowed' : 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-xl shadow-[#f5d579]/20 hover:scale-[1.02] active:scale-95'}`}
                                onClick={handlePurchase}
                                disabled={processing || !selectedType}
                            >
                                {processing ? t('transaction_in_progress') : t('confirm_pay_amount', { amount: `${totalPrice} ${t('currency')}` })}
                            </button>
                        </div>
                    </div>

                    {/* Confirmation Popup Modal */}
                    {showConfirmModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                            <div className="bg-gradient-to-br from-[#400106] to-[#260101] border border-[#f5d579]/30 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative animate-countUp">
                                {/* Header icon */}
                                <div className="mx-auto w-16 h-16 rounded-full bg-[#f5d579]/10 border border-[#f5d579]/20 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-[#f5d579]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>

                                {/* Title */}
                                <h2 className="text-[#f5d579] font-bold text-xl mb-4">
                                    {language === 'ar' ? 'ملخص الشراء' : language === 'en' ? 'Purchase Summary' : "Résumé de l'achat"}
                                </h2>

                                {/* Details */}
                                <div className="bg-black/30 border border-white/10 rounded-2xl p-4 mb-6 space-y-3 text-left">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60">{t('ticket_type')}</span>
                                        <span className="text-white font-semibold">{selectedType?.name}</span>
                                    </div>
                                    {!selectedType?.is_reusable && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/60">{language === 'ar' ? 'الكمية' : language === 'en' ? 'Quantity' : 'Quantité'}</span>
                                            <span className="text-white font-semibold">{quantity}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center">
                                        <span className="text-white/60 text-sm font-medium">{t('total_to_pay') || (language === 'ar' ? 'إجمالي الدفع' : language === 'en' ? 'Total to pay' : 'Total à payer')}</span>
                                        <span className="text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text font-extrabold text-lg">{totalPrice} {t('currency')}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleConfirmPurchase}
                                        className="w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                                    >
                                        {t('confirm')}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="w-full py-3 px-6 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
