import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ThemeId = "default" | "midnight" | "ocean" | "forest" | "sunset" | "sakura";

const THEMES: { id: ThemeId; label: string; swatch: string; desc: string }[] = [
  { id: "default", label: "Cream", swatch: "linear-gradient(135deg,#e9def7,#d6ead4)", desc: "Soft & default" },
  { id: "midnight", label: "Midnight", swatch: "linear-gradient(135deg,#3b3358,#2a3a55)", desc: "Stars & moon" },
  { id: "ocean", label: "Ocean", swatch: "linear-gradient(135deg,#7fb6e6,#a7d6d8)", desc: "Floating bubbles" },
  { id: "forest", label: "Forest", swatch: "linear-gradient(135deg,#7fc090,#cfe39a)", desc: "Drifting leaves" },
  { id: "sunset", label: "Sunset", swatch: "linear-gradient(135deg,#f08a5d,#f5c26b)", desc: "Glowing sun & clouds" },
  { id: "sakura", label: "Sakura", swatch: "linear-gradient(135deg,#f3a8c2,#e7b6d6)", desc: "Falling petals" },
];

const STORAGE_KEY = "burnout-brake-theme";

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  root.classList.remove("dark");
  if (id === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", id);
    if (id === "midnight") root.classList.add("dark");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>("default");
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? "default";
    setTheme(saved);
    applyTheme(saved);
  }, []);
  const choose = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
  };
  return { theme, setTheme: choose };
}

export function ThemePicker({ theme, onChange }: { theme: ThemeId; onChange: (id: ThemeId) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="text-xs" aria-label="Choose theme">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          Theme
        </p>
        <div className="space-y-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted text-left transition-colors"
            >
              <span
                className="h-7 w-7 rounded-full border border-border flex-shrink-0 shadow-sm"
                style={{ backgroundImage: t.swatch }}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm leading-tight">{t.label}</span>
                <span className="block text-xs text-muted-foreground truncate">{t.desc}</span>
              </span>
              {theme === t.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
