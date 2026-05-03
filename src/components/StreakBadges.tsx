import { Flame, Award } from "lucide-react";
import compassImg from "@/assets/badges/compass.png";
import fireImg from "@/assets/badges/fire.png";
import mapImg from "@/assets/badges/map.png";
import whistleImg from "@/assets/badges/whistle.png";
import tentImg from "@/assets/badges/tent.png";
import mountainImg from "@/assets/badges/mountain.png";

export type BadgeDef = { id: string; name: string; image: string; threshold: number };

export const BADGES: BadgeDef[] = [
  { id: "compass", name: "Compass", image: compassImg, threshold: 5 },
  { id: "fire", name: "Fire", image: fireImg, threshold: 10 },
  { id: "map", name: "Map", image: mapImg, threshold: 15 },
  { id: "whistle", name: "Whistle", image: whistleImg, threshold: 20 },
  { id: "tent", name: "Tent", image: tentImg, threshold: 25 },
  { id: "mountain", name: "Mountain", image: mountainImg, threshold: 30 },
];

export function badgesEarned(streak: number) {
  return BADGES.filter((b) => streak >= b.threshold);
}

export function nextBadge(streak: number) {
  return BADGES.find((b) => streak < b.threshold);
}

export function StreakBadges({ streak }: { streak: number }) {
  const earned = badgesEarned(streak);
  const next = nextBadge(streak);
  const toGo = next ? next.threshold - streak : 0;

  return (
    <div className="bg-card/60 backdrop-blur rounded-3xl p-5 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Streak</span>
          <span className="text-2xl font-display tabular-nums">{streak}</span>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          {next ? (
            <>
              {toGo} more for <span className="font-semibold">{next.name}</span>
            </>
          ) : (
            <span className="font-semibold">All badges earned! 🎉</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((b) => {
          const has = earned.some((e) => e.id === b.id);
          return (
            <div
              key={b.id}
              title={`${b.name} · ${b.threshold} tasks`}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${
                has
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-transparent opacity-50 grayscale"
              }`}
            >
              <img
                src={b.image}
                alt={b.name}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
              <span className="text-[11px] font-medium">{b.name}</span>
              <span className="text-[10px] text-muted-foreground">{b.threshold}</span>
            </div>
          );
        })}
      </div>
      {!next && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="h-3 w-3" /> You're unstoppable.
        </div>
      )}
    </div>
  );
}
