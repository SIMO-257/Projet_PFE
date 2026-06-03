import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const TicketHistoryCard = ({
    ticketName: nameProp,
    price = '0.00 DH',
    date: dateProp,
    status = 'active', // 'active' | 'validated' | 'expired' | 'used'
    onClick = null
}) => {
    const { t } = useTranslation();
    const ticketName = nameProp || t('ticket_name_default');
    const date = dateProp || t('date_default');
    const normalizedStatus = String(status || '').toLowerCase();

    const getStatusColor = () => {
        switch (normalizedStatus) {
            case 'active':
            case 'validated':
                return 'text-green-400';
            case 'expired':
                return 'text-red-400';
            case 'used':
                return 'text-yellow-400';
            default:
                return 'text-white/60';
        }
    };

    const getStatusBgColor = () => {
        switch (normalizedStatus) {
            case 'active':
            case 'validated':
                return 'bg-green-500/20';
            case 'expired':
                return 'bg-red-500/20';
            case 'used':
                return 'bg-yellow-500/20';
            default:
                return 'bg-white/10';
        }
    };

    const getStatusLabel = () => {
        switch (normalizedStatus) {
            case 'active':
                return t('status_active');
            case 'validated':
                return t('validated');
            case 'expired':
                return t('status_expired');
            case 'used':
                return t('used');
            default:
                return status || t('status_unknown');
        }
    };

    const getStatusIcon = () => {
        switch (normalizedStatus) {
            case 'active':
            case 'validated':
                return (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                );
            case 'expired':
                return (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                );
            case 'used':
                return (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                );
            default:
                return null;
        }
    };

    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <div 
            onClick={handleClick}
            className={`bg-[#1a1a1a]/50 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-center space-x-4">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusBgColor()}`}>
                    {getStatusIcon()}
                </div>

                {/* Ticket Info */}
                <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">
                        {ticketName}
                    </h4>
                    <p className="text-white/50 text-xs">
                        {date}
                    </p>
                </div>

                {/* Price and Status */}
                <div className="text-right flex-shrink-0">
                    <p className="text-lg font-semibold text-white mb-1">
                        {price}
                    </p>
                    <p className={`text-xs font-semibold uppercase ${getStatusColor()}`}>
                        {getStatusLabel()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketHistoryCard;
