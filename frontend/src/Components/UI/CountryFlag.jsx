import React from 'react';

const CountryFlag = ({ 
  country = "MA", // Morocco by default
  size = "sm", // 'sm' | 'md' | 'lg'
  className = ""
}) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'w-6 h-4';
      case 'md': return 'w-8 h-6';
      case 'lg': return 'w-10 h-8';
      default: return 'w-6 h-4';
    }
  };

  const getFlag = () => {
    if (country === 'MA') {
      return (
        <svg viewBox="0 0 900 600" className="w-full h-full">
          <rect width="900" height="600" fill="#C1272D"/>
          <path d="M 450,200 L 480,300 L 590,270 L 500,330 L 540,440 L 450,360 L 360,440 L 400,330 L 310,270 L 420,300 Z" fill="none" stroke="#006233" strokeWidth="15"/>
        </svg>
      );
    }
    // Add other countries as needed
    return null;
  };

  return (
    <div className={`${getSize()} rounded overflow-hidden border border-white/20 ${className}`}>
      {getFlag()}
    </div>
  );
};

export default CountryFlag;