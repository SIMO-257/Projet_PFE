import React from 'react';

const ContactInfoItem = ({ 
  label,
  value,
  icon,
  truncate = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/10 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className={`flex-1 ${truncate ? 'min-w-0' : ''}`}>
        <p className="text-white/60 text-xs mb-0.5">{label}</p>
        <p className={`text-white text-sm font-medium ${truncate ? 'truncate' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default ContactInfoItem;