import { useEffect, useState } from "react";
import { GraduationCap, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STORAGE_KEY = "burnout-brake-exam";
const NOTIF_KEY = "burnout-brake-exam-notified";

type Exam = { name: string; date: string } | null;

export function useExam() {
  const [exam, setExamState] = useState<Exam>(null);
  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) try { setExamState(JSON.parse(v)); } catch {}
  }, []);
  const setExam = (e: Exam) => {
    setExamState(e);
    if (e) localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
    else { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(NOTIF_KEY); }
  };
  return { exam, setExam };
}

function daysUntil(date: string) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const ENCOURAGEMENTS = [
  "You've got this — every minute of focus counts. 💪",
  "Small steady steps beat last-minute panic. 🌱",
  "Believe in the work you've already put in. ✨",
  "Breathe. You're more prepared than you think. 🌿",
];

export function ExamCountdown() {
  const { exam, setExam } = useExam();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  // Notify when exam is near (≤7 days), once per day
  useEffect(() => {
    if (!exam) return;
    const days = daysUntil(exam.date);
    if (days < 0 || days > 7) return;
    const today = new Date().toDateString();
    const last = localStorage.getItem(NOTIF_KEY);
    if (last === today) return;
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    toast(`📚 ${exam.name} in ${days} day${days === 1 ? "" : "s"}`, { description: msg, duration: 6000 });
    localStorage.setItem(NOTIF_KEY, today);
  }, [exam]);

  if (editing || !exam) {
    return (
      <div className="bg-card/80 backdrop-blur rounded-2xl p-3 border border-border w-full max-w-[220px] space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Exam countdown</span>
        </div>
        <Input
          placeholder="Exam name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs rounded-xl"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 text-xs rounded-xl"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="flex-1 h-7 text-xs rounded-xl"
            disabled={!name || !date}
            onClick={() => { setExam({ name, date }); setEditing(false); setName(""); setDate(""); }}
          >
            Save
          </Button>
          {exam && (
            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-xl" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  const days = daysUntil(exam.date);
  const tone = days <= 3 ? "text-destructive" : days <= 7 ? "text-primary" : "text-foreground";

  return (
    <div className="bg-card/80 backdrop-blur rounded-2xl p-3 border border-border flex items-center gap-3 shadow-soft">
      <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{exam.name}</p>
        <p className={`text-lg font-display tabular-nums leading-tight ${tone}`}>
          {days < 0 ? "Done" : days === 0 ? "Today!" : `${days}d`}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={() => { setName(exam.name); setDate(exam.date); setEditing(true); }} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Edit">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={() => setExam(null)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Remove">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function ExamCountdownToggle({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="bg-card/60 backdrop-blur rounded-2xl px-3 py-2 border border-dashed border-border text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
    >
      <GraduationCap className="h-3 w-3" /> Add exam
    </button>
  );
}
