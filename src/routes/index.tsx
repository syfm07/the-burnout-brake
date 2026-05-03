import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StudyTimer } from "@/components/StudyTimer";
import { MoodPicker, type Mood } from "@/components/MoodPicker";
import { ResetActivity } from "@/components/ResetActivity";
import { AppToaster } from "@/components/Toaster";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "The Burnout Brake — A kinder study timer" },
      { name: "description", content: "A smart Pomodoro timer that checks in on your mood and suggests a personalized 5-minute reset to protect you from study burnout." },
    ],
  }),
});

type View = "timer" | "mood" | "reset";

function Index() {
  const [view, setView] = useState<View>("timer");
  const [mood, setMood] = useState<Mood | null>(null);

  // Auto check-in every hour while on the timer
  useEffect(() => {
    if (view !== "timer") return;
    const t = window.setTimeout(() => setView("mood"), 60 * 60 * 1000);
    return () => window.clearTimeout(t);
  }, [view]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <AppToaster />

      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-calm grid place-items-center shadow-soft">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg leading-tight">The Burnout Brake</h1>
            <p className="text-xs text-muted-foreground">Study softer. Last longer.</p>
          </div>
        </div>
      </header>

      <section className="w-full max-w-md bg-card/80 backdrop-blur rounded-3xl p-7 shadow-pillow border border-border">
        {view === "timer" && <StudyTimer onCheckIn={() => setView("mood")} />}
        {view === "mood" && (
          <MoodPicker
            onPick={(m) => { setMood(m); setView("reset"); }}
          />
        )}
        {view === "reset" && mood && (
          <ResetActivity mood={mood} onDone={() => setView("timer")} />
        )}
      </section>

      <footer className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        Built with care for high-school students. You're allowed to rest.
      </footer>
    </main>
  );
}
