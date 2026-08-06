import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();
const defaultLanguage = 'uz_cyrl';

const resolveTranslation = (locale, key) => {
  const dictionary = translations[locale];
  if (!dictionary) {
    return undefined;
  }

  return key.split('.').reduce((value, segment) => {
    if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
      return value[segment];
    }
    return undefined;
  }, dictionary);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('taklifnoma_lang');
    return translations[savedLanguage] ? savedLanguage : defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('taklifnoma_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const localizedValue = resolveTranslation(language, key);
    if (localizedValue !== undefined) {
      return localizedValue;
    }

    const fallbackValue = resolveTranslation(defaultLanguage, key);
    return fallbackValue !== undefined ? fallbackValue : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
