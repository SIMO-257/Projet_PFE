import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    fetchNotifications, 
    markNotificationRead, 
    removeNotification, 
    fetchMoreNotifications,
    fetchUnreadCount,
    markAllNotificationsRead,
    setFilter
} from '../../Redux/Slices/notificationSlice';
import NotificationItem from '../../Components/notifications/NotificationItem';
import Header from '../../Components/Layout/Header';
import BottomNavigation from '../../Components/Layout/BottomNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../Styles/Notifications.module.css';

export default function Notifications() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { items, loading, loadingMore, pagination, activeFilter, unreadCount } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications(activeFilter));
        dispatch(fetchUnreadCount());
    }, [dispatch, activeFilter]);

    const handleRead = (id) => {
        dispatch(markNotificationRead(id));
    };

    const handleDelete = (id) => {
        dispatch(removeNotification(id));
    };

    const loadMore = () => {
        if (pagination.hasMore && !loadingMore) {
            dispatch(fetchMoreNotifications());
        }
    };

    const handleFilterChange = (filter) => {
        dispatch(setFilter(filter));
    };

    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            dispatch(markAllNotificationsRead());
        }
    };

    const filterOptions = [
        { key: 'all', label: t('all') },
        { key: 'validation', label: t('validation') },
        { key: 'payment', label: t('payment') },
        { key: 'security', label: t('security') },
        { key: 'promo', label: t('promo') },
        { key: 'system', label: t('system') },
    ];

    return (
        <div className="app-shell">
            <div className="app-frame">
                <div className="app-card bg-gradient-to-br from-[#400106]/95 to-[#260101]/95 overflow-hidden backdrop-blur-sm relative">
                    
                    <div className="pt-2">
                        <Header 
                            title={t('notifications')} 
                            showBackButton={true} 
                            onBack={() => navigate(-1)} 
                        />
                    </div>

                    {unreadCount > 0 && (
                        <div className="px-6 pb-2 flex items-center justify-between">
                            <span className="bg-yellow-500 text-[#400106] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} {t('new_notifications')}
                            </span>
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-yellow-500/80 text-[10px] font-bold uppercase tracking-widest hover:text-yellow-500"
                            >
                                {t('read_all')}
                            </button>
                        </div>
                    )}

                    <div className="px-4 py-2 border-b border-white/5">
                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => handleFilterChange(option.key)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                        activeFilter === option.key
                                            ? 'bg-yellow-500 text-[#400106]'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3 ${items.length > 0 ? 'pb-24' : 'pb-8'}`}>
                        {loading && items.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                </svg>
                                <p className="text-sm text-white">{t('no_notifications')}</p>
                            </div>
                        ) : (
                            <>
                                {items.map((notification) => (
                                    <NotificationItem 
                                        key={notification.id} 
                                        item={notification} 
                                        onRead={handleRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                {pagination.hasMore && (
                                    <button 
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="w-full py-4 text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em] rounded-2xl border border-yellow-500/10 hover:bg-yellow-500/5 transition-colors disabled:opacity-50"
                                    >
                                        Loading...
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {items.length > 0 && <BottomNavigation />}
                </div>
            </div>
        </div>
    );
}
