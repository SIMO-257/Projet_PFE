import React from 'react';

const ProfileMenuCard = ({ 
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default', // 'default' | 'danger'
  className = ""
}) => {
  const getBackground = () => {
    if (variant === 'danger') {
      return 'bg-gradient-to-br from-red-500/20 to-red-600/20';
    }
    return 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20';
  };

  const getTextColor = () => {
    if (variant === 'danger') {
      return 'text-red-400';
    }
    return 'text-yellow-500';
  };

  return (
    <button
      onClick={onPress}
      className={`w-full bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl ${getBackground()} flex items-center justify-center`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${getTextColor()}` })}
          </div>
          <span className={`font-medium text-sm ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}>
            {title}
          </span>
        </div>
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </button>
  );
};

export default ProfileMenuCard;