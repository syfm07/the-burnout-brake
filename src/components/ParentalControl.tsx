import { useEffect, useState } from "react";
import { Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const EMAIL_KEY = "burnout-brake-parent-email";
const COMPLETIONS_KEY = "burnout-brake-completions";
const STREAK_KEY = "burnout-brake-streak";

function getStats() {
  const raw = typeof window !== "undefined" ? localStorage.getItem(COMPLETIONS_KEY) : null;
  let times: number[] = [];
  if (raw) try { times = JSON.parse(raw); } catch {}
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const today = times.filter((t) => now - t < day).length;
  const week = times.filter((t) => now - t < 7 * day).length;
  const total = times.length;
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;

  // Peak hour
  const buckets = new Array(24).fill(0);
  times.forEach((t) => buckets[new Date(t).getHours()]++);
  const max = Math.max(...buckets);
  const peakHour = max > 0 ? buckets.indexOf(max) : null;
  const fmtH = (h: number) => {
    const ap = h < 12 ? "AM" : "PM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}${ap}`;
  };

  return { today, week, total, streak, peak: peakHour !== null ? fmtH(peakHour) : "—" };
}

export function ParentalControl() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState(() => getStats());

  useEffect(() => {
    const stored = localStorage.getItem(EMAIL_KEY);
    if (stored) setEmail(stored);
  }, []);

  useEffect(() => {
    if (open) setStats(getStats());
  }, [open]);

  const save = () => {
    localStorage.setItem(EMAIL_KEY, email);
    toast.success("Parent email saved");
  };

  const [sending, setSending] = useState(false);

  const sendReport = async () => {
    if (!email) {
      toast.error("Enter a parent email first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-parent-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email, stats }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      toast.success("Report sent to parent ✉️");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send report");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 group flex items-center gap-2 h-12 pl-3 pr-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-pillow border border-primary/30 hover:scale-105 active:scale-95 transition-all animate-pulse-soft"
        title="Parental controls"
        aria-label="Parental controls"
      >
        <span className="relative grid place-items-center h-7 w-7 rounded-xl bg-primary-foreground/20">
          <Shield className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-primary" />
        </span>
        <span className="text-xs font-semibold tracking-wide">Parents</span>
      </button>
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
          50% { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .animate-pulse-soft { animation: pulse-soft 2.4s ease-out infinite; }
      `}</style>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div
            className="bg-card rounded-3xl p-6 shadow-pillow border border-border max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/15 grid place-items-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Parental controls</h3>
              <p className="text-xs text-muted-foreground">
                Share your study stats with a parent or guardian.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-email" className="text-xs">Parent email</Label>
              <Input
                id="parent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="rounded-2xl"
              />
              <Button size="sm" variant="ghost" className="w-full text-xs" onClick={save}>
                Save email
              </Button>
            </div>

            <div className="bg-secondary/40 rounded-2xl p-4 space-y-1.5 text-xs">
              <p className="font-semibold mb-1.5 text-sm">Progress summary</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Today</span><span className="font-medium tabular-nums">{stats.today} tasks</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">This week</span><span className="font-medium tabular-nums">{stats.week} tasks</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">All-time</span><span className="font-medium tabular-nums">{stats.total} tasks</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Streak</span><span className="font-medium tabular-nums">{stats.streak}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Peak hour</span><span className="font-medium">{stats.peak}</span></div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 rounded-2xl text-xs" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button className="flex-1 rounded-2xl text-xs" onClick={sendReport}>
                <Mail className="h-3 w-3 mr-1" /> Send report
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
