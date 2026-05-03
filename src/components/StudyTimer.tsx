import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward, HeartHandshake, CheckCircle2, ShieldAlert } from "lucide-react";
import type { PlannedTask } from "./SessionPlanner";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

const BLOCKED_APPS = ["TikTok", "Instagram", "YouTube", "Twitter / X", "Snapchat", "Reddit"];

export function StudyTimer({
  task,
  paused,
  onCheckIn,
  onComplete,
}: {
  task: PlannedTask;
  paused: boolean;
  onCheckIn: () => void;
  onComplete: () => void;
}) {
  const total = task.minutes * 60;
  const [seconds, setSeconds] = useState(total);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  // Distraction tracking
  const [pauseCount, setPauseCount] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showDistractionPrompt, setShowDistractionPrompt] = useState(false);
  const [showAwayPrompt, setShowAwayPrompt] = useState(false);
  const [resetSeconds, setResetSeconds] = useState<number | null>(null);
  const distractedShownRef = useRef(false);

  // Reset whenever the active task changes
  useEffect(() => {
    setSeconds(total);
    setRunning(false);
    setPauseCount(0);
    setTabSwitches(0);
    distractedShownRef.current = false;
  }, [task.id, total]);

  // Main countdown
  useEffect(() => {
    if (!running || paused || resetSeconds !== null) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running, paused, resetSeconds]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  // 2-minute reset countdown
  useEffect(() => {
    if (resetSeconds === null) return;
    if (resetSeconds <= 0) { setResetSeconds(null); return; }
    const id = window.setInterval(() => {
      setResetSeconds((s) => (s === null ? null : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resetSeconds]);

  // Tab/app away detection — auto-pause + prompt
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && running) {
        setRunning(false);
        setShowAwayPrompt(true);
        setTabSwitches((n) => {
          const next = n + 1;
          if (next >= 2 && !distractedShownRef.current) {
            distractedShownRef.current = true;
            setShowDistractionPrompt(true);
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running]);

  // Fullscreen on start
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch { /* ignore */ }
  };

  const handleStartPause = () => {
    if (running) {
      // Pausing
      setRunning(false);
      setPauseCount((n) => {
        const next = n + 1;
        if (next >= 3 && !distractedShownRef.current) {
          distractedShownRef.current = true;
          setShowDistractionPrompt(true);
        }
        return next;
      });
    } else {
      enterFullscreen();
      setRunning(true);
    }
  };

  const acceptReset = () => {
    setShowDistractionPrompt(false);
    setRunning(false);
    setResetSeconds(120);
  };

  const declineReset = () => {
    setShowDistractionPrompt(false);
    distractedShownRef.current = false;
    setPauseCount(0);
    setTabSwitches(0);
    if (seconds > 0) setRunning(true);
  };

  const dismissAway = () => {
    setShowAwayPrompt(false);
    if (seconds > 0) setRunning(true);
    enterFullscreen();
  };

  const progress = 1 - seconds / total; // 0 → 1
  const done = seconds === 0;
  // Cartoon ice melt: cube shrinks slightly + sags, drips elongate, puddle grows
  const cubeScale = 1 - progress * 0.35;
  const cubeSag = progress * 18; // px the cube settles into puddle
  const dripLen = 10 + progress * 70; // how far each drip stretches down
  const puddleScale = 0.4 + progress * 1.1;
  const STROKE = "#2b6a8f";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Now working on</p>
        <h2 className="text-xl font-semibold leading-tight">{task.name}</h2>
      </div>

      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        <svg viewBox="0 0 300 300" width="300" height="300" className="overflow-visible">
          <defs>
            <linearGradient id="iceFace" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f4fbff" />
              <stop offset="100%" stopColor="#cfeaf7" />
            </linearGradient>
            <linearGradient id="iceSide" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#dff1fb" />
              <stop offset="100%" stopColor="#a9d6ec" />
            </linearGradient>
            <linearGradient id="iceTop" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e6f4fb" />
            </linearGradient>
            <radialGradient id="puddle" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bfe3f5" />
              <stop offset="100%" stopColor="#7ec3e0" />
            </radialGradient>
          </defs>

          {/* Puddle */}
          <g
            transform={`translate(150 245) scale(${puddleScale} ${puddleScale * 0.55})`}
            style={{ transition: "transform 1s linear" }}
          >
            <path
              d="M -110 0 C -120 -22, -70 -34, -30 -28 C 10 -36, 70 -30, 100 -18 C 130 -6, 120 18, 80 22 C 30 30, -40 28, -90 18 C -120 12, -118 6, -110 0 Z"
              fill="url(#puddle)"
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
              opacity={Math.min(1, 0.15 + progress * 1.1)}
            />
            {/* shine */}
            <ellipse cx="-30" cy="-14" rx="40" ry="4" fill="#ffffff" opacity={0.6 * progress} />
          </g>

          {/* Ice cube */}
          {!done && (
            <g
              transform={`translate(150 ${130 + cubeSag}) scale(${cubeScale})`}
              style={{ transition: "transform 1s linear" }}
            >
              {/* drips hanging from bottom edge */}
              {[-55, -25, 5, 35].map((x, i) => {
                const len = dripLen * (0.7 + ((i * 13) % 7) / 10);
                return (
                  <path
                    key={i}
                    d={`M ${x - 8} 55 Q ${x - 10} ${55 + len * 0.6}, ${x} ${55 + len} Q ${x + 10} ${55 + len * 0.6}, ${x + 8} 55 Z`}
                    fill="url(#iceSide)"
                    stroke={STROKE}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    style={{ transition: "d 1s linear" }}
                  />
                );
              })}

              {/* right side face */}
              <path
                d="M 60 -45 L 90 -75 L 90 35 L 60 55 Z"
                fill="url(#iceSide)"
                stroke={STROKE}
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* top face */}
              <path
                d="M -60 -45 L -30 -75 L 90 -75 L 60 -45 Z"
                fill="url(#iceTop)"
                stroke={STROKE}
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* front face */}
              <path
                d="M -60 -45 L 60 -45 L 60 55 L -60 55 Z"
                fill="url(#iceFace)"
                stroke={STROKE}
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* drip lips on front edge */}
              <path
                d="M -45 -45 Q -42 -25, -50 -10 Q -58 -25, -55 -45 Z"
                fill="#ffffff"
                stroke={STROKE}
                strokeWidth="3"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <path
                d="M 20 -45 Q 24 -20, 14 -5 Q 4 -22, 8 -45 Z"
                fill="#ffffff"
                stroke={STROKE}
                strokeWidth="3"
                strokeLinejoin="round"
                opacity="0.9"
              />
              {/* highlights */}
              <path d="M -50 -38 L -50 40" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              <path d="M -25 -68 L 80 -68" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            </g>
          )}
        </svg>

        {/* Timer text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-display tabular-nums drop-shadow-sm">{fmt(seconds)}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {done ? "Melted — task complete!" : paused ? "Paused — check-in in progress" : running ? "Ice is melting…" : "Ready when you are"}
          </span>
        </div>
      </div>

      {running && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-full px-3 py-1">
          <ShieldAlert className="h-3 w-3 text-primary" />
          <span>Distraction shield on · {BLOCKED_APPS.join(", ")} muted</span>
        </div>
      )}

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
              onClick={handleStartPause}
              disabled={paused}
              className="rounded-2xl px-8 shadow-pillow"
            >
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button size="lg" variant="secondary" onClick={onComplete} className="rounded-2xl" title="Mark done early">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Done
            </Button>
            <Button size="lg" variant="ghost" onClick={onComplete} className="rounded-2xl" title="Skip to next task">
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

      {/* Distraction reset prompt */}
      {showDistractionPrompt && resetSeconds === null && (
        <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 shadow-pillow border border-border max-w-sm w-full space-y-4 text-center">
            <h3 className="text-lg font-semibold">You seem distracted 🌿</h3>
            <p className="text-sm text-muted-foreground">Want a 2-minute reset? Breathe, stretch, sip some water.</p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 rounded-2xl" onClick={declineReset}>No, keep going</Button>
              <Button className="flex-1 rounded-2xl" onClick={acceptReset}>Yes, 2-min reset</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2-minute reset countdown */}
      {resetSeconds !== null && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-8 shadow-pillow border border-border max-w-sm w-full space-y-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Quick reset</p>
            <div className="text-6xl font-display tabular-nums">{fmt(resetSeconds)}</div>
            <p className="text-sm text-muted-foreground">Close your eyes. The main timer is paused.</p>
            <Button variant="ghost" className="rounded-2xl" onClick={() => { setResetSeconds(null); setRunning(true); }}>
              Skip reset
            </Button>
          </div>
        </div>
      )}

      {/* Away prompt */}
      {showAwayPrompt && (
        <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 shadow-pillow border border-border max-w-sm w-full space-y-4 text-center">
            <h3 className="text-lg font-semibold">Still studying? 💭</h3>
            <p className="text-sm text-muted-foreground">Your timer paused while you were away. Come back when ready.</p>
            <Button className="w-full rounded-2xl" onClick={dismissAway}>I'm back</Button>
          </div>
        </div>
      )}
    </div>
  );
}
