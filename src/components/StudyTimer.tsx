import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, HeartHandshake } from "lucide-react";

const FOCUS_SECONDS = 25 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function StudyTimer({ onCheckIn }: { onCheckIn: () => void }) {
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const progress = 1 - seconds / FOCUS_SECONDS;
  const C = 2 * Math.PI * 130;

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="relative">
        <svg width="320" height="320" viewBox="0 0 320 320" className="-rotate-90">
          <circle cx="160" cy="160" r="130" stroke="var(--color-muted)" strokeWidth="14" fill="none" />
          <circle
            cx="160" cy="160" r="130"
            stroke="var(--color-primary)" strokeWidth="14" fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-display tabular-nums">{fmt(seconds)}</span>
          <span className="text-sm text-muted-foreground mt-1">
            {seconds === 0 ? "Time for a reset" : running ? "Focus session" : "Ready when you are"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={() => setRunning((r) => !r)}
          className="rounded-2xl px-8 shadow-pillow"
          disabled={seconds === 0}
        >
          {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => { setRunning(false); setSeconds(FOCUS_SECONDS); }}
          className="rounded-2xl"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <button
        onClick={onCheckIn}
        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <HeartHandshake className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        Need a check-in? Tap here anytime.
      </button>
    </div>
  );
}
