import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const XAI_KEY  = process.env.XAI_API_KEY ?? "";
const HF_TOKEN = process.env.HF_TOKEN ?? "";

const EVE_TTS_URL    = "https://aibruh-eve-tts.hf.space";
const LATENTSYNC_URL = "https://aibruh-latentsync.hf.space";
const EVE_PORTRAIT   = "https://berylize.com/characters/EVE_SHIELD.png";
const EVE_WAVE_VIDEO = "/eve_wave.mp4"; // public static — base video for LatentSync

// Edge-TTS voice — Ava Multilingual (female, en-US)
const EVE_VOICE = "en-US-AvaMultilingualNeural - en-US (Female)";

const sessionHash = () => randomBytes(5).toString("hex");

const BACKUP_LINES = [
  "I'm right here with you. Tell me what's on your mind.",
  "That's interesting — say a little more about it.",
  "I'm listening. What matters most to you about that?",
];

// ── Grok-3 Mini reply — never throws ─────────────────────────────────────────
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
    console.error("Grok error:", String(e).slice(0, 100));
  }
  return BACKUP_LINES[Math.floor(Math.random() * BACKUP_LINES.length)];
}

// ── SSE queue reader helper ───────────────────────────────────────────────────
async function sseResult(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${HF_TOKEN}`, Accept: "text/event-stream" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
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
          if (evt.msg === "process_completed") return evt.output;
          if (evt.msg === "process_failed") return null;
        } catch { /* skip */ }
      }
    }
  } finally {
    try { await reader.cancel(); } catch { /* ignore */ }
  }
  return null;
}

// ── AIBRUH/eve-tts: Edge-TTS dedicated space (cpu-upgrade, no shared queue) ──
async function synthesizeSpeech(text: string): Promise<{ url: string; bytes: Buffer } | null> {
  try {
    const sh = sessionHash();
    const auth = { Authorization: `Bearer ${HF_TOKEN}` };

    const join = await fetch(`${EVE_TTS_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ data: [text, EVE_VOICE, 0, 0], fn_index: 0, session_hash: sh }),
      signal: AbortSignal.timeout(20000),
    });
    if (!join.ok) return null;

    const output = await sseResult(
      `${EVE_TTS_URL}/gradio_api/queue/data?session_hash=${sh}`,
      90000
    ) as { data?: unknown[] } | null;

    const d = (output as { data?: unknown[] })?.data?.[0] as { url?: string; path?: string } | string | null;
    let audioUrl = (typeof d === "object" && d) ? (d.url ?? d.path ?? null) : (typeof d === "string" ? d : null);
    if (!audioUrl) return null;
    if (!audioUrl.startsWith("http")) audioUrl = `${EVE_TTS_URL}/gradio_api/file=${audioUrl}`;

    const audioRes = await fetch(audioUrl, { headers: auth, signal: AbortSignal.timeout(30000) });
    if (!audioRes.ok) return null;
    const bytes = Buffer.from(await audioRes.arrayBuffer());
    return { url: audioUrl, bytes };
  } catch (e) {
    console.error("eve-tts error:", String(e).slice(0, 100));
    return null;
  }
}

// ── AIBRUH/latentsync: video(eve_wave) + audio → lip-synced video (A10G) ─────
async function lipsync(audioBytes: Buffer): Promise<string | null> {
  try {
    const auth = { Authorization: `Bearer ${HF_TOKEN}` };

    // Upload base video (eve_wave.mp4 is a public static file served by Next.js)
    // We fetch it from our own origin so it's always fresh
    const baseVideoUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aibruh-ycberyldemo.hf.space"}/eve_wave.mp4`;
    const videoBytes = await fetch(baseVideoUrl, { signal: AbortSignal.timeout(30000) })
      .then(r => r.ok ? r.arrayBuffer() : Promise.reject("video fetch failed"))
      .then(b => Buffer.from(b));

    // Upload video to LatentSync
    const vForm = new FormData();
    vForm.append("files", new Blob([videoBytes], { type: "video/mp4" }), `base_${Date.now()}.mp4`);
    const vUp = await fetch(`${LATENTSYNC_URL}/gradio_api/upload`, {
      method: "POST", headers: auth, body: vForm, signal: AbortSignal.timeout(60000)
    }).then(r => r.json()) as Array<{ path?: string } | string>;
    const vidPath = (typeof vUp[0] === "object" ? vUp[0]?.path : vUp[0]) as string;
    if (!vidPath) return null;

    // Upload audio to LatentSync
    const aForm = new FormData();
    aForm.append("files", new Blob([audioBytes], { type: "audio/mpeg" }), `audio_${Date.now()}.mp3`);
    const aUp = await fetch(`${LATENTSYNC_URL}/gradio_api/upload`, {
      method: "POST", headers: auth, body: aForm, signal: AbortSignal.timeout(30000)
    }).then(r => r.json()) as Array<{ path?: string } | string>;
    const audPath = (typeof aUp[0] === "object" ? aUp[0]?.path : aUp[0]) as string;
    if (!audPath) return null;

    const vidData = { path: vidPath, url: `${LATENTSYNC_URL}/gradio_api/file=${vidPath}`, orig_name: "base.mp4", size: null, mime_type: "video/mp4", is_stream: false, meta: { _type: "gradio.FileData" } };
    const audData = { path: audPath, url: `${LATENTSYNC_URL}/gradio_api/file=${audPath}`, orig_name: "audio.mp3", size: null, mime_type: "audio/mpeg", is_stream: false, meta: { _type: "gradio.FileData" } };

    const sh = sessionHash();
    const join = await fetch(`${LATENTSYNC_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ fn_index: 1, session_hash: sh, data: [vidData, audData] }),
      signal: AbortSignal.timeout(20000),
    });
    if (!join.ok) return null;

    const output = await sseResult(
      `${LATENTSYNC_URL}/gradio_api/queue/data?session_hash=${sh}`,
      240000
    ) as { data?: unknown[] } | null;

    const vd = (output as { data?: unknown[] })?.data?.[0] as { url?: string; path?: string } | string | null;
    let videoUrl = (typeof vd === "object" && vd) ? (vd.url ?? vd.path ?? null) : (typeof vd === "string" ? vd : null);
    if (!videoUrl) return null;
    if (!videoUrl.startsWith("http")) videoUrl = `${LATENTSYNC_URL}/gradio_api/file=${videoUrl}`;
    return videoUrl;
  } catch (e) {
    console.error("LatentSync error:", String(e).slice(0, 100));
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { text, history } = await req.json().catch(() => ({})) as {
    text?: string;
    history?: { role: string; content: string }[];
  };

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const msgs = [
    { role: "system", content: "You are Eve — a live AI companion at Beryl AI Labs. Warm, brilliant, unhurried. Speak in 1-2 sentences max. Ask one follow-up question. Never mention OpenAI, Runway, or Claude." },
    ...(history ?? []),
    { role: "user", content: text },
  ];

  // 1) Grok — always returns something
  const reply = await generateReply(msgs);

  // 2) TTS on dedicated AIBRUH/eve-tts space
  const ttsResult = await synthesizeSpeech(reply);

  // 3) LatentSync lip-sync — only when TTS produced audio bytes
  const videoUrl = ttsResult ? await lipsync(ttsResult.bytes) : null;

  return NextResponse.json({
    reply,
    audioUrl: ttsResult?.url ?? null,
    videoUrl,
    voice: ttsResult ? "eve-tts" : "browser",
    fallback: videoUrl ? null : ttsResult ? "lipsync_unavailable" : "tts_unavailable",
    portrait: EVE_PORTRAIT,
  });
}
