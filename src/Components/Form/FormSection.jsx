import React from 'react';

const FormSection = ({ 
  title,
  subtitle,
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-yellow-500 text-xs uppercase tracking-wider font-semibold mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-white/60 text-sm mb-4">{subtitle}</p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;