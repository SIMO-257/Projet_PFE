import { useState } from 'react';
import styles from '../../Styles/PaimentHistory.module.css';
import NavBar from '../../Components/NavBar/NavBar';

export default function PaimentHistory () {
    // State for active filters
    const [activeTab, setActiveTab] = useState('all');
    const [activeDateFilter, setActiveDateFilter] = useState('today');

    // Filter options
    const tabs = [
        { id: 'all', label: 'Tous' },
        { id: 'active', label: 'Actifs' },
        { id: 'used', label: 'Utilisés' },
        { id: 'expired', label: 'Expirés' }
    ];

    const dateFilters = [
        { id: 'today', label: "Aujourd'hui" },
        { id: 'week', label: 'Cette semaine' },
        { id: 'all', label: 'Tous les billets' }
    ];

    // Statistics data
    const statistics = {
        spentThisMonth: '127,50 €',
        spentTrend: '+12%',
        tripsThisMonth: '24'
    };

    // Ticket data organized by date
    const ticketsByDate = [
        {
            date: "Aujourd'hui",
            dateKey: 'today',
            tickets: [
                {
                    id: 1,
                    type: 'Billet Unitaire',
                    price: '8 DH',
                    dateTime: '27 Jan 2026, 14:30',
                    validity: 'Valide jusqu\'à 18:30',
                    status: 'valid'
                },
                {
                    id: 2,
                    type: 'Pass Mensuel',
                    price: '230 DH',
                    dateTime: '01 Jan 2026, 08:15',
                    validity: 'Valide tout le mois',
                    expiry: 'Expire le 31 Jan',
                    status: 'valid'
                }
            ]
        },
        {
            date: 'Hier',
            dateKey: 'yesterday',
            tickets: [
                {
                    id: 3,
                    type: 'Billet Journalier',
                    price: '60 DH',
                    dateTime: '26 Jan 2026, 07:45',
                    usage: 'Utilisé 3 fois',
                    status: 'used'
                },
                {
                    id: 4,
                    type: 'Billet Unitaire',
                    price: '8 DH',
                    dateTime: '29 Jan 2026, 18:20',
                    status: 'used'
                }
            ]
        },
        {
            date: '25 Janvier 2026',
            dateKey: 'jan25',
            tickets: [
                {
                    id: 5,
                    type: 'Billet Unitaire',
                    price: '8 DH',
                    dateTime: '25 Jan 2026, 16:45',
                    status: 'expired'
                }
            ]
        }
    ];

    // Status text mapping
    const getStatusText = (status) => {
        switch (status) {
            case 'valid': return 'Actif';
            case 'used': return 'Utilisé';
            case 'expired': return 'Expiré';
            default: return '';
        }
    };

    // Status style mapping
    const getStatusStyle = (status) => {
        switch (status) {
            case 'valid': return styles.statusValid;
            case 'used': return styles.statusUsed;
            case 'expired': return styles.statusExpired;
            default: return '';
        }
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <h1 className={styles.mainTitle}>Historique</h1>
                        <div className={styles.headerActions}>
                            <button className={styles.iconButton}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                                    <path d="m21 21-4.35-4.35" strokeWidth="2"/>
                                </svg>
                            </button>
                            <button className={styles.iconButton}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/>
                                    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2"/>
                                    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Filter Tabs */}
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

                    {/* Date Filters */}
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

                {/* Statistics Section */}
                <section className={styles.statisticsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Statistiques du mois</h2>
                        <button className={styles.expandButton}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className={styles.statsGrid}>
                        {/* Money spent */}
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Dépensé ce mois</div>
                                <div className={styles.statValue}>{statistics.spentThisMonth}</div>
                                <div className={`${styles.statTrend} ${statistics.spentTrend.includes('+') ? '' : styles.negative}`}>
                                    {statistics.spentTrend} vs mois dernier
                                </div>
                            </div>
                        </div>

                        {/* Trips */}
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="1" y="3" width="15" height="13" rx="2" strokeWidth="2"/>
                                    <path d="m16 8 2-2 2 2" strokeWidth="2"/>
                                    <path d="M18 6v6" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Trajets effectués</div>
                                <div className={styles.statValue}>{statistics.tripsThisMonth}</div>
                                <div className={styles.statSubLabel}>Ce mois</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tickets List */}
                {ticketsByDate.map(day => (
                    <section key={day.dateKey} className={styles.daySection}>
                        <h3 className={styles.dayHeader}>{day.date}</h3>
                        <div className={styles.ticketList}>
                            {day.tickets.map(ticket => (
                                <div key={ticket.id} className={styles.ticketCard}>
                                    <div className={styles.ticketHeader}>
                                        <div className={styles.ticketIcon}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <rect x="2" y="7" width="20" height="15" rx="2" strokeWidth="2"/>
                                                <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" strokeWidth="2"/>
                                            </svg>
                                        </div>
                                        <div className={styles.ticketInfo}>
                                            <div className={styles.ticketType}>{ticket.type}</div>
                                            <div className={styles.ticketDate}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                                    <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                                                </svg>
                                                {ticket.dateTime}
                                            </div>
                                        </div>
                                        <div className={styles.ticketPrice}>{ticket.price}</div>
                                    </div>
                                    
                                    {/* Additional details */}
                                    {(ticket.validity || ticket.usage || ticket.expiry) && (
                                        <div className={styles.ticketDetails}>
                                            {ticket.validity && (
                                                <span className={styles.detailText}>{ticket.validity}</span>
                                            )}
                                            {ticket.usage && (
                                                <span className={styles.detailText}>{ticket.usage}</span>
                                            )}
                                            {ticket.expiry && (
                                                <span className={styles.detailText}>{ticket.expiry}</span>
                                            )}
                                        </div>
                                    )}
                                    
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
                ))}
                
            </div>
            <NavBar/>
        </div>
        
    );
};