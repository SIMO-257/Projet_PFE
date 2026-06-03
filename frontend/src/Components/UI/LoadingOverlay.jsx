import React from 'react';
import SphereLoader from './SphereLoader';

const LoadingOverlay = ({ isVisible, message = "Sécurisation en cours..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/65 backdrop-blur-md transition-all duration-300 pointer-events-auto">
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#2a0b0f]/80 border border-yellow-500/20 shadow-2xl">
        <SphereLoader />
        {message && (
          <p className="text-yellow-500 mt-6 text-sm uppercase tracking-widest font-semibold animate-pulse text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
