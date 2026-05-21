'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Statically import all 10 language JSON assets to prevent Next.js SSR hydration mismatches
import enCommon from '../public/locales/en/common.json';
import hiCommon from '../public/locales/hi/common.json';
import guCommon from '../public/locales/gu/common.json';
import esCommon from '../public/locales/es/common.json';
import frCommon from '../public/locales/fr/common.json';
import arCommon from '../public/locales/ar/common.json';
import ptCommon from '../public/locales/pt/common.json';
import zhCommon from '../public/locales/zh/common.json';
import bnCommon from '../public/locales/bn/common.json';
import ruCommon from '../public/locales/ru/common.json';

const resources = {
  en: { translation: enCommon, common: enCommon },
  hi: { translation: hiCommon, common: hiCommon },
  gu: { translation: guCommon, common: guCommon },
  es: { translation: esCommon, common: esCommon },
  fr: { translation: frCommon, common: frCommon },
  ar: { translation: arCommon, common: arCommon },
  pt: { translation: ptCommon, common: ptCommon },
  zh: { translation: zhCommon, common: zhCommon },
  bn: { translation: bnCommon, common: bnCommon },
  ru: { translation: ruCommon, common: ruCommon }
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'translation'],
    interpolation: {
      escapeValue: false, // react already escapes values to prevent XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'app-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
