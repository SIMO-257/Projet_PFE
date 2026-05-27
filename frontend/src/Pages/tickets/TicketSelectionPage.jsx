import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchTicketTypes, purchaseTicket } from '../../services/ticketService';

export default function TicketSelectionPage() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();
    const { selectedTypeId } = location.state || {};

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

    const handlePurchase = async () => {

        if (!selectedType) return;

        if (!acceptedTerms) {
            setErrors({ terms: t('must_accept_terms_cgv') });
            return;
        }

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

    if (loading) {
        return (
            <div className="app-shell flex items-center justify-center">
                <p className="text-[#f5d579] font-bold text-lg animate-pulse">{t('loading')}</p>
            </div>
        );
    }

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
                                            <span className="text-[#f5d579] font-bold text-xl">{(type.effective_price || type.price)} {t('currency')}</span>
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
                                        <div className="text-[#f5d579] font-bold text-2xl">{totalPrice} {t('currency')}</div>
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
                            
                            {errors.terms && (
                                <p className="text-red-400 text-sm font-medium bg-red-900/40 p-5 rounded-2xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                    {errors.terms}
                                </p>
                            )}

                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-6 md:p-8 border-t border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                        <div className="max-w-3xl mx-auto">
                            <label className="flex items-start gap-3 cursor-pointer select-none mb-6">
                                <div className="relative flex items-center mt-0.5 z-0">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={() => setAcceptedTerms(!acceptedTerms)}
                                        className={`w-5 h-5 rounded border-2 appearance-none cursor-pointer transition-all ${acceptedTerms ? 'bg-[#f5d579] border-[#f5d579]' : 'bg-transparent border-[#f5d579]/40'}`}
                                    />
                                    {acceptedTerms && (
                                        <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-[#260101] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm leading-tight ${acceptedTerms ? 'text-white' : 'text-white/60'}`}>
                                    {t('accept_terms_cgv')}
                                </span>
                            </label>

                            <button
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all ${processing || !selectedType ? 'bg-[#f5d579]/10 text-[#f5d579]/30 cursor-not-allowed' : 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-xl shadow-[#f5d579]/20 hover:scale-[1.02] active:scale-95'}`}
                                onClick={handlePurchase}
                                disabled={processing || !selectedType}
                            >
                                {processing ? t('transaction_in_progress') : t('confirm_pay_amount', { amount: `${totalPrice} ${t('currency')}` })}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
