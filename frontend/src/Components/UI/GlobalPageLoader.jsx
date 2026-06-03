import React from 'react';
import GoldenSpinner from './GoldenSpinner';

const GlobalPageLoader = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a0b0f] to-[#1a0507]">
            <GoldenSpinner size={64} />
            <p className="text-yellow-500/60 mt-6 text-sm uppercase tracking-widest font-semibold animate-pulse">
                Chargement...
            </p>
        </div>
    );
};

export default GlobalPageLoader;
