import { NextRequest, NextResponse } from "next/server";
import { CLIQUE_ROSTER } from "@/lib/clique-roster";

/**
 * CLS Live Clip Generator
 *
 * Generates a short Runway video of an agent "going live" — speaking and
 * gesturing naturally. Used to switch from the CLS idle loop to an authentic
 * live character moment.
 *
 * POST /api/clique/cls-live
 * Body: { agentId: string, mood?: "speak" | "nod" | "react" | "explain" }
 * Returns: { taskId, status: "PENDING" }
 *
 * GET /api/clique/cls-live?taskId=xxx
 * Returns: { taskId, status, videoUrl? }
 */

const RUNWAY_HOST    = "https://api.dev.runwayml.com";
const RUNWAY_VERSION = "2024-11-06";

const LIVE_PROMPTS: Record<string, string> = {
  speak:   "person speaking naturally and confidently, slight hand gesture, engaged expression, mouth moving naturally, waist-up portrait, navy blazer, crest on pocket",
  nod:     "person nodding slowly while listening, thoughtful expression, slight forward lean, waist-up portrait, navy blazer, crest on pocket",
  react:   "person reacting with warm expression, subtle smile forming, eyes bright and engaged, waist-up portrait, navy blazer, crest on pocket",
  explain: "person explaining something with a small deliberate hand gesture, clear direct gaze, professional, waist-up portrait, navy blazer, crest on pocket",
};

const SUFFIX = " Photorealistic. Seamless loopable clip. Cinematic lighting. No cuts.";

async function getPortraitBase64(portraitPath: string): Promise<string> {
  // portraitPath is like /characters/AMANDA_SHIELD.png — resolve from public/
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "public", portraitPath);
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, mood = "speak" } = await req.json();
    if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });

    const agent = CLIQUE_ROSTER.find(a => a.id === agentId);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const promptBase = LIVE_PROMPTS[mood] ?? LIVE_PROMPTS.speak;
    const promptText = promptBase + SUFFIX;

    const portraitB64 = await getPortraitBase64(agent.portrait);

    const body = {
      model: "gen4_turbo",
      promptImage: portraitB64,
      promptText,
      duration: 5,
      ratio: "720:1280",
    };

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
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ taskId: data.id, status: "PENDING", agentId, mood });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const res = await fetch(`${RUNWAY_HOST}/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
      "X-Runway-Version": RUNWAY_VERSION,
    },
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

  const data = await res.json();
  if (data.status === "SUCCEEDED") {
    return NextResponse.json({ taskId, status: "SUCCEEDED", videoUrl: data.output?.[0] ?? null });
  }
  if (data.status === "FAILED") {
    return NextResponse.json({ taskId, status: "FAILED", error: data.failure }, { status: 500 });
  }
  return NextResponse.json({ taskId, status: data.status, videoUrl: null });
}
