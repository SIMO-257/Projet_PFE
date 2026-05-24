import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const ContactCard = ({ 
  type = 'phone', // 'phone' | 'email' | 'chat'
  title,
  subtitle,
  contactInfo,
  status = 'online', // 'online' | 'offline' | 'working-hours'
  onAction,
  buttonText: btnProp,
  className = ""
}) => {
    const { t } = useTranslation();
    const buttonText = btnProp || t('contact_button_text');
  const getIcon = () => {
    switch(type) {
      case 'phone':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
        );
      case 'email':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
        );
      case 'chat':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusIndicator = () => {
    if (type === 'chat' && status === 'online') {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#3D1A24] pulse-dot"></div>
      );
    }
    return null;
  };

  const getStatusText = () => {
    if (type === 'chat') {
      return status === 'online' ? (
        <p className="text-green-400 text-xs mb-1">{t('online_status')}</p>
      ) : (
        <p className="text-red-400 text-xs mb-1">{t('offline_status')}</p>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-[#5C2A36] to-[#3D1A24] rounded-2xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          {getStatusIndicator()}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
          {getStatusText()}
          <p className="text-white text-sm mb-1">{contactInfo}</p>
          <p className="text-white/50 text-xs mb-3">{subtitle}</p>
          <button
            onClick={onAction}
            className="bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106] text-sm font-semibold px-4 py-2 rounded-xl hover:from-[#E5C5A1] hover:to-[#D9B971] transition-all"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;