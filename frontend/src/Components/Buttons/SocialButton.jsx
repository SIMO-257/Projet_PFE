// Components/Buttons/SocialButton.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

export default function SocialButton({ provider, children, icon, onClick }) {
    const buttonClass = provider === 'google' 
        ? `${styles.socialButton} ${styles.socialButtonGoogle}`
        : `${styles.socialButton} ${styles.socialButtonApple}`;

    return (
        <button 
            className={buttonClass}
            onClick={onClick}
        >
            {icon && <span className={styles.socialIcon}>{icon}</span>}
            {children}
        </button>
    );
}