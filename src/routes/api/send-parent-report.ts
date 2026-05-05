import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const Schema = z.object({
  parentEmail: z.string().email().max(254),
  studentName: z.string().min(1).max(100).optional(),
  stats: z.object({
    today: z.number().int().min(0).max(10000),
    week: z.number().int().min(0).max(10000),
    total: z.number().int().min(0).max(100000),
    streak: z.number().int().min(0).max(10000),
    peak: z.string().max(10),
  }),
});

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildEmail(to: string, studentName: string | undefined, stats: z.infer<typeof Schema>["stats"]) {
  const who = studentName ? ` from ${studentName}` : "";
  const subject = `Study progress report${who} — The Burnout Brake`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fafaf7;border-radius:16px;color:#1f2937">
      <h2 style="margin:0 0 4px">Study progress report</h2>
      <p style="color:#6b7280;margin:0 0 20px">Sent automatically by The Burnout Brake 🌿</p>
      ${studentName ? `<p>Hi! Here's a snapshot of <b>${studentName}</b>'s recent study progress.</p>` : `<p>Hi! Here's a snapshot of recent study progress.</p>`}
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Tasks today</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${stats.today}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Tasks this week</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${stats.week}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">All-time tasks</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${stats.total}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Current streak</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${stats.streak}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Peak study hour</td><td style="padding:8px;text-align:right;font-weight:600">${stats.peak}</td></tr>
      </table>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">This report was generated and sent by the app — the student cannot edit its contents.</p>
    </div>
  `;
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");
  return b64url(raw);
}

export const Route = createFileRoute("/api/send-parent-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const GOOGLE_MAIL_API_KEY = process.env.GOOGLE_MAIL_API_KEY;
        if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
          return Response.json({ error: "Email service not configured" }, { status: 500 });
        }

        let body: unknown;
        try { body = await request.json(); } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }
        const { parentEmail, studentName, stats } = parsed.data;

        const raw = buildEmail(parentEmail, studentName, stats);

        const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Gmail send failed", res.status, text);
          return Response.json({ error: `Send failed (${res.status})` }, { status: 502 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
