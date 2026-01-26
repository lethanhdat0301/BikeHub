import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';
import de from './locales/de/translation.json';
import vi from './locales/vi/translation.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  de: { translation: de },
  vi: { translation: vi },
};

const storedLng = localStorage.getItem('i18nextLng');
const initialLng = storedLng ? storedLng.split('-')[0] : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru', 'de', 'vi'],
  react: { useSuspense: false },
  interpolation: { escapeValue: false },
});

export default i18n;
