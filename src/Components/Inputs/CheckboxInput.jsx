// Components/Inputs/CheckboxInput.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

const CheckboxInput = (props) => {
    return (
        <label className={styles.checkboxLabel} htmlFor={props.id}>
            <input type="checkbox" id={props.id} onClick={props.setCheck}/>
            <span>{props.label}</span>
        </label>
    );
};

export default CheckboxInput;