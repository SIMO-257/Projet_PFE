import React from 'react';
import styles from '../../Styles/Ticket.module.css';
import CardButton from '../Buttons/CardButton';
import { useTranslation } from '../../hooks/useTranslation';

const TicketCard = ({ 
    item, 
    onAction, 
    variant = 'active', // 'active' | 'purchase'
    statusBadgeClass = ''
}) => {
    const { t } = useTranslation();
    const isPurchase = variant === 'purchase';

    return (
        <div className={`${styles.ticketCard} ${!isPurchase ? styles.activeTicket : ''}`}>
            <div className={styles.ticketTop}>
                <div className={styles.ticketHeaderRow}>
                    <div className={styles.ticketTitleSection}>
                        <span className={styles.ticketIcon}>🎫</span>
                        <div>
                            <h2 className={styles.ticketTitle}>{item.title}</h2>
                            <p className={styles.ticketDescription}>{item.description}</p>
                        </div>
                    </div>
                    <span className={`${styles.statusBadge} ${isPurchase ? styles.inactiveBadge : styles.activeBadge} ${statusBadgeClass}`}>
                        {item.status}
                    </span>
                </div>
            </div>

            <div className={styles.ticketDetails}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('price')}</span>
                    <span className={styles.priceValue}>{item.price}</span>
                </div>

                {!isPurchase && item.validInfo && (
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{item.validInfo}</span>
                        <span className={styles.detailValue}>{item.validTime}</span>
                    </div>
                )}
            </div>

            <CardButton 
                active={item.isActive ?? true} 
                btnText={item.buttonText} 
                method={onAction} 
            />
        </div>
    );
};

export default TicketCard;
