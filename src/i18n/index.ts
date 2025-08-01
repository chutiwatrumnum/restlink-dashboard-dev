import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./translate/en.json";
import th from "./translate/th.json";

const resources = {
  en: {
    translation: en,
  },
  th: {
    translation: th,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  compatibilityJSON: "v3",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
