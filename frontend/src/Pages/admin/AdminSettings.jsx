import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, setLanguage, toggleTheme } from '../../Redux/Slices/settingsSlice';
import { useTranslation } from '../../hooks/useTranslation';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { theme, language } = useSelector((state) => state.settings);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('admin_settings_title')}</h2>
        <p className="text-white/50">{t('admin_settings_subtitle')}</p>
      </div>

      {/* Appearance Section */}
      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">{t('admin_settings_appearance')}</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{t('admin_settings_dark_mode')}</p>
              <p className="text-white/40 text-sm mt-0.5">{t('admin_settings_dark_mode_desc')}</p>
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                theme === 'dark' ? 'bg-yellow-500/30' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'translate-x-7 bg-yellow-500'
                    : 'translate-x-0.5 bg-white/60'
                }`}
              >
                {theme === 'dark' ? (
                  <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{t('admin_settings_language')}</p>
              <p className="text-white/40 text-sm mt-0.5">{t('admin_settings_language_desc')}</p>
            </div>
            <div className="flex gap-1.5 bg-white/5 rounded-xl p-1">
              {[
                { code: 'fr', label: 'FR' },
                { code: 'en', label: 'EN' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => dispatch(setLanguage(lang.code))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    language === lang.code
                      ? 'bg-yellow-500/20 text-yellow-500 shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">{t('admin_settings_version')}</p>
            <p className="text-white/40 text-sm">{t('admin_settings_save_info')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
