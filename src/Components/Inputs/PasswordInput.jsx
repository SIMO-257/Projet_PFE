// Components/Inputs/PasswordInput.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

const PasswordInput = (props) => {
    return (
        <div className={styles.formGroup}>
            <label htmlFor={props.id} className={styles.formLabel}>{props.label}</label>
            <input
                type="password"
                id={props.id}
                placeholder={props.placeholder}
                className={styles.formInput}
                
                required={props.required}
            />
        </div>
    );
};

export default PasswordInput;