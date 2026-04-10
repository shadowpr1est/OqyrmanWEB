import { IconTextSize, IconLetterSpacing, IconTypography, IconX } from "@tabler/icons-react";

export interface ReaderConfig {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

const FONTS = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Literata', serif", label: "Literata" },
  { value: "system-ui, sans-serif", label: "Sans-serif" },
  { value: "'JetBrains Mono', monospace", label: "Mono" },
];

const STORAGE_KEY = "oqyrman-reader-settings";

export function loadSettings(): ReaderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.8 };
}

export function saveSettings(cfg: ReaderConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export const ReaderSettings = ({
  config,
  onChange,
  onClose,
}: {
  config: ReaderConfig;
  onChange: (cfg: ReaderConfig) => void;
  onClose: () => void;
}) => {
  const update = (patch: Partial<ReaderConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="absolute right-3 top-14 z-50 w-72 rounded-2xl bg-white border border-border/60 shadow-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Настройки</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/60 transition-colors">
          <IconX size={16} />
        </button>
      </div>

      {/* Font family */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <IconTypography size={14} /> Шрифт
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f.value}
              onClick={() => update({ fontFamily: f.value })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                config.fontFamily === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-muted/40 text-foreground/70 hover:bg-muted/70"
              }`}
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <IconTextSize size={14} /> Размер шрифта
          </span>
          <span className="text-foreground font-semibold">{config.fontSize}px</span>
        </label>
        <input
          type="range"
          min={14}
          max={28}
          step={1}
          value={config.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>14</span>
          <span>28</span>
        </div>
      </div>

      {/* Line height */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <IconLetterSpacing size={14} /> Межстрочный интервал
          </span>
          <span className="text-foreground font-semibold">{config.lineHeight.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={1.2}
          max={2.4}
          step={0.1}
          value={config.lineHeight}
          onChange={(e) => update({ lineHeight: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1.2</span>
          <span>2.4</span>
        </div>
      </div>
    </div>
  );
};
