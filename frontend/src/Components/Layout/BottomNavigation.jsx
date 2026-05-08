import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NavButton from '../Buttons/NavButton';
import styles from '../../Styles/HomeScreen.module.css';
import { fetchUnreadCount } from '../../Redux/Slices/notificationSlice';
import { useTranslation } from '../../hooks/useTranslation';

const BottomNavigation = ({ onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const unreadCount = useSelector(state => state.notifications.unreadCount);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/home')) return 'home';
        if (path.startsWith('/mytickets') || path.startsWith('/viewticket')) return 'tickets';
        if (path.startsWith('/wallet')) return 'wallet';
        if (path.startsWith('/profile') || path.startsWith('/edit-profile') || path.startsWith('/settings')) return 'profile';
        return '';
    };

    const activeTab = getActiveTab();

    const handleNavigate = (id) => {
        if (onNavigate) {
            onNavigate(id);
            return;
        }

        switch (id) {
            case 'home': navigate('/home'); break;
            case 'tickets': navigate('/mytickets'); break;
            case 'validation': navigate('/validation'); break;
            case 'wallet': navigate('/wallet'); break;
            case 'profile': navigate('/profile'); break;
            default: break;
        }
    };

    const navItems = [
        { id: 'home', label: t('home'), icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
        )},
        { id: 'tickets', label: 'Ticket', icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/>
            </svg>
        )},

        { id: 'validation', label: 'Valid', icon: (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
        ), isCenter: true },
        { id: 'wallet', label: t('wallet'), icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
        )},
        { id: 'profile', label: t('profile'), icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
        )}
    ];

    return (
        <div className={styles.bottomNav}>
            <div className="flex items-center justify-around">
                {navItems.map((item) => (
                    <NavButton
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.id}
                        onClick={() => handleNavigate(item.id)}
                        isCenter={item.isCenter}
                    />
                ))}
            </div>
        </div>
    );
};

export default BottomNavigation;
