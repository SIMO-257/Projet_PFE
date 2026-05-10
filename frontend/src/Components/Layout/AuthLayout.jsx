import React from 'react';
import { Link } from 'react-router-dom';
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
    return (
        <div className="app-shell">
            <div className="app-frame">
                <div className={`${styles.authCard} app-card`}>
                    <div className="app-content">
                        <div className={styles.authContainer}>
                            <header className={styles.authHeader}>
                                <h1 className={styles.authLogo}>CasaWay</h1>
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
