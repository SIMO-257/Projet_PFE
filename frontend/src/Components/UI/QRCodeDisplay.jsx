import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../../Styles/QRValidation.module.css';

const QRCodeDisplay = ({ 
    value = '',
    isValid = true,
    size = 280,
    className = ""
}) => {
    const qrText = value || 'ticket-validation';
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [qrError, setQrError] = useState(false);

    useEffect(() => {
        let mounted = true;

        QRCode.toDataURL(qrText, {
            width: size,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        })
            .then((url) => {
                if (!mounted) return;
                setQrDataUrl(url);
                setQrError(false);
            })
            .catch(() => {
                if (!mounted) return;
                setQrDataUrl('');
                setQrError(true);
            });

        return () => {
            mounted = false;
        };
    }, [qrText, size]);

    const GRID_SIZE = 29; // includes quiet zone
    const INNER_SIZE = 21; // QR-like payload area
    const QUIET = 4;

    const hashString = (input) => {
        let hash = 2166136261;
        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    };

    const makeSeededBool = (seed, row, col) => {
        const mixed = Math.imul(seed ^ (row * 374761393) ^ (col * 668265263), 1274126177);
        return ((mixed >>> 0) & 1) === 1;
    };

    const isFinderCell = (row, col, top, left) => {
        const r = row - top;
        const c = col - left;
        if (r < 0 || r > 6 || c < 0 || c > 6) return false;

        const outer = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        return outer || inner;
    };

    const inFinderZone = (row, col) => {
        const top = QUIET;
        const left = QUIET;
        const right = QUIET + INNER_SIZE - 7;
        const bottom = QUIET + INNER_SIZE - 7;

        return (
            (row >= top && row <= top + 6 && col >= left && col <= left + 6) ||
            (row >= top && row <= top + 6 && col >= right && col <= right + 6) ||
            (row >= bottom && row <= bottom + 6 && col >= left && col <= left + 6)
        );
    };

    const generateQRPattern = () => {
        const cells = [];
        const seed = hashString(value || 'default-ticket-qr');

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const inQuietZone =
                    row < QUIET ||
                    col < QUIET ||
                    row >= QUIET + INNER_SIZE ||
                    col >= QUIET + INNER_SIZE;

                if (inQuietZone) {
                    cells.push(
                        <rect
                            key={`${row}-${col}`}
                            x={col}
                            y={row}
                            width="1"
                            height="1"
                            fill="#FFFFFF"
                        />
                    );
                    continue;
                }

                const top = QUIET;
                const left = QUIET;
                const right = QUIET + INNER_SIZE - 7;
                const bottom = QUIET + INNER_SIZE - 7;

                const isTopLeftFinder = isFinderCell(row, col, top, left);
                const isTopRightFinder = isFinderCell(row, col, top, right);
                const isBottomLeftFinder = isFinderCell(row, col, bottom, left);

                const innerRow = row - QUIET;
                const innerCol = col - QUIET;
                const timingHorizontal = innerRow === 6 && innerCol > 7 && innerCol < 13;
                const timingVertical = innerCol === 6 && innerRow > 7 && innerRow < 13;

                const isBlack =
                    isTopLeftFinder ||
                    isTopRightFinder ||
                    isBottomLeftFinder ||
                    timingHorizontal ||
                    timingVertical ||
                    (!inFinderZone(row, col) && !timingHorizontal && !timingVertical && makeSeededBool(seed, row, col));

                cells.push(
                    <rect
                        key={`${row}-${col}`}
                        x={col}
                        y={row}
                        width="1"
                        height="1"
                        fill={isBlack ? '#000000' : '#FFFFFF'}
                    />
                );
            }
        }

        return cells;
    };

    return (
        <div className={`${styles.qrContainer} ${className} ${isValid ? styles.qrPulse : ''}`}>
            {!qrError && qrDataUrl ? (
                <img
                    src={qrDataUrl}
                    alt="QR code"
                    width={size}
                    height={size}
                    className="w-full h-full rounded-lg bg-white object-contain"
                />
            ) : null}
            <svg
                data-fallback="true"
                viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
                width={size}
                height={size}
                className={`${!qrError && qrDataUrl ? 'hidden' : ''} w-full h-full rounded-lg bg-white`}
                shapeRendering="crispEdges"
                role="img"
                aria-label="QR code fallback"
            >
                {generateQRPattern()}
            </svg>
        </div>
    );
};

export default QRCodeDisplay;
