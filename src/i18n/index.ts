import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./ru.json";
import kk from "./kk.json";

const STORAGE_KEY = "oqyrman_lang";

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "kk" || stored === "ru") return stored;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("kk")) return "kk";
  return "ru";
}

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, kk: { translation: kk } },
  lng: detectLanguage(),
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
