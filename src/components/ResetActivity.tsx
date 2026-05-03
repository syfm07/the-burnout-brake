import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Mood } from "./MoodPicker";
import { Loader2 } from "lucide-react";

type Suggestion = {
  title: string;
  duration_minutes: number;
  why_it_helps: string;
  steps: string[];
  closing_note: string;
};

function MoodIllustration({ mood }: { mood: Mood }) {
  // Soft SVG illustrations themed by mood — calm, friendly, no clipart vibes.
  const common = "w-full h-40";
  if (mood === "stressed") {
    return (
      <svg viewBox="0 0 200 120" className={common} aria-hidden>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--lavender)" />
            <stop offset="100%" stopColor="var(--sage)" />
          </radialGradient>
        </defs>
        {[40, 28, 16].map((r, i) => (
          <circle key={i} cx="100" cy="60" r={r} fill="url(#g1)" opacity={0.3 + i * 0.2}>
            <animate attributeName="r" values={`${r};${r + 6};${r}`} dur="4s" repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    );
  }
  if (mood === "tired") {
    return (
      <svg viewBox="0 0 200 120" className={common} aria-hidden>
        <g fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round">
          <path d="M20 80 Q60 40 100 80 T180 80">
            <animate attributeName="d" values="M20 80 Q60 40 100 80 T180 80;M20 80 Q60 60 100 80 T180 80;M20 80 Q60 40 100 80 T180 80" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
        <circle cx="160" cy="35" r="14" fill="var(--sun)" />
        <circle cx="155" cy="32" r="4" fill="var(--background)" />
      </svg>
    );
  }
  if (mood === "bored") {
    return (
      <svg viewBox="0 0 200 120" className={common} aria-hidden>
        {[...Array(8)].map((_, i) => (
          <rect key={i} x={20 + i * 22} y={50 - i * 2} width="14" height={20 + i * 4} rx="4" fill="var(--peach)" opacity={0.5 + (i % 3) * 0.15}>
            <animate attributeName="height" values={`${20 + i * 4};${10 + i * 4};${20 + i * 4}`} dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </svg>
    );
  }
  // focused
  return (
    <svg viewBox="0 0 200 120" className={common} aria-hidden>
      <circle cx="100" cy="60" r="36" fill="var(--sage)" opacity="0.6" />
      <path d="M82 62 l12 12 l24 -28" fill="none" stroke="var(--sage-foreground)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FOCUSED_MESSAGES = [
  "You're in the zone — keep that momentum going. 🌱",
  "Look at you, locked in. Future-you is grateful.",
  "Quiet focus is a superpower. Ride the wave.",
  "This is what progress feels like. Keep going.",
  "Steady and sharp — exactly where you need to be.",
];

export function ResetActivity({ mood, onDone }: { mood: Mood; onDone: () => void }) {
  const [data, setData] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(mood !== "focused");

  useEffect(() => {
    if (mood === "focused") return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: res, error } = await supabase.functions.invoke("mood-action", {
        body: { mood },
      });
      if (cancelled) return;
      if (error || res?.error) {
        toast.error(res?.error || "Couldn't fetch a suggestion. Try again.");
        setLoading(false);
        return;
      }
      setData(res as Suggestion);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mood]);

  if (mood === "focused") {
    const msg = FOCUSED_MESSAGES[Math.floor(Math.random() * FOCUSED_MESSAGES.length)];
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-3xl bg-secondary/40 p-2">
          <MoodIllustration mood="focused" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl">Keep going. 💪</h2>
          <p className="text-base text-muted-foreground leading-relaxed px-2">{msg}</p>
        </div>
        <Button onClick={onDone} size="lg" className="w-full rounded-2xl shadow-pillow">
          Back to studying
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-20 w-20 rounded-full bg-gradient-calm animate-breathe" />
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Crafting your reset…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">No suggestion right now.</p>
        <Button onClick={onDone}>Back to timer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-calm/30 bg-secondary/40 p-2">
        <MoodIllustration mood={mood} />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl leading-tight">{data.title}</h2>
        <p className="text-xs text-muted-foreground">{data.duration_minutes} min · {data.why_it_helps}</p>
      </div>

      <ol className="space-y-2">
        {data.steps.slice(0, 3).map((s, i) => (
          <li key={i} className="flex gap-3 items-center bg-secondary/50 rounded-2xl p-3">
            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm leading-snug">{s}</span>
          </li>
        ))}
      </ol>

      <p className="italic text-center text-sm text-sage-foreground bg-sage/40 rounded-2xl p-3">
        {data.closing_note}
      </p>

      <Button onClick={onDone} size="lg" className="w-full rounded-2xl shadow-pillow">
        Back to studying
      </Button>
    </div>
  );
}
