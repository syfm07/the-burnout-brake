import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ThemeId = "default" | "midnight" | "ocean" | "forest" | "sunset" | "sakura";

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "default", label: "Cream (default)", swatch: "linear-gradient(135deg,#e9def7,#d6ead4)" },
  { id: "midnight", label: "Midnight", swatch: "linear-gradient(135deg,#3b3358,#2a3a55)" },
  { id: "ocean", label: "Ocean", swatch: "linear-gradient(135deg,#7fb6e6,#a7d6d8)" },
  { id: "forest", label: "Forest", swatch: "linear-gradient(135deg,#7fc090,#cfe39a)" },
  { id: "sunset", label: "Sunset", swatch: "linear-gradient(135deg,#f08a5d,#f5c26b)" },
  { id: "sakura", label: "Sakura", swatch: "linear-gradient(135deg,#f3a8c2,#e7b6d6)" },
];

const STORAGE_KEY = "burnout-brake-theme";

export function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  root.classList.remove("dark");
  if (id === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", id);
    if (id === "midnight") root.classList.add("dark");
  }
}

export function ThemePicker() {
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="text-xs" aria-label="Choose theme">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          Theme
        </p>
        <div className="space-y-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted text-left text-sm transition-colors"
            >
              <span
                className="h-6 w-6 rounded-full border border-border flex-shrink-0"
                style={{ backgroundImage: t.swatch }}
              />
              <span className="flex-1">{t.label}</span>
              {theme === t.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
