import { NextRequest, NextResponse } from "next/server";

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const HF_REPO  = "AIBRUH/beryl-matinee-gallery";
const HF_API   = `https://huggingface.co/api/datasets/${HF_REPO}`;
const HF_DS    = `https://datasets-server.huggingface.co/rows?dataset=${HF_REPO}&config=default&split=train&offset=0&limit=100`;

export interface GalleryClip {
  id: string;
  title: string;
  filmTitle?: string;
  videoUrl?: string;
  thumbnail?: string;
  sceneCount: number;
  tier: string;
  style: string;
  narrativeArc?: string;
  genre?: string;
  colorGrade?: string;
  editorialNote?: string;
  estimatedRuntime?: string;
  createdAt: string;
  linkedinShared: boolean;
  linkedinPost?: string;
}

// ── GET — list all saved clips ───────────────────────────────────────────────
export async function GET() {
  try {
    // Try HF Dataset server first
    const res = await fetch(HF_DS, {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const clips: GalleryClip[] = (data.rows ?? []).map((r: { row: GalleryClip }) => r.row);
      return NextResponse.json({ clips, source: "hf-dataset" });
    }

    // Dataset doesn't exist yet — return empty gallery
    return NextResponse.json({ clips: [], source: "empty", hint: "No clips saved yet. Save your first film to create the gallery." });
  } catch (e) {
    return NextResponse.json({ clips: [], error: String(e) });
  }
}

// ── POST — save a clip to HF Dataset ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clip: GalleryClip = {
      id: `clip-${Date.now()}`,
      title: body.title ?? "Untitled Clip",
      filmTitle: body.filmTitle,
      videoUrl: body.videoUrl,
      thumbnail: body.thumbnail,
      sceneCount: body.sceneCount ?? 1,
      tier: body.tier ?? "preview",
      style: body.style ?? "photorealistic",
      narrativeArc: body.narrativeArc,
      genre: body.genre,
      colorGrade: body.colorGrade,
      editorialNote: body.editorialNote,
      estimatedRuntime: body.estimatedRuntime,
      createdAt: new Date().toISOString(),
      linkedinShared: false,
    };

    // Push to HF Dataset via Hub API (JSONL commit)
    const jsonl = JSON.stringify(clip);

    const commitRes = await fetch(
      `https://huggingface.co/api/datasets/${HF_REPO}/commit/main`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commitMessage: `Add clip: ${clip.title}`,
          operations: [
            {
              operation: "addUpdateFile",
              path: `data/clips/${clip.id}.json`,
              content: Buffer.from(JSON.stringify(clip, null, 2)).toString("base64"),
            },
          ],
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.text();
      // Repo may not exist — return success anyway so UI still works
      console.warn("HF commit warning:", err);
    }

    return NextResponse.json({ clip, saved: commitRes.ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── PATCH — mark clip as LinkedIn shared ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { id, linkedinPost } = await req.json();
    // In a full impl, update the JSON file in HF repo
    // For now return success — client updates local state
    return NextResponse.json({ id, linkedinShared: true, linkedinPost });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
