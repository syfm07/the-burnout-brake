import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Sparkles } from "lucide-react";

export type PlannedTask = {
  id: string;
  name: string;
  minutes: number;
};

type Draft = { id: string; name: string; minutes: string };

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const newDraft = (): Draft => ({
  id: makeId(),
  name: "",
  minutes: "25",
});

export function SessionPlanner({ onStart }: { onStart: (tasks: PlannedTask[]) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([newDraft(), newDraft()]);

  const update = (id: string, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) =>
    setDrafts((d) => (d.length > 1 ? d.filter((x) => x.id !== id) : d));
  const add = () => setDrafts((d) => [...d, newDraft()]);

  // A row counts as valid as long as the duration is a positive number.
  // Empty names get auto-labeled "Task N" so users aren't blocked.
  const valid = drafts
    .map((d) => ({ ...d, minutesNum: parseInt(d.minutes, 10) }))
    .filter((d) => Number.isFinite(d.minutesNum) && d.minutesNum > 0);

  const totalMin = valid.reduce((s, t) => s + t.minutesNum, 0);

  const handleStart = () => {
    const tasks: PlannedTask[] = valid.map((d, i) => ({
      id: d.id,
      name: d.name.trim() || `Task ${i + 1}`,
      minutes: Math.min(d.minutesNum, 600),
    }));
    if (tasks.length) onStart(tasks);
  };

  const hasLongTask = valid.some((d) => d.minutesNum > 180);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/40 text-xs">
          <Sparkles className="h-3 w-3" /> Plan your day
        </div>
        <h2 className="text-2xl">What's on your plate today?</h2>
        <p className="text-sm text-muted-foreground">
          Add tasks (study, assignments, anything) and how long each should take.
        </p>
      </div>

      <ol className="space-y-2">
        {drafts.map((d, i) => (
          <li key={d.id} className="flex gap-2 items-center bg-secondary/50 rounded-2xl p-2 pl-3">
            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
            <Input
              placeholder="e.g. Math homework"
              value={d.name}
              onChange={(e) => update(d.id, { name: e.target.value })}
              maxLength={60}
              className="flex-1 bg-background/70 rounded-xl border-0"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={600}
                value={d.minutes}
                onChange={(e) => update(d.id, { minutes: e.target.value })}
                className="w-16 bg-background/70 rounded-xl border-0 text-center"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
            <button
              onClick={() => remove(d.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="ghost"
        onClick={add}
        className="w-full rounded-2xl border border-dashed border-border"
      >
        <Plus className="h-4 w-4 mr-1" /> Add another task
      </Button>

      {valid.length > 0 && (
        <div className="bg-sage/30 rounded-2xl p-3 text-sm text-center">
          <span className="font-semibold">{valid.length}</span> task{valid.length > 1 ? "s" : ""} ·{" "}
          <span className="font-semibold">{totalMin}</span> min total
        </div>
      )}

      {(valid.length > 5 || totalMin > 300) && (
        <div className="bg-peach/40 border border-peach rounded-2xl p-4 text-sm space-y-2">
          <p className="font-semibold">
            ⚠️ You have {valid.length} high-priority task{valid.length > 1 ? "s" : ""} today
          </p>
          <p className="text-muted-foreground text-xs">That's a heavy load. Consider:</p>
          <ul className="text-xs space-y-1 ml-1">
            <li>• Postpone low-priority tasks to tomorrow</li>
            <li>• Focus on your top 2–3 only</li>
            <li>• Take recovery breaks between sessions</li>
          </ul>
        </div>
      )}

      {hasLongTask && (
        <div className="bg-peach/40 border border-peach rounded-2xl p-4 text-sm space-y-1">
          <p className="font-semibold">🧠 Long focus session ahead</p>
          <p className="text-muted-foreground text-xs">
            Sessions over 3 hours can drain you. If you're sure, that's okay — just remember to breathe and stretch. You can continue.
          </p>
        </div>
      )}

      <Button
        size="lg"
        onClick={handleStart}
        disabled={valid.length === 0}
        className="w-full rounded-2xl shadow-pillow"
      >
        Build my schedule →
      </Button>
    </div>
  );
}
