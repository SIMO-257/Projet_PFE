import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTransactionHistory } from '../../services/clientService';
import styles from '../../Styles/PaimentHistory.module.css';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import TransactionItem from '../../Components/Cards/TransactionItem';

export default function PaimentHistory() {
    const navigate = useNavigate();
    const [activeDateFilter, setActiveDateFilter] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const res = await fetchTransactionHistory();
                setTransactions(res || []);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const dateFilters = [
        { id: 'today', label: "Aujourd'hui" },
        { id: 'week', label: 'Cette semaine' },
        { id: 'all', label: 'Tout' },
    ];

    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const parseTxDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            // Normalize "YYYY-MM-DD HH:mm:ss" into ISO-like local datetime
            const normalized = value.includes('T') ? value : value.replace(' ', 'T');
            const parsed = new Date(normalized);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const filteredTransactions = safeTransactions.filter((t) => {
        const txDate = parseTxDate(t.created_at);
        if (!txDate) return false;
        const now = new Date();

        if (activeDateFilter === 'today') {
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const endOfToday = new Date(now);
            endOfToday.setHours(23, 59, 59, 999);
            return txDate >= startOfToday && txDate <= endOfToday;
        }
        if (activeDateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return txDate >= weekAgo;
        }

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(now.getDate() - 14);
        return txDate >= twoWeeksAgo;
    });

    const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
        const txDate = parseTxDate(tx.created_at);
        const date = (txDate || new Date()).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const today = new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const groupTitle = date === today ? "Aujourd'hui" : date;

        if (!groups[groupTitle]) groups[groupTitle] = [];
        groups[groupTitle].push(tx);
        return groups;
    }, {});

    const stats = {
        spent: filteredTransactions
            .filter((t) => t.type !== 'recharge')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
            .toFixed(2),
        count: filteredTransactions.length,
    };

    const mappedTransactions = (list) =>
        list.map((t) => {
            const isPositive = t.type === 'recharge';
            return {
                id: t.id,
                title: t.reference || (isPositive ? 'Rechargement portefeuille' : 'Achat de billet'),
                date: (parseTxDate(t.created_at) || new Date()).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                amount: `${isPositive ? '+' : '-'}${parseFloat(t.amount || 0).toFixed(2)} DH`,
                isPositive,
                icon: isPositive ? 'plus' : 'ticket',
            };
        });

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/wallet');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="relative rounded-3xl shadow-2xl border border-yellow-500/20 overflow-hidden bg-gradient-to-br from-[#400106]/90 to-[#260101]/90 backdrop-blur-sm">
                    <div className="max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar px-6 pb-24">
                        <header className={styles.header}>
                            <div className={styles.headerTop}>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h1 className={styles.mainTitle}>Historique</h1>
                                <div className="w-10"></div>
                            </div>

                            <div className={styles.dateFilters}>
                                {dateFilters.map((filter) => (
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
                                        <div className={styles.statLabel}>Total transactions</div>
                                        <div className={styles.statValue}>{stats.count}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {loading ? (
                            <p className="text-white text-center py-10">Chargement...</p>
                        ) : (
                            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                                <section key={date} className={styles.daySection}>
                                    <h3 className={styles.dayHeader}>{date}</h3>
                                    <div className={styles.ticketList}>
                                        {mappedTransactions(dayTransactions).map((tx) => (
                                            <TransactionItem
                                                key={tx.id}
                                                title={tx.title}
                                                date={tx.date}
                                                amount={tx.amount}
                                                isPositive={tx.isPositive}
                                                icon={tx.icon}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                        {!loading && filteredTransactions.length === 0 && (
                            <p className="text-white/50 text-center py-10">Aucune transaction trouvée</p>
                        )}
                    </div>
                    <BottomNavigation />
                </div>
            </div>
        </div>
    );
}
