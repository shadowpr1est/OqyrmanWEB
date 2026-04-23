// Persisted choice of target language for the reader's "Перевести" action.
// Lives in localStorage so the picker remembers the user's last choice
// across sessions and across both EPUB/PDF readers.

export type TargetLang = "ru" | "en" | "kk";

export const TARGET_LANGS: { value: TargetLang; label: string; flag: string }[] = [
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "kk", label: "Қазақша", flag: "🇰🇿" },
];

const STORAGE_KEY = "oqyrman-translate-target";

export function loadTargetLang(): TargetLang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "ru" || raw === "en" || raw === "kk") return raw;
  } catch {
    /* ignore */
  }
  return "ru";
}

export function saveTargetLang(lang: TargetLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}
