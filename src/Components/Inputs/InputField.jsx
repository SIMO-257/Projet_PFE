// Components/Inputs/InputField.jsx
import React from 'react';
import styles from '../../Pages/Login/Login.module.css'

const InputField = ({ label, type = 'text', placeholder, id, required = false }) => {
    return (
        <div className={styles.formGroup}>
            <label htmlFor={id} className={styles.formLabel}>{label}</label>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                className={styles.formInput}
                required={required}
            />
        </div>
    );
};

export default InputField;