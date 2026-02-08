import React from 'react';

const SettingsMenuItem = ({ 
  title, 
  subtitle, 
  icon, 
  onClick, 
  rightContent,
  variant = 'default',
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-4 border transition-all ${
        variant === 'danger' 
          ? 'bg-white/5 border-white/5 hover:border-red-500/30 hover:bg-red-500/10'
          : variant === 'gradient'
          ? 'bg-gradient-to-br from-[#5C2A36] to-[#3D1A24] border-white/10 hover:border-white/20'
          : 'bg-white/5 border-white/5 hover:border-white/10'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            variant === 'danger' 
              ? 'bg-red-500/20' 
              : 'bg-yellow-500/20'
          }`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className={`font-medium text-sm ${
              variant === 'danger' ? 'text-red-400' : 'text-white'
            }`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-white/50 text-xs">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {rightContent}
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </button>
  );
};

export default SettingsMenuItem;