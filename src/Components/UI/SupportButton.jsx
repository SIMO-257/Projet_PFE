import React from 'react';

const SupportButton = ({ 
  type = 'phone', // 'phone' | 'chat' | 'email'
  label,
  onClick,
  className = ""
}) => {
  const getIcon = () => {
    switch(type) {
      case 'phone':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
        );
      case 'chat':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
          </svg>
        );
      case 'email':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`bg-black/30 rounded-2xl p-4 border border-white/10 hover:border-yellow-500/30 transition-all ${className}`}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-white text-xs font-medium">{label}</span>
      </div>
    </button>
  );
};

export default SupportButton;