import React from 'react';
import styles from '../../styles/QRValidation.module.css';

const QRCodeDisplay = ({ 
    isValid = true,
    size = 280,
    className = ""
}) => {
    const generateQRPattern = () => {
        const cells = [];
        
        for (let row = 0; row < 21; row++) {
            for (let col = 0; col < 21; col++) {
                const isBlack = 
                    // Position markers (corners)
                    (row < 7 && col < 7) ||
                    (row < 7 && col > 13) ||
                    (row > 13 && col < 7) ||
                    // Timing patterns
                    (row === 6 && col >= 7 && col <= 13) ||
                    (col === 6 && row >= 7 && row <= 13) ||
                    // Random pattern (for demo)
                    (row + col) % 3 === 0 ||
                    (row * col) % 7 === 0;
                
                cells.push(
                    <div 
                        key={`${row}-${col}`}
                        className={`qr-cell ${isBlack ? '' : 'white'}`}
                    />
                );
            }
        }
        
        return cells;
    };

    return (
        <div className={`${styles.qrContainer} ${className} ${isValid ? styles.qrPulse : ''}`}>
            <div className={styles.qrGrid}>
                {generateQRPattern()}
            </div>
        </div>
    );
};

export default QRCodeDisplay;