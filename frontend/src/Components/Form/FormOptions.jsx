// Components/Form/FormOptions.jsx
import React from 'react';
import styles from '../../Styles/Auth.module.css'

export default function FormOptions({ leftContent, rightContent }) {
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
}