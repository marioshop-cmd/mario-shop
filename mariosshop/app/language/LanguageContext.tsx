'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'marios_shop_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default is 'en' so first paint on server and client always match
  // (avoids hydration mismatch). We patch in the saved preference
  // right after mount, once we can safely read localStorage.
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'tn' || saved === 'en' || saved === 'fr') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) {
      // Missing key: fall back to the key itself so it's obvious in the UI
      // that a translation still needs to be added, instead of crashing.
      return key;
    }
    return entry[language] ?? entry.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
