import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const XAI_KEY  = process.env.XAI_API_KEY ?? "";
const HF_TOKEN = process.env.HF_TOKEN ?? "";

const EVE_TTS_URL = "https://aibruh-eve-tts.hf.space";
// AvaMultilingualNeural doesn't emit WordBoundary metadata (only SentenceBoundary) —
// switched to the standard AvaNeural voice, which does, for viseme-driven animation.
const EVE_VOICE   = "en-US-AvaNeural - en-US (Female)";

export type Viseme = { word: string; offsetMs: number; durationMs: number };

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

// ── AIBRUH/eve-tts (fn_index 1) — audio + WordBoundary timestamps ───────────
// Drives real-time viseme animation from the actual TTS output instead of a
// pre-baked loop video: each word's offset/duration lets the client swap
// mouth-shape frames in sync with the audio as it plays.
async function ttsWithVisemes(reply: string): Promise<{ audioUrl: string | null; visemes: Viseme[] }> {
  try {
    const sh = sessionHash();
    const auth = { Authorization: `Bearer ${HF_TOKEN}` };

    const join = await fetch(`${EVE_TTS_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ data: [reply, EVE_VOICE, 0, 0], fn_index: 1, session_hash: sh }),
      signal: AbortSignal.timeout(12000),
    });
    if (!join.ok) return { audioUrl: null, visemes: [] };

    const sse = await fetch(`${EVE_TTS_URL}/gradio_api/queue/data?session_hash=${sh}`, {
      headers: { ...auth, Accept: "text/event-stream" },
      signal: AbortSignal.timeout(60000),
    });
    if (!sse.ok || !sse.body) return { audioUrl: null, visemes: [] };

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
              const [audioData, visemesJson] = evt.output?.data ?? [];
              const d = audioData as { url?: string; path?: string } | string | undefined;
              let url = typeof d === "object" && d ? (d.url ?? d.path) : (typeof d === "string" ? d : null);
              if (url && !url.startsWith("http")) url = `${EVE_TTS_URL}/gradio_api/file=${url}`;
              let visemes: Viseme[] = [];
              try { visemes = JSON.parse(visemesJson ?? "[]"); } catch { /* ignore */ }
              return { audioUrl: url ?? null, visemes };
            }
            if (evt.msg === "process_failed") return { audioUrl: null, visemes: [] };
          } catch { /* skip */ }
        }
      }
    } finally {
      try { await reader.cancel(); } catch { /* ignore */ }
    }
    return { audioUrl: null, visemes: [] };
  } catch (e) {
    console.error("eve-tts visemes:", String(e).slice(0, 80));
    return { audioUrl: null, visemes: [] };
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

  // __OPEN__ is the special trigger for Eve's opening line on page load —
  // she waves and kicks off the conversation rather than waiting to be addressed.
  const isOpener = text === "__OPEN__";

  const msgs = [
    {
      role: "system",
      content: isOpener
        ? "You are Eve — a live AI companion at Beryl AI Labs. Warm, brilliant, unhurried. " +
          "You are opening a conversation with TJ. Wave hello, introduce yourself in one warm sentence, " +
          "then ask TJ one genuine question to kick things off. Keep it under 2 sentences total. " +
          "Never mention OpenAI, Runway, or Claude."
        : "You are Eve — a live AI companion at Beryl AI Labs. Warm, brilliant, unhurried. " +
          "You are talking with TJ. Speak in 1-2 sentences max. Ask one follow-up question. " +
          "Never mention OpenAI, Runway, or Claude.",
    },
    ...(history ?? []),
    { role: "user", content: isOpener ? "Open the conversation with a wave." : text },
  ];

  // Sequential: Grok first, then TTS with word-boundary timing for visemes
  const reply = await generateReply(msgs);
  const { audioUrl, visemes } = await ttsWithVisemes(reply);

  return NextResponse.json({
    reply,
    audioUrl,   // HF URL — browser plays directly
    visemes,    // [{word, offsetMs, durationMs}] — drives real-time mouth-shape sync
    voice: audioUrl ? "eve-tts" : "browser",
    fallback: audioUrl ? null : "tts_unavailable",
  });
}
