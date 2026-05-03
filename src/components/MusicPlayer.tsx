import { useEffect, useState } from "react";
import { Music, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Source = { kind: "youtube" | "spotify"; id: string; label: string };

const PRESETS: Source[] = [
  { kind: "youtube", id: "jfKfPfyJRdk", label: "YouTube · Lofi Girl — beats to relax/study" },
  { kind: "youtube", id: "4xDzrJKXOOY", label: "YouTube · Synthwave radio — chill" },
  { kind: "youtube", id: "5qap5aO4i9A", label: "YouTube · Chillhop Essentials" },
  { kind: "spotify", id: "playlist/37i9dQZF1DWWQRwui0ExPn", label: "Spotify · Lofi Beats (default)" },
  { kind: "spotify", id: "playlist/37i9dQZF1DX8Uebhn9wzrS", label: "Spotify · Chill Lofi Study Beats" },
  { kind: "spotify", id: "playlist/37i9dQZF1DX3Ogo9pFvBkY", label: "Spotify · Ambient Relaxation" },
  { kind: "spotify", id: "playlist/37i9dQZF1DWZeKCadgRdKQ", label: "Spotify · Deep Focus" },
];

const STORAGE = "burnout-brake-music";

function parseUrl(raw: string): Source | null {
  const url = raw.trim();
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", id: yt[1], label: "Custom YouTube" };
  // Spotify
  const sp = url.match(/spotify\.com\/(playlist|track|album|episode)\/([A-Za-z0-9]+)/);
  if (sp) return { kind: "spotify", id: `${sp[1]}/${sp[2]}`, label: "Custom Spotify" };
  return null;
}

export function MusicPlayer() {
  const [source, setSource] = useState<Source>(PRESETS[0]);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE);
    if (saved) try { setSource(JSON.parse(saved)); } catch {}
  }, []);

  const choose = (s: Source) => {
    setSource(s);
    localStorage.setItem(STORAGE, JSON.stringify(s));
    setPlaying(true);
  };

  const tryCustom = () => {
    const parsed = parseUrl(custom);
    if (!parsed) { setError("Paste a YouTube or Spotify link"); return; }
    setError(null);
    setCustom("");
    choose(parsed);
  };

  const embedSrc =
    source.kind === "youtube"
      ? `https://www.youtube.com/embed/${source.id}?autoplay=1&loop=1&playlist=${source.id}`
      : `https://open.spotify.com/embed/${source.id}?utm_source=generator&autoplay=1`;

  return (
    <div className="bg-card/60 backdrop-blur rounded-3xl p-4 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Focus music</p>
          <p className="text-xs text-muted-foreground truncate">{source.label}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setPlaying((p) => !p)} className="rounded-xl">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)} className="rounded-xl text-xs">
          {open ? "Close" : "Pick"}
        </Button>
      </div>

      {playing && (
        <div className={source.kind === "youtube" ? "rounded-xl overflow-hidden aspect-video bg-black/20" : "rounded-xl overflow-hidden bg-black/10"}>
          <iframe
            key={`${source.kind}-${source.id}`}
            src={embedSrc}
            title="Focus music"
            allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
            allowFullScreen
            className="w-full"
            style={{ height: source.kind === "spotify" ? 152 : "100%", minHeight: source.kind === "youtube" ? 180 : undefined, border: 0 }}
          />
        </div>
      )}

      {open && (
        <div className="space-y-3">
          {(["youtube", "spotify"] as const).map((kind) => (
            <div key={kind} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                {kind === "youtube" ? "▶️ YouTube" : "🎧 Spotify"}
              </p>
              {PRESETS.filter((p) => p.kind === kind).map((p) => (
                <button
                  key={p.kind + p.id}
                  onClick={() => choose(p)}
                  className={`w-full text-left text-xs p-2 rounded-xl border transition-colors ${
                    source.kind === p.kind && source.id === p.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-secondary/40 border-transparent hover:bg-secondary/60"
                  }`}
                >
                  {p.label.replace(/^(YouTube|Spotify) · /, "")}
                </button>
              ))}
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube or Spotify link…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="flex-1 bg-background/70 rounded-xl border-0 text-xs"
            />
            <Button size="sm" onClick={tryCustom} className="rounded-xl">Load</Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-[10px] text-muted-foreground">
            Tip: Spotify needs you to be logged in to this browser to play full tracks.
          </p>
        </div>
      )}
    </div>
  );
}
