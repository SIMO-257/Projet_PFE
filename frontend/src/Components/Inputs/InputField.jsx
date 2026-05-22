// Components/Inputs/InputField.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

export default function InputField(props) {
    const { error, errorMessage, var: value, setVar: onChange, label, ...rest } = props;
    const inputClassName = `${styles.formInput} ${error ? styles.formInputError : ''}`.trim();
    const normalizedError =
        Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;

    return (
        <div className={styles.formGroup}>
            <label htmlFor={props.id} className={styles.formLabel}>{label}</label>
            <input
                className={inputClassName}
                value={value}
                onChange={onChange}
                {...rest}
            />
            {normalizedError && <p className={styles.fieldError}>{normalizedError}</p>}
        </div>
    );
}
