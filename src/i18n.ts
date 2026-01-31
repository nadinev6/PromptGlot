import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files dynamically
import enCommon from './locales/en/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  // Add other languages as they become available
  de: {
    common: enCommon, // Fallback to English for now
  },
  af: {
    common: enCommon, // Fallback to English for now
  },
  es: {
    common: enCommon, // Fallback to English for now
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;