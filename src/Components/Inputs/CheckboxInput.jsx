// Components/Inputs/CheckboxInput.jsx
import React from 'react';
import styles from '../../Styles/Login.module.css';

const CheckboxInput = ({ label, id }) => {
    return (
        <label className={styles.checkboxLabel} htmlFor={id}>
            <input type="checkbox" id={id} />
            <span>{label}</span>
        </label>
    );
};

export default CheckboxInput;