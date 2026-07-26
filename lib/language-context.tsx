'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, languages } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    // استرجاع اللغة المحفوظة أو استخدام لغة المتصفح
    const saved = localStorage.getItem('preferred-lang') as Language;
    if (saved && languages.find(l => l.code === saved)) {
      setLangState(saved);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (languages.find(l => l.code === browserLang)) {
        setLangState(browserLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('preferred-lang', newLang);
    document.documentElement.lang = newLang;
    const langObj = languages.find(l => l.code === newLang);
    document.documentElement.dir = langObj?.dir || 'ltr';
  };

  const langObj = languages.find(l => l.code === lang);
  const dir = langObj?.dir || 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
