import React from 'react';

const ProfileAvatar = ({ 
  size = "lg", // 'sm' | 'md' | 'lg' | 'xl'
  showPremiumBadge = true,
  imageUrl,
  initials = "SM",
  className = ""
}) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'w-16 h-16';
      case 'md': return 'w-20 h-20';
      case 'lg': return 'w-28 h-28';
      case 'xl': return 'w-32 h-32';
      default: return 'w-28 h-28';
    }
  };

  const getBadgeSize = () => {
    switch(size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-7 h-7';
      case 'lg': return 'w-9 h-9';
      case 'xl': return 'w-10 h-10';
      default: return 'w-9 h-9';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Avatar */}
      <div className={`${getSize()} rounded-full border-4 border-yellow-500 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden`}>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg className={`${getSize()} text-white/40`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            <div className="absolute text-white font-bold text-xl">{initials}</div>
          </>
        )}
      </div>

      {/* Premium Badge */}
      {showPremiumBadge && (
        <div className={`absolute bottom-0 right-0 ${getBadgeSize()} rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-4 border-[#3D1A24] flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-[#400106]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;