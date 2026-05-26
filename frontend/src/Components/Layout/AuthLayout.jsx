import React, { useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../Styles/Auth.module.css';

const AuthLayout = ({ 
    children, 
    title, 
    subtitle, 
    description, 
    footerText, 
    footerLinkText, 
    footerLinkTo,
    onSubmit
}) => {
    const navigate = useNavigate();
    const tapCountRef = useRef(0);
    const tapTimerRef = useRef(null);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (tapTimerRef.current) {
                clearTimeout(tapTimerRef.current);
            }
        };
    }, []);

    const handleTitleDoubleTap = useCallback(() => {
        tapCountRef.current += 1;

        if (tapCountRef.current === 1) {
            // First tap — start a timer
            tapTimerRef.current = setTimeout(() => {
                tapCountRef.current = 0;
            }, 400); // 400ms window for double tap
        } else if (tapCountRef.current >= 2) {
            // Double tap detected!
            tapCountRef.current = 0;
            clearTimeout(tapTimerRef.current);
            navigate('/admin/login');
        }
    }, [navigate]);

    return (
        <div className="app-shell">
            <div className="app-frame">
                <div className={`${styles.authCard} app-card`}>
                    <div className="app-content">
                        <div className={styles.authContainer}>
                            <header className={styles.authHeader}>
                                <h1 
                                    className={styles.authLogo}
                                    onClick={handleTitleDoubleTap}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Admin access"
                                >
                                    CasaWay
                                </h1>
                                <hr className={styles.goldenLine}/>
                                <h2 className={styles.authSubtitle}>{subtitle}</h2>
                                {description && <p className={styles.authDescription}>{description}</p>}
                            </header>

                            <form className={styles.authForm} onSubmit={onSubmit}>
                                {children}
                            </form>

                            <div className={styles.authFooter}>
                                <p>
                                    {footerText}{' '}
                                    <Link to={footerLinkTo} className={styles.authLink}>{footerLinkText}</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
