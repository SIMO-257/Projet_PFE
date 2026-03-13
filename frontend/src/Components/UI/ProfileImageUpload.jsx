import React from 'react';

const ProfileImageUpload = ({ 
  imageUrl,
  onUpload,
  initials = "SM",
  size = "xl", // 'sm' | 'md' | 'lg' | 'xl'
  className = ""
}) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'w-16 h-16';
      case 'md': return 'w-24 h-24';
      case 'lg': return 'w-28 h-28';
      case 'xl': return 'w-32 h-32';
      default: return 'w-32 h-32';
    }
  };

  const getCameraSize = () => {
    switch(size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-9 h-9';
      case 'xl': return 'w-10 h-10';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Image Container */}
      <div className={`${getSize()} rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-yellow-500/30 flex items-center justify-center overflow-hidden`}>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg className={`${getSize()} text-white/40`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            <div className="absolute text-white font-bold text-lg">{initials}</div>
          </>
        )}
      </div>

      {/* Camera Upload Button */}
      <button
        onClick={onUpload}
        className={`absolute bottom-0 right-0 ${getCameraSize()} rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-4 border-[#400106] flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
      >
        <svg className="w-1/2 h-1/2 text-[#400106]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
};

export default ProfileImageUpload;