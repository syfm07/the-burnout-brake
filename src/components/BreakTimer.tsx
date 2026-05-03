import { useEffect, useState } from "react";
import { Coffee, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export function breakMinutesFor(taskMinutes: number) {
  // Rule of thumb: ~3 min break per 25 min of work, min 1, max 10
  return Math.min(10, Math.max(1, Math.round((taskMinutes / 25) * 3)));
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function BreakTimer({
  minutes,
  nextTaskName,
  onContinue,
}: {
  minutes: number;
  nextTaskName: string;
  onContinue: () => void;
}) {
  const total = minutes * 60;
  const [seconds, setSeconds] = useState(total);

  useEffect(() => {
    const i = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(i);
  }, []);

  useEffect(() => {
    if (seconds === 0) onContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <div className="bg-card/90 backdrop-blur rounded-3xl p-8 shadow-pillow border border-border text-center space-y-5 max-w-md mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/40 text-xs">
        <Coffee className="h-3 w-3" /> Short break
      </div>
      <h2 className="text-2xl">Stretch, sip, breathe.</h2>
      <p className="text-sm text-muted-foreground">
        You've earned a {minutes}-minute pause before <span className="font-semibold">{nextTaskName}</span>.
      </p>
      <div className="text-6xl font-display tabular-nums">{fmt(seconds)}</div>
      <Button onClick={onContinue} size="lg" className="rounded-2xl shadow-pillow">
        <SkipForward className="h-4 w-4 mr-2" />
        Skip & start next task
      </Button>
    </div>
  );
}
