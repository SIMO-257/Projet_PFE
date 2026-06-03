import React, { useState } from 'react';
import casawayLogo from '../../assets/casaway_logo.png';

const SphereLoader = () => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="sphere-container">
      {/* 3D Rotating Gold Orbital Rings */}
      <div className="sphere-rings-wrapper">
        <div className="sphere-ring ring-1"></div>
        <div className="sphere-ring ring-2"></div>
        <div className="sphere-ring ring-3"></div>
        <div className="sphere-ring ring-4"></div>
        <div className="sphere-ring ring-5"></div>
        <div className="sphere-ring ring-6"></div>
        <div className="sphere-ring ring-7"></div>
        <div className="sphere-ring ring-8"></div>
      </div>
      
      {/* Centered High-Contrast Logo Container */}
      <div className="sphere-logo-container">
        {!hasError ? (
          <img 
            src={casawayLogo} 
            alt="CasaWay" 
            className="sphere-logo-img" 
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="sphere-logo-fallback">W</span>
        )}
      </div>
    </div>
  );
};

export default SphereLoader;
