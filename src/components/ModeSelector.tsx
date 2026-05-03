import { useEffect, useState } from "react";
import { Shield, Coffee, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AppMode = "focus" | "recovery" | "off";

const BLOCKABLE_APPS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
  { id: "twitter", label: "Twitter / X", emoji: "🐦" },
  { id: "snapchat", label: "Snapchat", emoji: "👻" },
  { id: "discord", label: "Discord", emoji: "💬" },
];

const STORAGE_BLOCKED = "burnout-brake-blocked-apps";

export function useBlockedApps() {
  const [blocked, setBlocked] = useState<string[]>(["tiktok", "instagram"]);
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_BLOCKED);
    if (saved) try { setBlocked(JSON.parse(saved)); } catch {}
  }, []);
  const toggle = (id: string) => {
    setBlocked((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem(STORAGE_BLOCKED, JSON.stringify(next));
      return next;
    });
  };
  return { blocked, toggle, all: BLOCKABLE_APPS };
}

export function ModeBadge({
  mode,
  remainingMs,
  blockedCount,
}: {
  mode: AppMode;
  remainingMs: number;
  blockedCount: number;
}) {
  if (mode === "off") return null;
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const tt = `${mins}:${secs.toString().padStart(2, "0")}`;
  if (mode === "focus") {
    return (
      <div className="bg-primary/15 border border-primary/30 rounded-2xl p-3 flex items-center gap-3">
        <Lock className="h-4 w-4 text-primary" />
        <div className="flex-1 text-sm">
          <p className="font-semibold leading-tight">Focus Mode active</p>
          <p className="text-xs text-muted-foreground">
            {blockedCount} app{blockedCount === 1 ? "" : "s"} blocked · {tt} left
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-sage/30 border border-sage rounded-2xl p-3 flex items-center gap-3">
      <Unlock className="h-4 w-4 text-sage-foreground" />
      <div className="flex-1 text-sm">
        <p className="font-semibold leading-tight">Recovery Mode</p>
        <p className="text-xs text-muted-foreground">Apps unlocked · {tt} left</p>
      </div>
    </div>
  );
}

export function ModeSelector({
  mode,
  onStart,
}: {
  mode: AppMode;
  onStart: (mode: "focus" | "recovery") => void;
}) {
  const { blocked, toggle, all } = useBlockedApps();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onStart("focus")}
          disabled={mode === "focus"}
          className="bg-primary/10 hover:bg-primary/20 disabled:opacity-50 transition-colors rounded-2xl p-3 text-left border border-primary/20"
        >
          <Shield className="h-4 w-4 text-primary mb-1" />
          <p className="text-sm font-semibold">Focus Mode</p>
          <p className="text-xs text-muted-foreground">25 min · blocks distractions</p>
        </button>
        <button
          onClick={() => onStart("recovery")}
          disabled={mode === "recovery"}
          className="bg-sage/30 hover:bg-sage/50 disabled:opacity-50 transition-colors rounded-2xl p-3 text-left border border-sage"
        >
          <Coffee className="h-4 w-4 text-sage-foreground mb-1" />
          <p className="text-sm font-semibold">Recovery Mode</p>
          <p className="text-xs text-muted-foreground">10 min · short break</p>
        </button>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
      >
        {open ? "Hide" : "Choose"} apps to block ({blocked.length} selected)
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-2">
          {all.map((app) => {
            const on = blocked.includes(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggle(app.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-sm transition-colors border ${
                  on ? "bg-primary/10 border-primary/30" : "bg-secondary/40 border-transparent"
                }`}
              >
                <span>{app.emoji}</span>
                <span className="flex-1 text-left text-xs">{app.label}</span>
                {on && <Lock className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
