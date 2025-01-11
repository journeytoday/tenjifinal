import React, { createContext, useContext, useState } from 'react';
import { translations, Translation } from '../translations';

type Language = {
  code: string;
  label: string;
};

const languages: Language[] = [
  { code: 'EN', label: 'English' },
  { code: 'DE', label: 'German' },
  { code: 'PT', label: 'Portuguese' },
];

type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  languages: Language[];
  t: Translation;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        setLanguage, 
        languages,
        t: translations[currentLanguage.code]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};