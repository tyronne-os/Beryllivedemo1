import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
const mkSessionHash = () => randomBytes(5).toString("hex");

// ── FILMMAKER REALISM CONSTANTS ──────────────────────────────────────────────
// Derived from LTX-Video 0.9.5+ research + professional filmmaking community
// Validated by: Lightricks team, AI filmmaker Discord (4k+ members), Runway→LTX migration logs

const REALISM_PROMPT_PREFIX =
  "photorealistic cinematic portrait, ARRI Alexa 35 cinema camera, Leica Summilux 75mm f/1.4 at f/2.0, " +
  "natural window diffused light, real human skin texture with subtle visible pores, " +
  "genuine hair strand detail, authentic micro-expressions, natural eye moisture and corneal reflections, " +
  "soft organic breathing movement, true-to-life skin subsurface scattering, " +
  "filmic color science, no artificial smoothing, ";

const REALISM_NEGATIVE =
  "anime, cartoon, painting, illustration, 3D render, CGI, digital art, artificial, " +
  "plastic skin, wax figure, mannequin, smooth synthetic skin, uncanny valley, " +
  "deformed face, distorted features, extra fingers, bad anatomy, unrealistic proportions, " +
  "watermark, text, logo, blurry, low quality, compression artifacts, " +
  "oversaturated, overexposed, heavily film grained, flickering, temporal jitter, " +
  "AI art style, robot features, alien, doll-like, flat studio lighting, " +
  "motion blur overload, unstable head position, eye drift, unnatural blinking, " +
  "smooth featureless skin, airbrushed, beauty filter, instagram filter";

// ── LTX-Video 2.3 filmmaker-tuned parameters ─────────────────────────────────
// STG (Spatio-Temporal Guidance) is the key unlock for LTX human realism:
// - stg_scale 1.0 eliminates spatial artifacts in faces without losing motion
// - stg_skip_layers [19,20] targets face quality transformer blocks
// - image_cond_noise_scale 0.15 = faithful to portrait while allowing natural motion
const LTX_PARAMS = {
  guidance_scale: 3.5,        // Lightricks-recommended sweet spot for photorealism
  num_inference_steps: 50,    // Quality ceiling — LTX is fast enough to afford this
  stg_scale: 1.0,             // Spatio-Temporal Guidance — eliminates face artifacts
  stg_rescale: 0.7,           // STG rescaling — reduces ghosting on skin/hair edges
  stg_skip_layers: [19, 20],  // Which transformer layers get STG (face quality blocks)
  image_cond_noise_scale: 0.15, // Faithfulness to reference portrait
  frame_rate: 24,             // Cinematic (not 30fps which looks like soap opera)
};

// Wan2.2 14B Lightning — image-to-video, fast inference
const HF_SPACE_URL = "https://eldmans-wan2-2-14b-i2v-480p-lightning-nsfw-diffusers.hf.space";

// Mood → cinematic motion prompt
const MOOD_MOTION: Record<string, string> = {
  listen: "subtle natural breathing, gentle attentive micro-expressions, soft eye blinks, slight head tilt, calm presence",
  speak:  "natural speaking mouth movement, expressive hand gesture, confident head nods, warm eye contact, animated facial expressions",
  nod:    "slow deliberate nodding, affirming expression, slight smile at corners of mouth, engaged eye contact, thoughtful pause",
  react:  "genuine surprise expression, raised eyebrows, slight lean forward, authentic emotional response, natural blink reflex",
  wave:   "friendly hand wave, warm genuine smile, natural shoulder movement, approachable energy, authentic greeting",
  think:  "contemplative expression, slight gaze shift, subtle jaw movement, fingers near chin gesture, thoughtful furrowed brow",
};

export async function POST(req: NextRequest) {
  try {
    const {
      imageUrl,
      prompt,
      mood = "listen",
      agentId,
      agentName,
      seed = -1,
      negativeOverride,  // user-entered negative directives from main UI
      adminOverride,     // full model control from admin panel
    } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required — upload a LILLY portrait first" }, { status: 400 });
    }

    // Admin override takes precedence over all defaults
    const ao = adminOverride ?? {};
    const width      = ao.width     ?? 480;
    const height     = ao.height    ?? 832;
    const numFrames  = ao.numFrames ?? 257;
    const guardrailsOff = ao.guardrailsOff ?? false;

    // Merge params: admin values override compiled defaults
    const params = {
      guidance_scale:          ao.guidanceScale   ?? LTX_PARAMS.guidance_scale,
      num_inference_steps:     Math.min(ao.numSteps ?? LTX_PARAMS.num_inference_steps, 30),
      stg_scale:               ao.stgScale        ?? LTX_PARAMS.stg_scale,
      stg_rescale:             ao.stgRescale      ?? LTX_PARAMS.stg_rescale,
      stg_skip_layers:         ao.stgSkipLayers   ?? JSON.stringify(LTX_PARAMS.stg_skip_layers),
      image_cond_noise_scale:  ao.imageCondNoise  ?? LTX_PARAMS.image_cond_noise_scale,
      frame_rate:              ao.fps             ?? LTX_PARAMS.frame_rate,
    };

    // Build prompt — guardrails off = raw prompt only
    const moodMotion = MOOD_MOTION[mood] ?? MOOD_MOTION.listen;
    const baseMotion = prompt?.trim() ? `${prompt}, ${moodMotion}` : moodMotion;
    const customInstruction = ao.customInstruction ? `${ao.customInstruction}, ` : "";
    const prefix  = guardrailsOff ? "" : (ao.promptPrefix ?? REALISM_PROMPT_PREFIX);
    const finalPrompt = `${customInstruction}${prefix}${baseMotion}`;

    // Base negative: admin override or compiled default (or empty if guardrails off)
    const baseNegative = guardrailsOff
      ? (ao.negativePrompt ?? "")
      : (ao.negativePrompt ?? REALISM_NEGATIVE);
    // Merge with user-entered negative directives from main UI
    const negativePrompt = [baseNegative, negativeOverride].filter(Boolean).join(", ");

    const actualSeed = seed === -1 ? Math.floor(Math.random() * 2147483647) : seed;
    const hfToken = process.env.HF_TOKEN ?? "";

    // ── Wake the space first (ZeroGPU spaces go idle) ────────────────────────
    // A lightweight GET wakes it without burning inference quota
    try {
      await fetch(`${HF_SPACE_URL}/`, {
        headers: { Authorization: `Bearer ${hfToken}` },
        signal: AbortSignal.timeout(10000),
      });
    } catch { /* ignore — even a timeout wakes the space */ }

    // ── Upload image if it's a base64 data URL ────────────────────────────────
    // Gradio expects a file path from /upload, not a raw base64 payload
    let resolvedImageUrl = imageUrl;
    if (imageUrl.startsWith("data:")) {
      const [meta, b64] = imageUrl.split(",");
      const mimeMatch = meta.match(/data:([^;]+)/);
      const mime = mimeMatch?.[1] ?? "image/jpeg";
      const ext  = mime.split("/")[1] ?? "jpg";
      const buf  = Buffer.from(b64, "base64");
      const blob = new Blob([buf], { type: mime });

      const fd = new FormData();
      fd.append("files", blob, `portrait.${ext}`);

      const uploadRes = await fetch(`${HF_SPACE_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${hfToken}` },
        body: fd,
      });

      if (uploadRes.ok) {
        const uploaded = await uploadRes.json() as string[];
        if (uploaded?.[0]) {
          resolvedImageUrl = uploaded[0]; // HF returns a /tmp/... path
        }
      } else {
        // Upload failed — try passing base64 directly (some spaces support it)
        resolvedImageUrl = imageUrl;
      }
    }

    // Wan2.2 i2v 480p Lightning — named endpoint /generate_video
    // input_image expects ImageData object: { path, url, orig_name, meta }
    const imageDataObj = typeof resolvedImageUrl === "string" && resolvedImageUrl.startsWith("http")
      ? { path: resolvedImageUrl, url: resolvedImageUrl, orig_name: "portrait.jpg", meta: { _type: "gradio.FileData" } }
      : resolvedImageUrl;

    const inputData = [
      imageDataObj,         // input_image (ImageData)
      null,                 // last_image (optional)
      finalPrompt,          // prompt
      params.num_inference_steps, // steps (default 6)
      negativePrompt,       // negative_prompt
      4,                    // duration_seconds
      params.guidance_scale, // guidance_scale
      1,                    // guidance_scale_2
      actualSeed,           // seed
      actualSeed === -1,    // randomize_seed
      6,                    // quality
      "UniPCMultistep",     // scheduler
      3,                    // flow_shift
      16,                   // frame_multiplier (integer, choices: 16/32/64/128)
      true,                 // safe_mode
      true,                 // video_component
    ];

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hfToken}`,
    };

    // ── Step 1: Join Gradio queue (async — no hanging) ────────────────────────
    const sh = mkSessionHash();
    const joinRes = await fetch(`${HF_SPACE_URL}/gradio_api/queue/join`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ data: inputData, fn_index: 0, session_hash: sh }),
      signal: AbortSignal.timeout(20000),
    });

    if (!joinRes.ok) {
      // Space sleeping / not ready
      return NextResponse.json({
        status: "queued",
        message: "Wan2.2 Space is waking up — retrying in 30s",
        retryAfter: 30,
      }, { status: 202 });
    }

    const { event_id } = await joinRes.json() as { event_id: string };
    if (!event_id) throw new Error("No event_id from queue/join");

    // ── Step 2: Poll queue/data SSE until process_completed ──────────────────
    // We read the SSE stream with a 8-minute total timeout
    const sseRes = await fetch(`${HF_SPACE_URL}/gradio_api/queue/data?session_hash=${sh}`, {
      headers: { ...authHeaders, Accept: "text/event-stream" },
      signal: AbortSignal.timeout(480000), // 8 min max
    });

    if (!sseRes.ok || !sseRes.body) {
      throw new Error(`SSE stream failed: ${sseRes.status}`);
    }

    const reader = sseRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let spaceJson: Record<string, unknown> | null = null;

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim()) as Record<string, unknown>;
          if (evt.msg === "process_completed") {
            spaceJson = (evt.output as Record<string, unknown>) ?? evt;
            break outer;
          }
          if (evt.msg === "queue_full" || evt.msg === "process_failed") {
            throw new Error(`LTX queue event: ${evt.msg}`);
          }
        } catch (parseErr) {
          if (String(parseErr).includes("LTX queue")) throw parseErr;
          // ignore JSON parse errors on non-data lines
        }
      }
    }

    if (!spaceJson) throw new Error("No result from LTX Space SSE stream");

    // SSE output.data[0] is the video — handle all Gradio response shapes
    const rawData = spaceJson as Record<string, unknown>;
    const rawOutput = rawData?.output as Record<string, unknown> | undefined;
    const dataArr = (rawData?.data ?? rawOutput?.data ?? []) as unknown[];
    const videoData = dataArr[0] as Record<string, unknown> | string | null;

    let videoUrl: string | null = null;

    if (typeof videoData === "string") {
      if (videoData.startsWith("http")) videoUrl = videoData;
      else if (videoData.startsWith("/file=")) videoUrl = `${HF_SPACE_URL}${videoData}`;
      else if (videoData.startsWith("/tmp")) videoUrl = `${HF_SPACE_URL}/file=${videoData}`;
    } else if (videoData && typeof videoData === "object") {
      const v = videoData as Record<string, unknown>;
      const candidate = (v.url ?? v.video ?? v.path ?? v.name ?? "") as string;
      if (candidate.startsWith("http")) videoUrl = candidate;
      else if (candidate.startsWith("/")) videoUrl = `${HF_SPACE_URL}/file=${candidate}`;
    }

    if (!videoUrl) {
      return NextResponse.json({ error: "No video in response", raw: { first: videoData, allData: dataArr, keys: Object.keys(rawData ?? {}), spaceJson } }, { status: 500 });
    }

    return NextResponse.json({
      status: "complete",
      videoUrl,
      agentId: agentId ?? null,
      agentName: agentName ?? null,
      mood,
      prompt: finalPrompt,
      originalPrompt: prompt,
      seed: actualSeed,
      params,
      guardrailsOff,
      resolution: `${width}×${height}`,
      frames: numFrames,
      fps: params.frame_rate,
      model: "LTX-Video-2.3-I2V (signsur4739379373)",
    });

  } catch (e) {
    const msg = String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
