import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'en' },
  { code: 'ru', label: '🇷🇺' },
];

export default function LanguageSwitcher({ className = '', styleType }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={
            styleType === 'hero'
              ? `w-10 h-10 flex items-center justify-center rounded-full text-2xl border-2 transition-all duration-200 shadow-md ${currentLang === l.code ? 'border-convrt-purple bg-white' : 'border-gray-200 bg-gray-50 hover:border-convrt-purple'}`
              : styleType === 'header'
                ? `px-3 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${currentLang === l.code ? 'text-convrt-purple bg-convrt-purple/10' : 'text-gray-700 hover:text-convrt-purple hover:bg-convrt-purple/5'}`
                : `px-3 py-1 rounded font-bold border transition-colors ${currentLang === l.code ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`
          }
          aria-label={l.code === 'en' ? 'English' : 'Русский'}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
} 