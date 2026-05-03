import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

const STORAGE_KEY = "burnout-brake-completions";

export function logCompletion() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  let arr: number[] = [];
  if (raw) try { arr = JSON.parse(raw); } catch {}
  arr.push(Date.now());
  // Keep last 200
  if (arr.length > 200) arr = arr.slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function PeakHours() {
  const [hours, setHours] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const arr: number[] = JSON.parse(raw);
      const buckets = new Array(24).fill(0);
      arr.forEach((ts) => { buckets[new Date(ts).getHours()]++; });
      setHours(buckets);
    } catch {}
  }, []);

  const max = Math.max(1, ...hours);
  const total = hours.reduce((a, b) => a + b, 0);
  const topHour = hours.indexOf(max);

  const fmtHour = (h: number) => {
    const ampm = h < 12 ? "AM" : "PM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}${ampm}`;
  };

  return (
    <div className="bg-card/60 backdrop-blur rounded-3xl p-5 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Peak study hours</span>
        </div>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            Top: <span className="font-semibold text-foreground">{fmtHour(topHour)}</span>
          </span>
        )}
      </div>
      {total === 0 ? (
        <p className="text-xs text-muted-foreground">Finish tasks to see when you study best.</p>
      ) : (
        <div className="flex items-end gap-[2px] h-16">
          {hours.map((c, h) => (
            <div
              key={h}
              title={`${fmtHour(h)}: ${c}`}
              className={`flex-1 rounded-t-sm transition-all ${
                c === max && c > 0 ? "bg-primary" : c > 0 ? "bg-primary/40" : "bg-secondary/40"
              }`}
              style={{ height: `${(c / max) * 100}%`, minHeight: c > 0 ? 4 : 2 }}
            />
          ))}
        </div>
      )}
      {total > 0 && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span>
        </div>
      )}
    </div>
  );
}
