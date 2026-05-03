import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StudyTimer } from "@/components/StudyTimer";
import { MoodPicker, type Mood } from "@/components/MoodPicker";
import { ResetActivity } from "@/components/ResetActivity";
import { SessionPlanner, type PlannedTask } from "@/components/SessionPlanner";
import { AppToaster } from "@/components/Toaster";
import { Brain, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "The Burnout Brake — A kinder study timer" },
      { name: "description", content: "Plan your day, then study with a smart timer that checks in on your mood and offers personalized resets." },
    ],
  }),
});

type Overlay = null | "mood" | "reset";

function Index() {
  const [tasks, setTasks] = useState<PlannedTask[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Re-tick the schedule clock so upcoming start times reflect real time
  useEffect(() => {
    if (!tasks) return;
    const i = window.setInterval(() => setNow(new Date()), 30 * 1000);
    return () => window.clearInterval(i);
  }, [tasks]);

  // Pause the running timer whenever a non-focused mood is picked
  const paused = overlay === "reset" && mood !== null && mood !== "focused";

  // Auto check-in every 30 seconds (testing) — only while a session is active
  useEffect(() => {
    if (!tasks) return;
    const i = window.setInterval(() => {
      setOverlay((cur) => (cur === null ? "mood" : cur));
    }, 30 * 1000);
    return () => window.clearInterval(i);
  }, [tasks]);

  const closeOverlay = () => { setOverlay(null); setMood(null); };

  const schedule = useMemo(() => {
    if (!tasks) return [];
    let cursor = new Date(now);
    return tasks.map((t, i) => {
      if (i < activeIdx) return { task: t, start: null as Date | null, end: null as Date | null };
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + t.minutes * 60_000);
      cursor = end;
      return { task: t, start, end };
    });
  }, [tasks, activeIdx, now]);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const completeTask = () => {
    if (!tasks) return;
    if (activeIdx + 1 < tasks.length) setActiveIdx(activeIdx + 1);
    else { setTasks(null); setActiveIdx(0); }
  };

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
        {tasks && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setTasks(null); setActiveIdx(0); closeOverlay(); }}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> New plan
          </Button>
        )}
      </header>

      {!tasks ? (
        <section className="w-full max-w-md bg-card/80 backdrop-blur rounded-3xl p-7 shadow-pillow border border-border">
          <SessionPlanner onStart={(t) => { setTasks(t); setActiveIdx(0); }} />
        </section>
      ) : (
        <>
          <section className="w-full max-w-md bg-card/80 backdrop-blur rounded-3xl p-6 shadow-pillow border border-border">
            <StudyTimer
              task={tasks[activeIdx]}
              paused={paused}
              onCheckIn={() => setOverlay("mood")}
              onComplete={completeTask}
            />
          </section>

          <section className="w-full max-w-md mt-5 bg-card/60 backdrop-blur rounded-3xl p-5 border border-border">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Today's schedule
            </h3>
            <ol className="space-y-2">
              {schedule.map(({ task, start, end }, i) => {
                const isActive = i === activeIdx;
                const isDone = i < activeIdx;
                return (
                  <li
                    key={task.id}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                      isActive ? "bg-lavender/40" : ""
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-sage-foreground flex-shrink-0" />
                    ) : (
                      <Circle className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {task.name}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {start && end ? `${fmtTime(start)} – ${fmtTime(end)} · ` : ""}{task.minutes}m
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <footer className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        Built with care for high-school students. You're allowed to rest.
      </footer>

      {overlay !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {overlay === "mood" && (
                <MoodPicker
                  onPick={(m) => { setMood(m); setOverlay("reset"); }}
                />
              )}
              {overlay === "reset" && mood && (
                <ResetActivity mood={mood} onDone={closeOverlay} />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
