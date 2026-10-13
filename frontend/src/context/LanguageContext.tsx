import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { ta } from '../locales/ta';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('pashusetu_lang') as Language) || 'ta'; // Defaults to Tamil for local accessibility!
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('pashusetu_lang', newLang);
  };

  const t = (key: keyof typeof en): string => {
    const dict = lang === 'ta' ? ta : en;
    return dict[key] || en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
