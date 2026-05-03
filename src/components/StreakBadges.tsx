import { Flame, Award } from "lucide-react";

export type BadgeDef = { id: string; name: string; emoji: string; threshold: number };

export const BADGES: BadgeDef[] = [
  { id: "scout", name: "Scout", emoji: "🥉", threshold: 5 },
  { id: "ranger", name: "Ranger", emoji: "🥈", threshold: 10 },
  { id: "champion", name: "Champion", emoji: "🥇", threshold: 15 },
  { id: "sage", name: "Sage", emoji: "🏅", threshold: 20 },
  { id: "legend", name: "Legend", emoji: "🏆", threshold: 25 },
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
    <div className="bg-card/60 backdrop-blur rounded-3xl p-5 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Streak</span>
          <span className="text-2xl font-display tabular-nums">{streak}</span>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          {next ? (
            <>
              {toGo} more for <span className="font-semibold">{next.emoji} {next.name}</span>
            </>
          ) : (
            <span className="font-semibold">All badges earned! 🎉</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {BADGES.map((b) => {
          const has = earned.some((e) => e.id === b.id);
          return (
            <div
              key={b.id}
              title={`${b.name} · ${b.threshold} tasks`}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all ${
                has
                  ? "bg-primary/15 border-primary/30 text-foreground"
                  : "bg-secondary/40 border-transparent text-muted-foreground opacity-60"
              }`}
            >
              <span className="text-base">{has ? b.emoji : "🔒"}</span>
              <span>{b.name}</span>
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
