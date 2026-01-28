// Components/Form/FormOptions.jsx
import React from 'react';
import styles from '../../Styles/Login.module.css';

const FormOptions = ({ leftContent, rightContent }) => {
    return (
        <div className={styles.formOptions}>
            <div className={styles.formOptionsLeft}>
                {leftContent}
            </div>
            <div className={styles.formOptionsRight}>
                {rightContent}
            </div>
        </div>
    );
};

export default FormOptions;