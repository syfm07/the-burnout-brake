import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Mood } from "./MoodPicker";
import { Loader2, Sparkles } from "lucide-react";

type Suggestion = {
  title: string;
  duration_minutes: number;
  why_it_helps: string;
  steps: string[];
  closing_note: string;
};

export function ResetActivity({ mood, onDone }: { mood: Mood; onDone: () => void }) {
  const [data, setData] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: res, error } = await supabase.functions.invoke("mood-action", {
        body: { mood },
      });
      if (cancelled) return;
      if (error || res?.error) {
        toast.error(res?.error || "Couldn't fetch a suggestion. Try again.");
        setLoading(false);
        return;
      }
      setData(res as Suggestion);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mood]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-20 w-20 rounded-full bg-gradient-calm animate-breathe" />
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Crafting your 5-minute reset…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">No suggestion right now.</p>
        <Button onClick={onDone}>Back to timer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-lavender p-2.5 text-lavender-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl leading-tight">{data.title}</h2>
          <p className="text-sm text-muted-foreground">{data.duration_minutes} min · personalized for you</p>
        </div>
      </div>

      <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
        <span className="font-semibold">Why it helps: </span>
        <span className="text-muted-foreground">{data.why_it_helps}</span>
      </div>

      <ol className="space-y-2.5">
        {data.steps.map((s, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>

      <p className="italic text-center text-sage-foreground bg-sage/40 rounded-2xl p-3">
        {data.closing_note}
      </p>

      <Button onClick={onDone} size="lg" className="w-full rounded-2xl shadow-pillow">
        I'm ready to study again
      </Button>
    </div>
  );
}
