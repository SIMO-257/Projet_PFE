// Components/Buttons/ConnexionButton.jsx
import React from 'react';
import styles from '../../Pages/Login/Login.module.css'

const ConnexionButton = ({ children, type = 'button', variant = 'primary', onClick, disabled = false }) => {
    const buttonClass = variant === 'primary' 
        ? `${styles.authButton} ${styles.authButtonPrimary}`
        : styles.authButton;

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default ConnexionButton;