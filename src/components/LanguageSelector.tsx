import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector = ({ className = '' }: LanguageSelectorProps) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();

  return (
    <select 
      value={currentLanguage.code}
      onChange={(e) => {
        const lang = languages.find(l => l.code === e.target.value);
        if (lang) setLanguage(lang);
      }}
      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;