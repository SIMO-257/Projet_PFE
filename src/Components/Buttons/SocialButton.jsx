// Components/Buttons/SocialButton.jsx
import React from 'react';
import styles from '../../Pages/Login/Login.module.css'

const SocialButton = ({ provider, children, icon, onClick }) => {
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
};

export default SocialButton;