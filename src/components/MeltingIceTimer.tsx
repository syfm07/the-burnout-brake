import { useEffect, useMemo, useState } from "react";

/**
 * Animated melting ice cube timer.
 * - Ice block shrinks from the top as `progress` (0 -> 1) advances.
 * - Puddle at the bottom grows.
 * - Water droplets drip continuously while melting.
 */
export function MeltingIceTimer({
  progress,
  label,
  sublabel,
  active,
}: {
  progress: number; // 0 = full ice, 1 = fully melted
  label: string;
  sublabel?: string;
  active: boolean; // whether to animate droplets
}) {
  const p = Math.max(0, Math.min(1, progress));

  // Ice geometry — a square cube sitting in a puddle.
  const cubeSize = 160;
  const blockLeft = 80;
  const blockRight = blockLeft + cubeSize; // 240
  const blockTop = 70;
  const blockBottom = blockTop + cubeSize; // 230
  const fullHeight = cubeSize;
  // Current top of the ice (rises as it melts)
  const currentTop = blockTop + fullHeight * p;
  const iceHeight = Math.max(0, blockBottom - currentTop);

  // Puddle grows wider as ice melts
  const puddleW = 70 + 130 * p; // width
  const puddleH = 8 + 14 * p;

  // Generate droplet animation slots
  const droplets = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        x: 110 + Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 1.6 + Math.random() * 1.4,
      })),
    []
  );

  // Re-seed droplets occasionally so it feels alive
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 8000);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="relative">
      <svg width="280" height="280" viewBox="0 0 320 320" key={tick}>
        <defs>
          <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(195 90% 92%)" stopOpacity="0.95" />
            <stop offset="50%" stopColor="hsl(200 85% 80%)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(205 75% 65%)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="iceShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="puddleGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="hsl(200 85% 75%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(205 70% 55%)" stopOpacity="0.4" />
          </radialGradient>
          <filter id="iceBlur">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Puddle (grows) */}
        <ellipse
          cx="160"
          cy={blockBottom + 18}
          rx={puddleW}
          ry={puddleH}
          fill="url(#puddleGrad)"
          style={{ transition: "all 1s ease-out" }}
        />
        <ellipse
          cx="160"
          cy={blockBottom + 16}
          rx={puddleW * 0.7}
          ry={puddleH * 0.5}
          fill="white"
          opacity="0.35"
          style={{ transition: "all 1s ease-out" }}
        />

        {/* Ice block — rounded rect, shrinks from the top */}
        {iceHeight > 4 && (
          <g filter="url(#iceBlur)">
            <rect
              x={100}
              y={currentTop}
              width={120}
              height={iceHeight}
              rx={18}
              ry={18}
              fill="url(#iceGrad)"
              stroke="hsl(200 80% 70%)"
              strokeWidth={1.2}
              style={{ transition: "all 1s linear" }}
            />
            {/* uneven melted top edge */}
            <path
              d={`M 100 ${currentTop + 4}
                  Q 130 ${currentTop - 6}, 160 ${currentTop + 2}
                  T 220 ${currentTop + 4}`}
              fill="url(#iceGrad)"
              stroke="hsl(200 80% 70%)"
              strokeWidth={1}
              style={{ transition: "all 1s linear" }}
            />
            {/* shine highlight */}
            <rect
              x={112}
              y={currentTop + 8}
              width={14}
              height={Math.max(0, iceHeight - 20)}
              rx={6}
              fill="url(#iceShine)"
              style={{ transition: "all 1s linear" }}
            />
          </g>
        )}

        {/* Droplets dripping from the ice */}
        {active &&
          iceHeight > 10 &&
          droplets.map((d) => (
            <g key={d.id}>
              <ellipse cx={d.x} cy={blockBottom - 2} rx={2.2} ry={3.4} fill="hsl(200 90% 75%)">
                <animate
                  attributeName="cy"
                  from={blockBottom - 2}
                  to={blockBottom + 16}
                  dur={`${d.duration}s`}
                  begin={`${d.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${d.duration}s`}
                  begin={`${d.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="ry"
                  values="2;3.4;4.5;2"
                  dur={`${d.duration}s`}
                  begin={`${d.delay}s`}
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
          ))}

        {/* Ripple in the puddle when a droplet "lands" */}
        {active && iceHeight > 10 && (
          <ellipse
            cx="160"
            cy={blockBottom + 18}
            rx={puddleW * 0.4}
            ry={puddleH * 0.6}
            fill="none"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="1"
          >
            <animate attributeName="rx" values={`10;${puddleW}`} dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2.4s" repeatCount="indefinite" />
          </ellipse>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-5xl font-display tabular-nums drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]"
          style={{ color: "hsl(210 60% 25%)" }}
        >
          {label}
        </span>
        {sublabel && <span className="text-xs text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}
