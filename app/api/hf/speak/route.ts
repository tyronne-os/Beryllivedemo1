import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const XAI_KEY  = process.env.XAI_API_KEY ?? "";
const HF_TOKEN = process.env.HF_TOKEN ?? "";

const EVE_TTS_URL = "https://aibruh-eve-tts.hf.space";
const EVE_VOICE   = "en-US-AvaMultilingualNeural - en-US (Female)";

const sessionHash = () => randomBytes(5).toString("hex");

const BACKUP_LINES = [
  "I'm right here with you. Tell me what's on your mind.",
  "That's interesting — say a little more about it.",
  "I'm listening. What matters most to you about that?",
];

// ── Grok-3 Mini — never throws, ~3-5s ────────────────────────────────────────
async function generateReply(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${XAI_KEY}` },
      body: JSON.stringify({ model: "grok-3-mini", messages, max_tokens: 80 }),
      signal: AbortSignal.timeout(12000),
    });
    const d = await res.json();
    return d?.choices?.[0]?.message?.content?.trim() || BACKUP_LINES[0];
  } catch {
    return BACKUP_LINES[Math.floor(Math.random() * BACKUP_LINES.length)];
  }
}

// ── AIBRUH/eve-tts — dedicated cpu-upgrade, ~2-4s ────────────────────────────
async function tts(reply: string): Promise<string | null> {
  try {
    const sh = sessionHash();
    const auth = { Authorization: `Bearer ${HF_TOKEN}` };

    const join = await fetch(`${EVE_TTS_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ data: [reply, EVE_VOICE, 0, 0], fn_index: 0, session_hash: sh }),
      signal: AbortSignal.timeout(12000),
    });
    if (!join.ok) return null;

    // Stream SSE until process_completed
    const sse = await fetch(`${EVE_TTS_URL}/gradio_api/queue/data?session_hash=${sh}`, {
      headers: { ...auth, Accept: "text/event-stream" },
      signal: AbortSignal.timeout(60000),
    });
    if (!sse.ok || !sse.body) return null;

    const reader = sse.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          try {
            const evt = JSON.parse(line.slice(5).trim());
            if (evt.msg === "process_completed") {
              const d = evt.output?.data?.[0] as { url?: string; path?: string } | string | undefined;
              let url = typeof d === "object" && d ? (d.url ?? d.path) : (typeof d === "string" ? d : null);
              if (!url) return null;
              if (!url.startsWith("http")) url = `${EVE_TTS_URL}/gradio_api/file=${url}`;
              return url;
            }
            if (evt.msg === "process_failed") return null;
          } catch { /* skip */ }
        }
      }
    } finally {
      try { await reader.cancel(); } catch { /* ignore */ }
    }
    return null;
  } catch (e) {
    console.error("eve-tts:", String(e).slice(0, 80));
    return null;
  }
}

// ── POST /api/hf/speak ────────────────────────────────────────────────────────
// Fast path: Grok (~4s) → TTS (~4s) = ~8s total
// Client immediately plays audioUrl + loops /eve_talking_loop.mp4
// No LatentSync in the hot path — pre-baked loop handles the visual
export async function POST(req: NextRequest) {
  const { text, history } = await req.json().catch(() => ({})) as {
    text?: string;
    history?: { role: string; content: string }[];
  };

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const msgs = [
    {
      role: "system",
      content:
        "You are Eve — a live AI companion at Beryl AI Labs. Warm, brilliant, unhurried. " +
        "Speak in 1-2 sentences max. Ask one follow-up question. " +
        "Never mention OpenAI, Runway, or Claude.",
    },
    ...(history ?? []),
    { role: "user", content: text },
  ];

  // Sequential: Grok first, then TTS with the actual reply
  const reply   = await generateReply(msgs);
  const audioUrl = await tts(reply);

  return NextResponse.json({
    reply,
    audioUrl,                            // HF URL — browser plays directly
    speakingLoop: "/eve_talking_loop.mp4", // pre-baked Wan2.2 loop, plays while audio runs
    voice: audioUrl ? "eve-tts" : "browser",
    fallback: audioUrl ? null : "tts_unavailable",
  });
}
