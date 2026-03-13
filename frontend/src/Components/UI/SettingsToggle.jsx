import React from 'react';

const SettingsToggle = ({ 
  title, 
  description, 
  icon, 
  isActive, 
  onChange,
  className = ""
}) => {
  return (
    <div className={`bg-white/5 rounded-2xl p-4 border border-white/5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">{title}</h3>
            <p className="text-white/50 text-xs">{description}</p>
          </div>
        </div>
        <button
          onClick={onChange}
          className={`toggle-switch ${isActive ? 'active' : ''}`}
        >
          <div className="toggle-knob"></div>
        </button>
      </div>
    </div>
  );
};

export default SettingsToggle;