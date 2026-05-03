import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StudyTimer } from "@/components/StudyTimer";
import { MoodPicker, type Mood } from "@/components/MoodPicker";
import { ResetActivity } from "@/components/ResetActivity";
import { SessionPlanner, type PlannedTask } from "@/components/SessionPlanner";
import { AppToaster } from "@/components/Toaster";
import { ThemePicker, useTheme } from "@/components/ThemePicker";
import { ThemeScene, THEME_TAGLINES } from "@/components/ThemeScene";
import { StreakBadges, BADGES } from "@/components/StreakBadges";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ExamCountdown, useExam } from "@/components/ExamCountdown";
import { PeakHours, logCompletion } from "@/components/PeakHours";
import { BreakTimer, breakMinutesFor } from "@/components/BreakTimer";
import { AllDoneScreen } from "@/components/AllDoneScreen";
import { toast } from "sonner";
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
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState<PlannedTask[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  
  const [activeStart, setActiveStart] = useState<Date>(() => new Date());
  const tagline = THEME_TAGLINES[theme];
  const { exam } = useExam();
  const [showExamPrompt, setShowExamPrompt] = useState(false);
  const [examPromptDismissed, setExamPromptDismissed] = useState(false);

  const [breakInfo, setBreakInfo] = useState<{ minutes: number; nextName: string } | null>(null);
  const [allDone, setAllDone] = useState(false);

  // Streak + badges
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const v = localStorage.getItem("burnout-brake-streak");
    return v ? parseInt(v, 10) || 0 : 0;
  });
  useEffect(() => {
    localStorage.setItem("burnout-brake-streak", String(streak));
  }, [streak]);


  // Pause the running timer whenever a non-focused mood is picked
  const paused = overlay === "reset" && mood !== null && mood !== "focused";

  // Auto check-in every 10 minutes — only while a session is active
  useEffect(() => {
    if (!tasks) return;
    const i = window.setInterval(() => {
      setOverlay((cur) => (cur === null ? "mood" : cur));
    }, 10 * 60 * 1000);
    return () => window.clearInterval(i);
  }, [tasks]);

  const closeOverlay = () => { setOverlay(null); setMood(null); };

  const schedule = useMemo(() => {
    if (!tasks) return [];
    let cursor = new Date(activeStart);
    return tasks.map((t, i) => {
      if (i < activeIdx) return { task: t, start: null as Date | null, end: null as Date | null };
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + t.minutes * 60_000);
      cursor = end;
      return { task: t, start, end };
    });
  }, [tasks, activeIdx, activeStart]);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const completeTask = () => {
    if (!tasks) return;
    logCompletion();
    const newStreak = streak + 1;
    setStreak(newStreak);
    const earned = BADGES.find((b) => b.threshold === newStreak);
    if (earned) {
      toast.success(`New badge unlocked: ${earned.name}!`, { duration: 5000 });
    } else {
      toast(`Task done! 🎉 Streak: ${newStreak}`);
    }
    const finishedTask = tasks[activeIdx];
    if (activeIdx + 1 < tasks.length) {
      const nextTask = tasks[activeIdx + 1];
      setBreakInfo({ minutes: breakMinutesFor(finishedTask.minutes), nextName: nextTask.name });
    } else {
      setAllDone(true);
    }
  };

  const finishBreak = () => {
    if (!tasks) return;
    setBreakInfo(null);
    if (activeIdx + 1 < tasks.length) {
      setActiveIdx(activeIdx + 1);
      setActiveStart(new Date());
    }
  };

  const handleRest = () => {
    setAllDone(false);
    setTasks(null);
    setActiveIdx(0);
  };

  const handleAddMore = () => {
    setAllDone(false);
    setTasks(null);
    setActiveIdx(0);
  };

  const handleHome = () => {
    setAllDone(false);
    setTasks(null);
    setActiveIdx(0);
  };

  // Show exam-countdown prompt on the landing/planner page once per visit
  useEffect(() => {
    if (!tasks && !exam && !examPromptDismissed) {
      const t = window.setTimeout(() => setShowExamPrompt(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [tasks, exam, examPromptDismissed]);

  // Auto-dismiss the prompt once the user has saved an exam
  useEffect(() => {
    if (exam && showExamPrompt) setShowExamPrompt(false);
  }, [exam, showExamPrompt]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <ThemeScene theme={theme} />
      <AppToaster />

      <header className="w-full max-w-6xl flex items-start justify-between gap-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-calm grid place-items-center shadow-soft">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg leading-tight">The Burnout Brake</h1>
            <p className="text-xs text-muted-foreground">{tagline.emoji} {tagline.tag}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExamCountdown displayOnly={!!exam} />
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
          <ThemePicker theme={theme} onChange={setTheme} />
        </div>
      </header>

      {!tasks ? (
        <section className="w-full max-w-md bg-card/80 backdrop-blur rounded-3xl p-7 shadow-pillow border border-border">
          <SessionPlanner onStart={(t) => { setTasks(t); setActiveIdx(0); setActiveStart(new Date()); }} />
        </section>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,28rem)_1fr] gap-5 items-start">
          {/* LEFT — Schedule + Peak Hours */}
          <div className="space-y-5 lg:order-1 order-2">
            <section className="bg-card/60 backdrop-blur rounded-3xl p-5 border border-border">
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
            <PeakHours />
          </div>

          {/* CENTER — Timer */}
          <section className="bg-card/80 backdrop-blur rounded-3xl p-6 shadow-pillow border border-border space-y-4 lg:order-2 order-1">
            <StudyTimer
              task={tasks[activeIdx]}
              paused={paused}
              onCheckIn={() => setOverlay("mood")}
              onComplete={completeTask}
            />
          </section>

          {/* RIGHT — Streak + Music */}
          <div className="space-y-5 lg:order-3 order-3">
            <StreakBadges streak={streak} />
            <MusicPlayer />
          </div>
        </div>
      )}

      <footer className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        Built with care for high-school students. You're allowed to rest.
      </footer>

      {breakInfo && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <BreakTimer minutes={breakInfo.minutes} nextTaskName={breakInfo.nextName} onContinue={finishBreak} />
          </div>
        </div>
      )}

      {allDone && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <AllDoneScreen onRest={handleRest} onContinue={handleAddMore} onHome={handleHome} />
          </div>
        </div>
      )}

      {overlay !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {overlay === "mood" && (
                <MoodPicker
                  onPick={(m) => {
                    setMood(m);
                    setOverlay("reset");
                  }}
                />
              )}
              {overlay === "reset" && mood && (
                <ResetActivity mood={mood} onDone={closeOverlay} />
              )}
            </div>
          </div>
        </div>
      )}

      {showExamPrompt && !exam && !tasks && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 shadow-pillow border border-border max-w-sm w-full space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">Got an exam coming up? 📚</h3>
              <p className="text-xs text-muted-foreground">
                Add a countdown so you can see how many days you have to prepare.
              </p>
            </div>
            <ExamCountdown />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 rounded-2xl text-xs"
                onClick={() => { setShowExamPrompt(false); setExamPromptDismissed(true); }}
              >
                Skip for now
              </Button>
              <Button
                className="flex-1 rounded-2xl text-xs"
                onClick={() => setShowExamPrompt(false)}
                disabled={!exam}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
