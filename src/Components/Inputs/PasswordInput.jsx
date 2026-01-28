// Components/Inputs/PasswordInput.jsx
import React from 'react';
import styles from '../../Pages/Login/Login.module.css'

const PasswordInput = ({ label, placeholder, id, required = false }) => {
    return (
        <div className={styles.formGroup}>
            <label htmlFor={id} className={styles.formLabel}>{label}</label>
            <input
                type="password"
                id={id}
                placeholder={placeholder}
                className={styles.formInput}
                required={required}
            />
        </div>
    );
};

export default PasswordInput;