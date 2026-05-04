import { useEffect, useRef, useState } from "react";
import catWalking from "@/assets/cat-walking.png";
import catStudying from "@/assets/cat-studying.png";
import catYawning from "@/assets/cat-yawning.png";

const QUOTES = [
  "You're doing pawsome! 🐾",
  "One task at a time, friend.",
  "Purr-severance pays off!",
  "Breathe in, breathe out. You got this.",
  "Tiny steps, mighty progress.",
  "I believe in you. Truly.",
  "Stretch your back, then conquer!",
];

type Mode = "idle" | "studying" | "yawning";

export function CatCompanion() {
  const [mode, setMode] = useState<Mode>("idle");
  const [quote, setQuote] = useState<string | null>(null);
  const [waving, setWaving] = useState(false);
  const yawnTimerRef = useRef<number | null>(null);
  const quoteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onDone = () => {
      setMode("yawning");
      setQuote("Yawn~ great job! 🥱");
      if (yawnTimerRef.current) window.clearTimeout(yawnTimerRef.current);
      if (quoteTimerRef.current) window.clearTimeout(quoteTimerRef.current);
      yawnTimerRef.current = window.setTimeout(() => {
        setMode((m) => (m === "yawning" ? "idle" : m));
      }, 3500);
      quoteTimerRef.current = window.setTimeout(() => setQuote(null), 3000);
    };
    const onFocus = (e: Event) => {
      const focusing = (e as CustomEvent).detail?.focusing;
      setMode((m) => {
        if (m === "yawning") return m;
        return focusing ? "studying" : "idle";
      });
    };
    window.addEventListener("task-completed", onDone);
    window.addEventListener("focus-state", onFocus as EventListener);
    return () => {
      window.removeEventListener("task-completed", onDone);
      window.removeEventListener("focus-state", onFocus as EventListener);
    };
  }, []);

  const handlePat = () => {
    setWaving(true);
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
    if (quoteTimerRef.current) window.clearTimeout(quoteTimerRef.current);
    window.setTimeout(() => setWaving(false), 700);
    quoteTimerRef.current = window.setTimeout(() => setQuote(null), 2600);
  };

  const src = mode === "studying" ? catStudying : mode === "yawning" ? catYawning : catWalking;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 pointer-events-none select-none"
      style={{ width: 110 }}
    >
      {quote && (
        <div className="mb-2 ml-2 inline-block max-w-[180px] bg-card border border-border rounded-2xl px-3 py-1.5 text-[11px] shadow-soft animate-in fade-in slide-in-from-bottom-2">
          {quote}
        </div>
      )}
      <button
        onClick={handlePat}
        aria-label="Pat the cat"
        className={`pointer-events-auto block transition-transform hover:scale-110 active:scale-95 ${waving ? "cat-wave" : mode === "idle" ? "cat-bob" : ""}`}
      >
        <img
          src={src}
          alt="Cat companion"
          width={110}
          height={110}
          loading="lazy"
          className="drop-shadow-md"
          style={{ width: 110, height: 110, objectFit: "contain" }}
        />
      </button>

      <style>{`
        @keyframes cat-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes cat-wave-anim {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .cat-bob { animation: cat-bob 1.6s ease-in-out infinite; transform-origin: bottom center; }
        .cat-wave { animation: cat-wave-anim 0.5s ease-in-out 2; transform-origin: bottom center; }
      `}</style>
    </div>
  );
}
