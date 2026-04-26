import { useTranslation } from "react-i18next";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Flag = ({ country }: { country: string }) => (
  <img
    src={`https://flagcdn.com/w40/${country}.png`}
    srcSet={`https://flagcdn.com/w80/${country}.png 2x`}
    alt={country}
    width={20}
    height={14}
    className="rounded-sm object-cover flex-shrink-0"
  />
);

const LANGUAGES = [
  { code: "ru", country: "ru", label: "Русский", short: "RU" },
  { code: "kk", country: "kz", label: "Қазақша", short: "ҚАЗ" },
] as const;

interface LanguageSwitcherProps {
  dark?: boolean;
}

export const LanguageSwitcher = ({ dark = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const current = i18n.language;
  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            dark
              ? "bg-white/10 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
              : "bg-muted/50 border-border/60 text-foreground/70 hover:bg-muted hover:text-foreground"
          }`}
        >
          <Flag country={active.country} />
          <span>{active.short}</span>
          <IconChevronDown size={12} stroke={2} className="opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[140px] p-1">
        {LANGUAGES.map(({ code, country, label, short }) => {
          const isActive = current === code;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer"
            >
              <Flag country={country} />
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{short}</p>
              </div>
              {isActive && (
                <IconCheck size={14} className="text-primary flex-shrink-0" stroke={2.5} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};