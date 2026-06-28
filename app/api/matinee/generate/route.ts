import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

// ── Model Registry ──────────────────────────────────────────────────────────
//
//  FREE TIER  — HuggingFace (existing hf_ key, no cost)
//    preview    → Wan2.2-S2V-14B  · audio-driven · matches audio length · up to 10 min
//    production → Wan2.2-S2V-14B  · same model, higher res output
//    (both require: reference image + audio clip → animated synced video)
//
//  PAID TIER  — fal.ai (requires FAL_API_KEY)
//    premium    → Seedance 2.0 T2V  · pure text-to-video · up to 15 sec · native audio
//    ultra      → Seedance 2.5 T2V  · pure text-to-video · up to 30 sec · native audio
//
const MODELS = {
  preview:    { provider:"hf",  id:"Wan-AI/Wan2.2-S2V-14B", maxSec: 600, w:832,  h:480,  note:"Audio-driven · up to 10 min · FREE" },
  production: { provider:"hf",  id:"Wan-AI/Wan2.2-S2V-14B", maxSec: 600, w:1280, h:720,  note:"Audio-driven · up to 10 min · FREE" },
  premium:    { provider:"fal", id:"bytedance/seedance-2.0/text-to-video", maxSec: 15, w:1280, h:720,  note:"Native audio+video · 15 sec" },
  ultra:      { provider:"fal", id:"bytedance/seedance-2.5/text-to-video", maxSec: 30, w:1920, h:1080, note:"Native audio+video · 30 sec" },
  "premium-i2v":{ provider:"fal", id:"bytedance/seedance-2.0/image-to-video", maxSec:15, w:1280,h:720, note:"I2V · 15 sec" },
  "ultra-i2v":  { provider:"fal", id:"bytedance/seedance-2.5/image-to-video", maxSec:30, w:1920,h:1080,note:"I2V · 30 sec" },
} as const;

const STYLE_PREFIX: Record<string, string> = {
  photorealistic: "cinematic photorealistic, 8K, anamorphic lens, film grain —",
  pixar:          "Pixar 3D animation, vibrant, subsurface scattering —",
  anime:          "Studio Ghibli cinematic anime, fluid motion, painterly —",
  noir:           "film noir, high contrast, dramatic shadows, 1940s cinema —",
  scifi:          "sci-fi cinematic, neon-lit, futuristic city, cyberpunk —",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      tier = "preview",
      style = "photorealistic",
      referenceImageUrl,  // REQUIRED for free Wan2.2-S2V tiers (image to animate)
      audioUrl,           // REQUIRED for free Wan2.2-S2V tiers (audio to sync to)
      audioBase64,        // alternative: raw audio as base64
      duration,           // optional override in seconds
      sceneIndex = 0,
      characterId,
      negativePrompt = "blurry, low quality, watermark, text overlay, distorted",
    } = body;

    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const model = MODELS[tier as keyof typeof MODELS] ?? MODELS.preview;
    const styledPrompt = `${STYLE_PREFIX[style] ?? ""} ${prompt}`.trim();
    const requestedSec = duration ? Math.min(Number(duration), model.maxSec) : model.maxSec;

    let videoUrl: string | null = null;

    // ── FREE PATH: Wan2.2-S2V via HF Inference ──────────────────────────────
    if (model.provider === "hf") {
      // Wan2.2-S2V: image + audio → synced video
      // Video length automatically matches the audio clip length
      if (!referenceImageUrl && !audioUrl && !audioBase64) {
        return NextResponse.json({
          error: "Wan2.2-S2V requires referenceImageUrl and audioUrl (or audioBase64). Provide a character portrait + audio clip.",
          hint: "POST { prompt, referenceImageUrl, audioUrl, tier:'preview' }",
        }, { status: 400 });
      }

      const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY ?? "");

      // Call the HF Space API for Wan2.2-S2V
      // The official Space: huggingface.co/spaces/Wan-AI/Wan2.2-S2V
      const spaceRes = await fetch(
        "https://wan-ai-wan2-2-s2v.hf.space/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY ?? ""}`,
          },
          body: JSON.stringify({
            fn_index: 0,
            data: [
              referenceImageUrl ?? null,     // reference image
              audioUrl ?? audioBase64 ?? null, // audio input
              styledPrompt,                  // motion/style prompt
              negativePrompt,
              Math.round(requestedSec * 24), // num_frames at 24fps
              tier === "production" ? 720 : 480, // height
              42,                            // seed
            ],
          }),
        }
      );

      if (!spaceRes.ok) {
        const err = await spaceRes.text();
        throw new Error(`Wan2.2-S2V Space error ${spaceRes.status}: ${err.slice(0, 200)}`);
      }

      const spaceJson = await spaceRes.json();
      // Space returns { data: [videoUrl, ...] }
      videoUrl = spaceJson?.data?.[0] ?? null;

      // Fallback: try HF Inference textToVideo if Space is unavailable
      if (!videoUrl) {
        const blob = await hf.textToVideo({
          model: model.id,
          inputs: styledPrompt,
          parameters: {
            negative_prompt: negativePrompt,
            width: model.w,
            height: model.h,
            ...(referenceImageUrl ? { image: referenceImageUrl } : {}),
            ...(audioUrl ? { audio: audioUrl } : {}),
          },
        });
        const ab = await blob.arrayBuffer();
        const b64 = Buffer.from(ab).toString("base64");
        videoUrl = `data:video/mp4;base64,${b64}`;
      }
    }

    // ── PAID PATH: Seedance via fal.ai ───────────────────────────────────────
    else {
      const { fal } = await import("@fal-ai/client");
      fal.config({ credentials: process.env.FAL_API_KEY ?? "" });

      const isI2V = tier.endsWith("-i2v");
      const falInput: Record<string, unknown> = {
        prompt: styledPrompt,
        negative_prompt: negativePrompt,
        duration: requestedSec,
        aspect_ratio: model.w > model.h ? "16:9" : "9:16",
        ...(isI2V && referenceImageUrl ? { image_url: referenceImageUrl } : {}),
      };

      const result = await fal.subscribe(model.id, {
        input: falInput,
        pollInterval: 2000,
        logs: false,
      }) as { video?: { url: string }; url?: string };

      videoUrl = result?.video?.url ?? result?.url ?? null;
      if (!videoUrl) {
        return NextResponse.json({ error: "No video URL in fal response", raw: result }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: "complete",
      videoUrl,
      provider: model.provider,
      modelId: model.id,
      modelNote: model.note,
      tier,
      style,
      resolution: `${model.w}×${model.h}`,
      maxDurationSec: model.maxSec,
      requestedDurationSec: requestedSec,
      sceneIndex,
      characterId: characterId ?? null,
      prompt: styledPrompt,
    });

  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes("429") || msg.includes("503") || msg.includes("queue")) {
      return NextResponse.json({ status: "queued", message: "Model busy — retry in 15s" }, { status: 202 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const tier = body.tier?.startsWith("ultra") ? "ultra-i2v" : "premium-i2v";
  return POST(new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({ ...body, tier }),
  }));
}
