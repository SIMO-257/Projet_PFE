import React from 'react';

const FormField = ({ 
  label,
  type = "text",
  value,
  onChange,
  onClear,
  placeholder = "",
  icon,
  rightIcon,
  showValidation = false,
  isValid = false,
  characterLimit,
  prefix,
  className = ""
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">
          {label}
        </label>
      )}
      <div className={`relative bg-black/30 rounded-2xl border border-white/10 focus-within:border-yellow-500/50 transition-all ${value ? 'border-yellow-500/30' : ''}`}>
        <div className="flex items-center px-4 py-4">
          {/* Left Icon */}
          {icon && (
            <div className="w-5 h-5 flex items-center justify-center mr-3">
              {icon}
            </div>
          )}

          {/* Prefix (for phone country code, etc.) */}
          {prefix && (
            <div className="mr-2">
              {prefix}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
            placeholder={placeholder}
          />

          {/* Clear Button or Validation Icon */}
          {value ? (
            <button
              onClick={handleClear}
              className="w-5 h-5 flex items-center justify-center ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          ) : showValidation && isValid ? (
            <div className="w-5 h-5 flex items-center justify-center ml-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          ) : null}

          {/* Right Icon (passed from parent) */}
          {rightIcon && !value && (
            <div className="w-5 h-5 flex items-center justify-center ml-2">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Character Counter */}
        {characterLimit && (
          <div className="px-4 pb-2">
            <div className="text-white/40 text-xs">
              {value.length}/{characterLimit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;