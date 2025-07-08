import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageSwitcher({ className = '', styleType }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={
            styleType === 'header'
              ? `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentLang === l.code ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'}`
              : `px-3 py-1 rounded font-bold border transition-colors ${currentLang === l.code ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
} 