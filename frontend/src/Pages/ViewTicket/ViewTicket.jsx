import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTicketDetails } from '../../services/clientService';
import { ArrowLeft, CheckCircle, Ticket, Clock, Calendar, ShieldCheck } from 'lucide-react';
import Header from '../../Components/Layout/Header';
import styles from '../../Styles/ViewTicket.module.css';

export default function ViewTicket() {
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
                    setError("Billet non trouvé.");
                }
            } catch (err) {
                console.error("Failed to fetch ticket details", err);
                setError("Billet non trouvé ou erreur de connexion.");
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            loadTicket();
        }
    }, [uuid]);

    const goBack = () => navigate('/mytickets');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
                <p className="text-white text-center">Chargement des détails...</p>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#400106]/90 p-8 rounded-3xl border border-yellow-500/20 text-center">
                    <p className="text-red-400 mb-6">{error || "Erreur inconnue."}</p>
                    <button onClick={goBack} className="text-yellow-500 font-medium">Retour à mes billets</button>
                </div>
            </div>
        );
    }

    const validUntil = new Date(ticket.valid_until).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const purchaseDate = new Date(ticket.created_at).toLocaleString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
                
                <Header title="Détails du Billet" showBackButton={true} onBack={goBack} />

                <div className="p-6 pb-12 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
                    
                    {/* Status Banner */}
                    <div className={`flex items-center space-x-3 p-4 rounded-2xl mb-6 ${ticket.status === 'active' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <CheckCircle size={24} className={ticket.status === 'active' ? 'text-green-500' : 'text-red-500'} />
                        <div>
                            <p className={`font-bold ${ticket.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                {ticket.status === 'active' ? 'BILLET VALIDE' : 'BILLET EXPIRÉ'}
                            </p>
                            <p className="text-white/60 text-xs">Jusqu'au {validUntil}</p>
                        </div>
                    </div>

                    {/* Ticket Details List */}
                    <div className="space-y-4 bg-black/20 rounded-2xl p-4 border border-white/5">
                        <DetailRow icon={<Ticket size={18} />} label="Type de Billet" value={ticket.ticket_type?.name_fr} />
                        <DetailRow icon={<ShieldCheck size={18} />} label="ID Unique" value={ticket.uuid.substring(0, 18).toUpperCase() + '...'} />
                        <DetailRow icon={<Calendar size={18} />} label="Date d'Achat" value={purchaseDate} />
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                            <span className="text-white/40 text-sm">Prix payé</span>
                            <span className="text-yellow-500 font-bold text-lg">{ticket.price_paid} DH</span>
                        </div>
                    </div>

                    <p className="text-white/30 text-[10px] text-center mt-8 px-6">
                        Ce billet est personnel et non transmissible. En cas de contrôle, présentez votre QR Code ainsi qu'une pièce d'identité si nécessaire.
                    </p>
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

