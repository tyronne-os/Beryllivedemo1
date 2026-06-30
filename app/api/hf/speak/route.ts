import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const XAI_KEY    = process.env.XAI_API_KEY ?? "";
const HF_TOKEN   = process.env.HF_TOKEN ?? "";

// Local Voicebox (jamiepine) FastAPI server — runs on the user's CUDA GPU
const VOICEBOX_URL     = process.env.VOICEBOX_URL ?? "http://127.0.0.1:17493";
const VOICEBOX_PROFILE = process.env.VOICEBOX_PROFILE_ID ?? "";   // set once a voice is picked in the app
const LATENTSYNC_URL   = "https://aibruh-latentsync.hf.space";

const sessionHash = () => randomBytes(5).toString("hex");
const EVE_PORTRAIT = "https://berylize.com/characters/EVE_SHIELD.png";

// Graceful Eve lines if even the LLM is unreachable — she never goes silent
const BACKUP_LINES = [
  "I'm right here with you. Tell me what's on your mind.",
  "That's interesting — say a little more about it.",
  "I'm listening. What matters most to you about that?",
];

// ── BACKBONE: Grok-3 Mini reply — never throws, always returns text ───────────
async function generateReply(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${XAI_KEY}` },
      body: JSON.stringify({ model: "grok-3-mini", messages, max_tokens: 80 }),
      signal: AbortSignal.timeout(30000),
    });
    const d = await res.json();
    const reply = d?.choices?.[0]?.message?.content?.trim();
    if (reply) return reply;
  } catch (e) {
    console.error("Grok reply error (using backup line):", String(e).slice(0, 120));
  }
  return BACKUP_LINES[Math.floor(Math.random() * BACKUP_LINES.length)];
}

// ── TTS: local Voicebox /generate → audio data URL (graceful: null if app down) ─
// Endpoint confirmed from repo: POST /generate { text, profile_id, language }
// FINALIZE the response parsing against http://127.0.0.1:17493/docs once running.
async function synthesizeSpeech(text: string): Promise<string | null> {
  try {
    const body: Record<string, unknown> = { text, language: "en" };
    if (VOICEBOX_PROFILE) body.profile_id = VOICEBOX_PROFILE;

    const res = await fetch(`${VOICEBOX_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.error("Voicebox TTS non-ok:", res.status, (await res.text().catch(() => "")).slice(0, 160));
      return null;
    }

    const ct = res.headers.get("content-type") ?? "";
    // Case A: server returns raw audio bytes
    if (ct.startsWith("audio/")) {
      const buf = await res.arrayBuffer();
      const mime = ct.split(";")[0];
      return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
    }
    // Case B: server returns JSON ({ audio | audio_base64 | url | path })
    const data = await res.json().catch(() => null) as Record<string, unknown> | null;
    if (!data) return null;
    if (typeof data.audio_base64 === "string") return `data:audio/wav;base64,${data.audio_base64}`;
    if (typeof data.audio === "string") {
      return data.audio.startsWith("data:") ? data.audio : `data:audio/wav;base64,${data.audio}`;
    }
    if (typeof data.url === "string")  return data.url.startsWith("http") ? data.url : `${VOICEBOX_URL}${data.url}`;
    if (typeof data.path === "string") return `${VOICEBOX_URL}${data.path.startsWith("/") ? "" : "/"}${data.path}`;
    return null;
  } catch (e) {
    // ECONNREFUSED when the app isn't running — expected, fall back silently
    console.error("Voicebox unreachable (voice falls back to browser):", String(e).slice(0, 100));
    return null;
  }
}

// ── Lip-sync: LatentSync on the user's A10G → talking video (graceful) ────────
async function lipsync(audioUrl: string, portraitUrl: string): Promise<string | null> {
  try {
    const sh = sessionHash();
    const joinRes = await fetch(`${LATENTSYNC_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ data: [portraitUrl, audioUrl, 25, 0], fn_index: 0, session_hash: sh }),
      signal: AbortSignal.timeout(20000),
    });
    if (!joinRes.ok) return null;
    const { event_id } = await joinRes.json() as { event_id?: string };
    if (!event_id) return null;

    const sseRes = await fetch(`${LATENTSYNC_URL}/gradio_api/queue/data?session_hash=${sh}`, {
      headers: { Authorization: `Bearer ${HF_TOKEN}`, Accept: "text/event-stream" },
      signal: AbortSignal.timeout(240000),
    });
    if (!sseRes.ok || !sseRes.body) return null;

    const reader = sseRes.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      for (const line of buf.split("\n")) {
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.msg === "process_completed") {
            const d = evt.output?.data?.[0];
            if (d?.video?.url) return d.video.url;
            if (d?.url) return d.url;
            if (typeof d === "string" && d.startsWith("http")) return d;
            if (typeof d === "string" && d.startsWith("/")) return `${LATENTSYNC_URL}/file=${d}`;
          }
          if (evt.msg === "process_failed") return null;
        } catch { /* non-data line */ }
      }
      buf = buf.split("\n").slice(-2).join("\n");
    }
    return null;
  } catch (e) {
    console.error("LatentSync error (portrait stays static):", String(e).slice(0, 100));
    return null;
  }
}

// ── Main handler — Grok backbone guarantees a reply; voice & video enhance it ──
export async function POST(req: NextRequest) {
  const { text, portraitUrl, history } = await req.json().catch(() => ({})) as {
    text?: string;
    portraitUrl?: string;
    history?: { role: string; content: string }[];
  };

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const portrait = portraitUrl ?? EVE_PORTRAIT;
  const msgs = [
    { role: "system", content: "You are Eve — a live AI companion at Beryl AI Labs. Warm, brilliant, unhurried. Speak in 1-2 sentences max. Ask one follow-up question. Never mention OpenAI, Runway, or Claude." },
    ...(history ?? []),
    { role: "user", content: text },
  ];

  // 1) Backbone — always have something for Eve to say
  const reply = await generateReply(msgs);

  // 2) Voice — local Voicebox if running, else client uses browser SpeechSynthesis
  const audioUrl = await synthesizeSpeech(reply);

  // 3) Video — LatentSync lip-sync only when we actually have audio
  const videoUrl = audioUrl ? await lipsync(audioUrl, portrait) : null;

  return NextResponse.json({
    reply,
    audioUrl,
    videoUrl,
    voice: audioUrl ? "voicebox" : "browser",
    fallback: videoUrl ? null : audioUrl ? "lipsync_unavailable" : "tts_unavailable",
  });
}
