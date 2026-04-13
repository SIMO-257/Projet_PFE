// Components/Inputs/InputField.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

export default function InputField(props) {
    const inputClassName = `${styles.formInput} ${props.error ? styles.formInputError : ''}`.trim();
    return (
        <div className={styles.formGroup}>
            <label htmlFor={props.id} className={styles.formLabel}>{props.label}</label>
            <input
                type={props.type}
                id={props.id}
                placeholder={props.placeholder}
                className={inputClassName}
                value={props.var}
                onChange={props.setVar}
                required={props.required}
            />
            {props.errorMessage && <p className={styles.fieldError}>{props.errorMessage}</p>}
        </div>
    );
}
