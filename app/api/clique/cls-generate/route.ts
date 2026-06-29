import { NextRequest, NextResponse } from "next/server";

/**
 * CLS Video Generator — Runway Gen4 Turbo
 *
 * Takes an agent portrait + CLS variant name, generates a seamless
 * looping character animation via Runway image_to_video, and returns
 * the video URL for uploading to the HF data lake.
 *
 * POST /api/clique/cls-generate
 * Body: { agentId: string, variant: string, portraitUrl: string }
 * Returns: { taskId, status, videoUrl? }
 *
 * GET /api/clique/cls-generate?taskId=xxx
 * Returns: { taskId, status, videoUrl? }
 */

const RUNWAY_HOST    = "https://api.dev.runwayml.com";
const RUNWAY_VERSION = "2024-11-06";
const RUNWAY_MODEL   = "gen4_turbo";

// Motion prompts for each CLS variant — describe natural human micro-movements
const VARIANT_PROMPTS: Record<string, string> = {
  wave:   "person waves hello warmly with one hand, genuine smile, natural greeting movement, professional setting, subtle ambient movement",
  idle_a: "person breathing naturally, slight gentle head micro-movements, soft attentive expression, professional, alive and present",
  idle_b: "person glancing slightly to one side then returning gaze to camera with natural blink, thoughtful expression",
  idle_c: "person leaning slightly forward, engaged and attentive, subtle body sway, professional confidence",
  nod:    "person nodding slowly in understanding and agreement, warm expression, reassuring gesture",
  smile:  "person holding a warm genuine smile, eyes bright, steady confident gaze, approachable",
  glance: "person glances left then right then back to camera naturally, curious alert expression",
  focus:  "person looking directly at camera with sharp focused confident expression, still, professional",
};

const SHARED_SUFFIX = " Waist-up framing. Blazer jacket visible. Photorealistic. No scene cuts. Seamlessly loopable. Cinematic quality.";

function buildPrompt(variant: string): string {
  const base = VARIANT_PROMPTS[variant] ?? VARIANT_PROMPTS.idle_a;
  return base + SHARED_SUFFIX;
}

async function pollTask(taskId: string): Promise<NextResponse> {
  const res = await fetch(`${RUNWAY_HOST}/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
      "X-Runway-Version": RUNWAY_VERSION,
    },
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

  const data = await res.json();
  const status: string = data.status;

  if (status === "SUCCEEDED") {
    const videoUrl = data.output?.[0] ?? null;
    return NextResponse.json({ taskId, status: "SUCCEEDED", videoUrl });
  }
  if (status === "FAILED") {
    return NextResponse.json({ taskId, status: "FAILED", error: data.failure ?? "Runway generation failed" }, { status: 500 });
  }
  // PENDING / RUNNING — caller should poll again
  return NextResponse.json({ taskId, status, videoUrl: null });
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
  return pollTask(taskId);
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, variant, portraitUrl } = await req.json();

    if (!agentId || !variant || !portraitUrl) {
      return NextResponse.json({ error: "agentId, variant, portraitUrl required" }, { status: 400 });
    }

    const prompt = buildPrompt(variant);

    const body: Record<string, unknown> = {
      model: RUNWAY_MODEL,
      promptText: prompt,
      duration: 5,       // 5-second loop — enough for seamless looping
      ratio: "720:1280", // portrait aspect
    };

    // Runway accepts a URL or base64 data URI
    if (portraitUrl.startsWith("data:")) {
      body.promptImage = portraitUrl;
    } else {
      body.promptImage = portraitUrl;
    }

    const res = await fetch(`${RUNWAY_HOST}/v1/image_to_video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": RUNWAY_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const taskId: string = data.id;

    return NextResponse.json({ taskId, status: "PENDING", agentId, variant });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
