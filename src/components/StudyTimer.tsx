import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward, HeartHandshake, CheckCircle2 } from "lucide-react";
import type { PlannedTask } from "./SessionPlanner";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function StudyTimer({
  task,
  paused,
  onCheckIn,
  onComplete,
  autoStartSignal = 0,
  resetSignal = 0,
}: {
  task: PlannedTask;
  paused: boolean;
  onCheckIn: () => void;
  onComplete: () => void;
  autoStartSignal?: number;
  resetSignal?: number;
}) {
  const total = task.minutes * 60;
  const [seconds, setSeconds] = useState(total);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  // Reset whenever the active task changes
  useEffect(() => {
    setSeconds(total);
    setRunning(false);
  }, [task.id, total]);

  // Auto-start when Focus Mode kicks in
  useEffect(() => {
    if (autoStartSignal > 0) {
      setSeconds(total);
      setRunning(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  // Reset when Recovery Mode kicks in
  useEffect(() => {
    if (resetSignal > 0) {
      setSeconds(total);
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    if (!running || paused) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running, paused]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const progress = 1 - seconds / total;
  const C = 2 * Math.PI * 130;
  const done = seconds === 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Now working on</p>
        <h2 className="text-xl font-semibold leading-tight">{task.name}</h2>
      </div>

      <div className="relative">
        <svg width="280" height="280" viewBox="0 0 320 320" className="-rotate-90">
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
          <span className="text-5xl font-display tabular-nums">{fmt(seconds)}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {done ? "Task complete!" : paused ? "Paused — check-in in progress" : running ? "Focus session" : "Ready when you are"}
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {done ? (
          <Button size="lg" onClick={onComplete} className="rounded-2xl px-6 shadow-pillow">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark done · Next
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onClick={() => setRunning((r) => !r)}
              disabled={paused}
              className="rounded-2xl px-8 shadow-pillow"
            >
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={onComplete}
              className="rounded-2xl"
              title="Mark done early"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Done
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={onComplete}
              className="rounded-2xl"
              title="Skip to next task"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </>
        )}
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
