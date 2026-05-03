// Generates a personalized 5-minute reset activity based on mood.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mood, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are a warm wellness coach for high-school students fighting burnout.
Suggest ONE specific 5-minute reset activity matched to the mood.
KEEP IT SHORT AND SCANNABLE — students will skim, not read.
- stressed -> a named breathing exercise (4-7-8, box breathing, physiological sigh)
- tired -> a quick stretch or energizing micro-movement
- bored -> a 60s dopamine reset (specific hype song + reason, or movement burst)
- focused -> a tiny celebration + eye/posture reset
Tone: kind, direct ("you"), zero preaching. Be brief.`;

    const tools = [{
      type: "function",
      function: {
        name: "suggest_reset",
        description: "Return a personalized 5-minute reset activity.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short, friendly name of the activity (max 6 words)." },
            duration_minutes: { type: "number" },
            why_it_helps: { type: "string", description: "1-2 sentences explaining the nervous-system benefit." },
            steps: { type: "array", items: { type: "string" }, description: "3-6 concrete steps." },
            closing_note: { type: "string", description: "One warm sentence to send the student back to studying." },
          },
          required: ["title", "duration_minutes", "why_it_helps", "steps", "closing_note"],
          additionalProperties: false,
        },
      },
    }];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Mood: ${mood}\n${context ? `Context: ${context}` : ""}` },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "suggest_reset" } },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Take a breath and try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("AI gateway error");
    }

    const data = await res.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("No suggestion returned");

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mood-action error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
