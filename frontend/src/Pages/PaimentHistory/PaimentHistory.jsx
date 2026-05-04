import { useState, useEffect } from 'react';
import { fetchMyTickets } from '../../services/clientService';
import styles from '../../Styles/PaimentHistory.module.css';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import { getClientUuid } from '../../services/clientService';

export default function PaimentHistory () {
    const [activeTab, setActiveTab] = useState('all');
    const [activeDateFilter, setActiveDateFilter] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
<<<<<<< HEAD
            const uuid = getClientUuid();
            if (!uuid) return;

=======
>>>>>>> 110b8f3fa71656180ae4f0799404b59fdf5310e6
            try {
                setLoading(true);
                const res = await fetchMyTickets();
                setTickets(res || []);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const tabs = [
        { id: 'all', label: 'Tous' },
        { id: 'active', label: 'Actifs' },
        { id: 'used', label: 'Utilisés' },
        { id: 'expired', label: 'Expirés' }
    ];

    const dateFilters = [
        { id: 'today', label: "Aujourd'hui" },
        { id: 'week', label: 'Cette semaine' },
        { id: 'all', label: 'Tout' }
    ];

    const getValidity = (ticket) => {
        if (!ticket.ticket_type) return "1 trajet";
        const code = ticket.ticket_type.code;
        if (code === 'BILLET_SIMPLE') return "1 trajet";
        if (code === 'CARTE_NORMALE') return "2 trajets";
        if (code === 'BILLET_SEMAINE') return "Illimité (7j)";
        if (code === 'BILLET_MOIS') return "Illimité (30j)";
        return "1 trajet";
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'used': return 'Utilisé';
            case 'expired': return 'Expiré';
            default: return status;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return styles.statusValid;
            case 'used': return styles.statusUsed;
            case 'expired': return styles.statusExpired;
            default: return '';
        }
    };

    const safeTickets = Array.isArray(tickets) ? tickets : [];

    const filteredTickets = safeTickets.filter(t => {
        if (activeTab !== 'all' && t.status !== activeTab) return false;
        
        const ticketDate = new Date(t.created_at);
        const now = new Date();
        
        if (activeDateFilter === 'today') {
            return ticketDate.toDateString() === now.toDateString();
        }
        if (activeDateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return ticketDate >= weekAgo;
        }
        return true;
    });

    const groupedTickets = filteredTickets.reduce((groups, ticket) => {
        const date = new Date(ticket.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const today = new Date().toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const groupTitle = date === today ? "Aujourd'hui" : date;
        
        if (!groups[groupTitle]) groups[groupTitle] = [];
        groups[groupTitle].push(ticket);
        return groups;
    }, {});

    const stats = {
        spent: tickets.reduce((sum, t) => sum + parseFloat(t.price_paid), 0).toFixed(2),
        count: tickets.length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden 
                    bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
                    
                    <div className="max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar px-6 pb-24">
                        <header className={styles.header}>
                            <div className={styles.headerTop}>
                                <h1 className={styles.mainTitle}>Historique</h1>
                            </div>
                            
                            <div className={styles.filterTabs}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.dateFilters}>
                                {dateFilters.map(filter => (
                                    <button
                                        key={filter.id}
                                        className={`${styles.dateFilter} ${activeDateFilter === filter.id ? styles.dateFilterActive : ''}`}
                                        onClick={() => setActiveDateFilter(filter.id)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <section className={styles.statisticsSection}>
                            <h2 className={styles.sectionTitle}>Résumé</h2>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Total dépensé</div>
                                        <div className={styles.statValue}>{stats.spent} DH</div>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Total billets</div>
                                        <div className={styles.statValue}>{stats.count}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {loading ? (
                            <p className="text-white text-center py-10">Chargement...</p>
                        ) : (
                            Object.entries(groupedTickets).map(([date, dayTickets]) => (
                                <section key={date} className={styles.daySection}>
                                    <h3 className={styles.dayHeader}>{date}</h3>
                                    <div className={styles.ticketList}>
                                        {dayTickets.map(ticket => (
                                            <div key={ticket.uuid} className={styles.ticketCard}>
                                                <div className={styles.ticketHeader}>
                                                    <div className={styles.ticketIcon}>🎫</div>
                                                    <div className={styles.ticketInfo}>
                                                        <div className={styles.ticketType}>{ticket.ticket_type?.name_fr || "Billet"}</div>
                                                        <div className={styles.ticketDate}>
                                                            {new Date(ticket.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <div className={styles.ticketPrice}>{ticket.price_paid} DH</div>
                                                </div>
                                                <div className={styles.ticketDetails}>
                                                    <span className={styles.detailText}>{getValidity(ticket)}</span>
                                                </div>
                                                <div className={styles.ticketFooter}>
                                                    <div className={`${styles.ticketStatus} ${getStatusStyle(ticket.status)}`}>
                                                        <span className={styles.statusDot}></span>
                                                        {getStatusText(ticket.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                        {(!loading && filteredTickets.length === 0) && (
                            <p className="text-white/50 text-center py-10">Aucun billet trouvé</p>
                        )}
                    </div>
                    <BottomNavigation />
                </div>
            </div>
        </div>
    );
};
