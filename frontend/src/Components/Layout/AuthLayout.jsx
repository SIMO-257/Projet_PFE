import React from 'react';
import { Link } from 'react-router-dom';
import SocialButton from '../Buttons/SocialButton';
import styles from '../../Styles/Auth.module.css';

const AuthLayout = ({ 
    children, 
    title, 
    subtitle, 
    description, 
    footerText, 
    footerLinkText, 
    footerLinkTo,
    showSocial = true,
    onSubmit
}) => {
    const handleGoogleLogin = () => {};
    const handleAppleLogin = () => {};

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <header className={styles.authHeader}>
                    <h1 className={styles.authLogo}>CasaWay</h1>
                    <hr className={styles.goldenLine}/>
                    <h2 className={styles.authSubtitle}>{subtitle}</h2>
                    {description && <p className={styles.authDescription}>{description}</p>}
                </header>

                <form className={styles.authForm} onSubmit={onSubmit}>
                    {children}
                </form>

                {showSocial && (
                    <>
                        <div className={styles.divider}>
                            <span>ou</span>
                        </div>

                        <div className={styles.socialButtons}>
                            <SocialButton
                                provider="google"
                                icon="G"
                                onClick={handleGoogleLogin}
                            >
                                Continuer avec Google
                            </SocialButton>
                            <SocialButton
                                provider="apple"
                                onClick={handleAppleLogin}
                            >
                                Continuer avec Apple
                            </SocialButton>
                        </div>
                    </>
                )}

                <div className={styles.authFooter}>
                    <p>
                        {footerText}{' '}
                        <Link to={footerLinkTo} className={styles.authLink}>{footerLinkText}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
