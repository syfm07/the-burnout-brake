import { useMemo } from "react";
import type { ThemeId } from "./ThemePicker";

export function ThemeScene({ theme }: { theme: ThemeId }) {
  // Stable random positions per theme
  const items = useMemo(() => {
    const rand = (n: number) => Array.from({ length: n }, (_, i) => i);
    return {
      stars: rand(40).map((i) => ({
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        size: 2 + Math.random() * 3,
        key: i,
      })),
      bubbles: rand(18).map((i) => {
        const duration = 10 + Math.random() * 14;
        return {
          left: `${Math.random() * 100}%`,
          size: 14 + Math.random() * 36,
          duration: `${duration}s`,
          delay: `-${Math.random() * duration}s`,
          key: i,
        };
      }),
      leaves: rand(14).map((i) => {
        const duration = 10 + Math.random() * 10;
        return {
          left: `${Math.random() * 100}%`,
          duration: `${duration}s`,
          delay: `-${Math.random() * duration}s`,
          key: i,
        };
      }),
      petals: rand(20).map((i) => {
        const duration = 9 + Math.random() * 9;
        return {
          left: `${Math.random() * 100}%`,
          duration: `${duration}s`,
          delay: `-${Math.random() * duration}s`,
          key: i,
        };
      }),
      dots: rand(5).map((i) => ({
        top: `${10 + Math.random() * 70}%`,
        left: `${Math.random() * 90}%`,
        delay: `-${Math.random() * 10}s`,
        key: i,
      })),
    };
  }, [theme]);

  if (theme === "midnight") {
    return (
      <div className="theme-scene" aria-hidden>
        <div className="scene-moon" />
        {items.stars.map((s) => (
          <span
            key={s.key}
            className="scene-star"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>
    );
  }

  if (theme === "ocean") {
    const fish = [
      { emoji: "🐠", top: "22%", dir: "right", duration: "22s", delay: "-4s" },
      { emoji: "🐟", top: "38%", dir: "left", duration: "28s", delay: "-12s" },
      { emoji: "🐡", top: "55%", dir: "right", duration: "34s", delay: "-20s" },
      { emoji: "🦈", top: "68%", dir: "left", duration: "40s", delay: "-8s" },
    ];
    return (
      <div className="theme-scene" aria-hidden>
        {items.bubbles.map((b) => (
          <span
            key={b.key}
            className="scene-bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: b.duration,
              animationDelay: b.delay,
            }}
          />
        ))}
        {fish.map((f, i) => (
          <span
            key={`fish-${i}`}
            className={`scene-fish ${f.dir === "left" ? "left" : ""}`}
            style={{ top: f.top, animationDuration: f.duration, animationDelay: f.delay }}
          >
            {f.emoji}
          </span>
        ))}
        <div className="scene-seabed">
          <span className="scene-seabed-item sway">🌿</span>
          <span className="scene-seabed-item">🪸</span>
          <span className="scene-seabed-item pulse-soft">⭐</span>
          <span className="scene-seabed-item sway" style={{ animationDelay: "-2s" }}>🌱</span>
          <span className="scene-seabed-item">🐚</span>
          <span className="scene-seabed-item sway" style={{ animationDelay: "-1s" }}>🌿</span>
          <span className="scene-seabed-item pulse-soft" style={{ animationDelay: "-1.5s" }}>🪸</span>
        </div>
      </div>
    );
  }

  if (theme === "forest") {
    return (
      <div className="theme-scene" aria-hidden>
        {items.leaves.map((l) => (
          <span
            key={l.key}
            className="scene-leaf"
            style={{ left: l.left, animationDuration: l.duration, animationDelay: l.delay }}
          />
        ))}
      </div>
    );
  }

  if (theme === "sunset") {
    return (
      <div className="theme-scene" aria-hidden>
        <div className="scene-sun" />
        <div className="scene-cloud" style={{ top: "20%", left: "10%", width: 180, height: 40 }} />
        <div className="scene-cloud" style={{ top: "32%", right: "8%", width: 140, height: 32 }} />
        <div className="scene-cloud" style={{ top: "48%", left: "30%", width: 220, height: 36 }} />
      </div>
    );
  }

  if (theme === "sakura") {
    return (
      <div className="theme-scene" aria-hidden>
        {items.petals.map((p) => (
          <span
            key={p.key}
            className="scene-petal"
            style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }}
          />
        ))}
      </div>
    );
  }

  // default
  return (
    <div className="theme-scene" aria-hidden>
      {items.dots.map((d) => (
        <span key={d.key} className="scene-dot" style={{ top: d.top, left: d.left, animationDelay: d.delay }} />
      ))}
    </div>
  );
}

export const THEME_TAGLINES: Record<ThemeId, { tag: string; emoji: string }> = {
  default: { tag: "Study softer. Last longer.", emoji: "🌸" },
  midnight: { tag: "Quiet hours. Deep focus.", emoji: "🌙" },
  ocean: { tag: "Ride the wave. Stay afloat.", emoji: "🌊" },
  forest: { tag: "Grow at your own pace.", emoji: "🌿" },
  sunset: { tag: "Warm minds, soft endings.", emoji: "🌅" },
  sakura: { tag: "Bloom one task at a time.", emoji: "🌸" },
};
