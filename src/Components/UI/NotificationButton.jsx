import React from 'react';
import styles from '../../styles/HomeScreen.module.css';

const NotificationButton = ({ onClick, hasNotifications = false }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        // Add visual feedback
        const button = e.currentTarget;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    };

    return (
        <button 
            onClick={handleClick}
            className={styles.notificationButton}
        >
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {hasNotifications && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a1a]"></div>
            )}
        </button>
    );
};

export default NotificationButton;