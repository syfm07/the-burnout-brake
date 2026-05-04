import { useEffect, useRef, useState } from "react";

const QUOTES = [
  "You're doing pawsome! 🐾",
  "One task at a time, friend.",
  "Purr-severance pays off!",
  "Breathe in, breathe out. You got this.",
  "Tiny steps, mighty progress.",
  "Meow means 'keep going' in cat.",
  "I believe in you. Truly.",
  "Stretch your back, then conquer!",
];

let audioCtx: AudioContext | null = null;
function meow(soft = true) {
  try {
    if (typeof window === "undefined") return;
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const base = soft ? 520 : 600;
    o.frequency.setValueAtTime(base, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(base + 180, ctx.currentTime + 0.15);
    o.frequency.linearRampToValueAtTime(base - 80, ctx.currentTime + 0.45);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(soft ? 0.08 : 0.14, ctx.currentTime + 0.05);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.55);
  } catch {}
}

export function CatCompanion() {
  const [waving, setWaving] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onDone = () => {
      meow(true);
      setBouncing(true);
      setQuote("Meow~ great job! 🎉");
      window.setTimeout(() => setBouncing(false), 1200);
      window.setTimeout(() => setQuote(null), 2800);
    };
    window.addEventListener("task-completed", onDone);
    return () => window.removeEventListener("task-completed", onDone);
  }, []);

  const handlePat = () => {
    setWaving(true);
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
    meow(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    window.setTimeout(() => setWaving(false), 1000);
    timeoutRef.current = window.setTimeout(() => setQuote(null), 2600);
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-40 pointer-events-none select-none"
      style={{ width: 96 }}
    >
      {quote && (
        <div className="mb-2 ml-2 inline-block max-w-[180px] bg-card border border-border rounded-2xl px-3 py-1.5 text-[11px] shadow-soft animate-in fade-in slide-in-from-bottom-2">
          {quote}
        </div>
      )}
      <button
        onClick={handlePat}
        aria-label="Pat the cat"
        className={`pointer-events-auto block transition-transform hover:scale-110 active:scale-95 ${bouncing ? "animate-bounce" : ""}`}
      >
        <svg width="72" height="72" viewBox="0 0 72 72" className="drop-shadow-md">
          <path
            d="M58 52 Q70 48 66 36"
            stroke="#c4956c"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            style={{
              transformOrigin: "58px 52px",
              animation: "cat-tail 2.4s ease-in-out infinite",
            }}
          />
          <ellipse cx="36" cy="50" rx="20" ry="15" fill="#d9a878" />
          <circle cx="36" cy="32" r="16" fill="#e8b888" />
          <polygon points="22,22 26,10 32,20" fill="#d9a878" />
          <polygon points="50,22 46,10 40,20" fill="#d9a878" />
          <polygon points="24,20 26,14 30,19" fill="#f4c4a0" />
          <polygon points="48,20 46,14 42,19" fill="#f4c4a0" />
          <ellipse cx="30" cy="32" rx="2" ry="3" fill="#2b2b2b" />
          <ellipse cx="42" cy="32" rx="2" ry="3" fill="#2b2b2b" />
          <circle cx="30.5" cy="31" r="0.6" fill="#fff" />
          <circle cx="42.5" cy="31" r="0.6" fill="#fff" />
          <path d="M36 37 l-1.5 1.5 h3 z" fill="#e08aa8" />
          <path d="M36 38.5 q-2 2 -3.5 1 M36 38.5 q2 2 3.5 1" stroke="#2b2b2b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <line x1="22" y1="36" x2="30" y2="37" stroke="#2b2b2b" strokeWidth="0.6" />
          <line x1="22" y1="38" x2="30" y2="38" stroke="#2b2b2b" strokeWidth="0.6" />
          <line x1="50" y1="36" x2="42" y2="37" stroke="#2b2b2b" strokeWidth="0.6" />
          <line x1="50" y1="38" x2="42" y2="38" stroke="#2b2b2b" strokeWidth="0.6" />
          <g
            style={{
              transformOrigin: "22px 50px",
              animation: waving ? "cat-wave 0.5s ease-in-out 2" : "none",
            }}
          >
            <ellipse cx="20" cy="52" rx="5" ry="6" fill="#e8b888" />
          </g>
          <ellipse cx="50" cy="60" rx="5" ry="4" fill="#e8b888" />
        </svg>
      </button>

      <style>{`
        @keyframes cat-tail {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes cat-wave {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-45deg) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
