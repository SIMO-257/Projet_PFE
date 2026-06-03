import React from 'react';

const GoldenSpinner = ({ size = 48, className = '' }) => {
    return (
        <div style={{ width: size, height: size }} className={`relative ${className}`}>
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
        </div>
    );
};

export default GoldenSpinner;
