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
  const [stats, setStats] = useState(() => ({ today: 0, week: 0, total: 0, streak: 0, peak: "—" }));

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

  const sendReport = () => {
    if (!email) {
      toast.error("Enter a parent email first");
      return;
    }
    const subject = encodeURIComponent("My study progress — The Burnout Brake");
    const body = encodeURIComponent(
      `Hi! Here's my recent study progress:\n\n` +
      `• Tasks completed today: ${stats.today}\n` +
      `• Tasks completed this week: ${stats.week}\n` +
      `• All-time tasks completed: ${stats.total}\n` +
      `• Current streak: ${stats.streak}\n` +
      `• Peak study hour: ${stats.peak}\n\n` +
      `Sent from The Burnout Brake 🌿`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toast("Opening your email app…");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 h-10 w-10 rounded-2xl bg-card/80 backdrop-blur border border-border shadow-soft grid place-items-center hover:scale-105 transition-transform"
        title="Parental controls"
        aria-label="Parental controls"
      >
        <Shield className="h-4 w-4 text-primary" />
      </button>

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
