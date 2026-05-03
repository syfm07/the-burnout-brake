import { Button } from "@/components/ui/button";

export type Mood = "stressed" | "tired" | "bored" | "focused";

const MOODS: { id: Mood; emoji: string; label: string; bg: string }[] = [
  { id: "stressed", emoji: "😵", label: "Stressed", bg: "bg-peach" },
  { id: "tired", emoji: "🥱", label: "Tired", bg: "bg-lavender" },
  { id: "bored", emoji: "😐", label: "Bored", bg: "bg-sun" },
  { id: "focused", emoji: "😊", label: "Focused", bg: "bg-sage" },
];

export function MoodPicker({ onPick }: { onPick: (m: Mood) => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-3xl">How are you feeling?</h2>
        <p className="text-muted-foreground">A quick check-in — no wrong answers.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onPick(m.id)}
            className={`${m.bg} text-foreground rounded-3xl p-5 flex flex-col items-center gap-2 shadow-pillow transition-transform hover:-translate-y-1 active:translate-y-0 active:scale-95`}
          >
            <span className="text-4xl">{m.emoji}</span>
            <span className="font-semibold">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
