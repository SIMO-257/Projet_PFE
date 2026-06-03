import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { setLanguage } from '../../Redux/Slices/settingsSlice';

const LANGUAGES = [
  { code: 'fr', label: 'FR', native: 'Français' },
  { code: 'ar', label: 'AR', native: 'العربية' },
  { code: 'en', label: 'EN', native: 'English' },
];

export default function LanguageSwitcher({ className = '', variant = 'pill' }) {
  const dispatch = useDispatch();
  const { language } = useTranslation();

  const handleLanguageChange = useCallback((langCode) => {
    dispatch(setLanguage(langCode));
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
  }, [dispatch]);

  return (
    <div className={`lang-switcher lang-switcher--${variant} ${className}`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`lang-switcher__btn${language === lang.code ? ' lang-switcher__btn--active' : ''}`}
          onClick={() => handleLanguageChange(lang.code)}
          title={lang.native}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
