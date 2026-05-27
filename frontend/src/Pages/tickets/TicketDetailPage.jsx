import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchTicketDetails } from '../../services/ticketService';
import { CheckCircle, Ticket, Calendar, ShieldCheck, RefreshCcw } from 'lucide-react';
import Header from '../../Components/Layout/Header';

export default function TicketDetailPage() {
    const { t, language } = useTranslation();
    const { id: uuid } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const data = await fetchTicketDetails(uuid);
                if (data) {
                    setTicket(data);
                } else {
                    setError(t('no_ticket_found'));
                }
            } catch (err) {
                console.error('Failed to fetch ticket details', err);
                setError(t('ticket_not_found_error'));
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            loadTicket();
        }
    }, [uuid]);

    const goBack = () => navigate('/my-tickets');

    if (loading) {
        return (
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-card items-center justify-center">
                        <p className="text-white text-center">{t('loading_details')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-card bg-[#400106]/90 p-8 text-center justify-center">
                        <p className="text-red-400 mb-6">{error || t('unknown_error')}</p>
                        <button onClick={goBack} className="text-yellow-500 font-medium">{t('back_to_my_tickets')}</button>
                    </div>
                </div>
            </div>
        );
    }

    const locale = language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR';
    const validUntil = new Date(ticket.valid_until).toLocaleString(locale, {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const purchaseDate = new Date(ticket.created_at).toLocaleString(locale, {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="app-shell">
            <div className="app-frame">
                <div className="app-card relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">

                <Header title={t('ticket_details')} showBackButton={true} onBack={goBack} />

                <div className="app-content p-6 pb-12 custom-scrollbar">

                    <div className={`flex items-center space-x-3 p-4 rounded-2xl mb-6 ${ticket.status === 'active' || ticket.status === 'validated' ? 'bg-green-500/10 border border-green-500/20' : (ticket.status === 'used' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-red-500/10 border border-red-500/20')}`}>
                        <CheckCircle size={24} className={ticket.status === 'active' || ticket.status === 'validated' ? 'text-green-500' : (ticket.status === 'used' ? 'text-yellow-500' : 'text-red-500')} />
                        <div>
                            <p className={`font-bold ${ticket.status === 'active' || ticket.status === 'validated' ? 'text-green-500' : (ticket.status === 'used' ? 'text-yellow-500' : 'text-red-500')}`}>
                                {ticket.status === 'active' ? t('ticket_valid_status') : (ticket.status === 'validated' ? t('validated') : (ticket.status === 'used' ? t('ticket_used_status') : t('ticket_expired_status')))}
                            </p>
                            <p className="text-white/60 text-xs">{t('valid_until_label', { date: validUntil })}</p>
                        </div>
                    </div>

                    <div className="space-y-4 bg-black/20 rounded-2xl p-4 border border-white/5">
                        <DetailRow icon={<Ticket size={18} />} label={t('ticket_type')} value={ticket.ticket_type?.name} />
                        <DetailRow icon={<ShieldCheck size={18} />} label={t('ticket_unique_id_label')} value={ticket.uuid.substring(0, 18).toUpperCase() + '...'} />
                        <DetailRow icon={<Calendar size={18} />} label={t('purchase_date')} value={purchaseDate} />
                        {!ticket.ticket_type?.is_reusable && ticket.remaining_uses !== undefined && (
                            <DetailRow icon={<RefreshCcw size={18} />} label={t('remaining_uses_label')} value={ticket.remaining_uses} />
                        )}
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                            <span className="text-white/40 text-sm">{t('price_paid_label')}</span>
                            <span className="text-yellow-500 font-bold text-lg">{ticket.price_paid} {t('currency')}</span>
                        </div>
                    </div>

                    <p className="text-white/30 text-[10px] text-center mt-8 px-6">
                        {t('ticket_disclaimer')}
                    </p>
                </div>
              </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="text-yellow-500/60">{icon}</div>
                <span className="text-white/60 text-sm">{label}</span>
            </div>
            <span className="text-white text-sm font-medium">{value}</span>
        </div>
    );
}
