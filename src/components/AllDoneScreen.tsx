import { useMemo } from "react";
import { Sparkles, Coffee, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUOTES = [
  "Rest is part of the work, not the reward. 🌿",
  "You showed up — that's the hardest part. ✨",
  "Progress, not perfection. Be proud. 💛",
  "Your future self is already thanking you. 🌸",
  "Tiny consistent effort beats huge bursts. 🌊",
  "You did the thing. Now soften your shoulders. 🫶",
];

export function AllDoneScreen({
  onRest,
  onContinue,
  onHome,
}: {
  onRest: () => void;
  onContinue: () => void;
  onHome: () => void;
}) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="bg-card/90 backdrop-blur rounded-3xl p-8 shadow-pillow border border-border text-center space-y-5 max-w-md mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/40 text-xs">
        <Sparkles className="h-3 w-3" /> All tasks done
      </div>
      <h2 className="text-3xl">You did it. 🎉</h2>
      <p className="text-base text-muted-foreground italic">"{quote}"</p>
      <div className="grid grid-cols-1 gap-2 pt-2">
        <Button onClick={onHome} size="lg" className="rounded-2xl shadow-pillow">
          <Home className="h-4 w-4 mr-2" />
          Back to plan a new day
        </Button>
      </div>
    </div>
  );
}
