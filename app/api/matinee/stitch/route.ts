import { NextRequest, NextResponse } from "next/server";

interface SceneInput {
  index: number;
  title: string;
  description: string;
  mood: string;
  cameraWork?: string;
  colorGrade?: string;
  location?: string;
  videoUrl?: string;
  status: string;
}

async function callOpenAI(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content ?? "{}";
}

export async function POST(req: NextRequest) {
  try {
    const { scenes, filmTitle, narrativeArc, genre, style } = await req.json();

    if (!scenes || scenes.length < 2) {
      return NextResponse.json({ error: "Need at least 2 scenes to stitch" }, { status: 400 });
    }

    const editorialPrompt = `You are a legendary film editor with the sensibility of Thelma Schoonmaker, Walter Murch, and Michael Kahn combined. You have been given the following scenes for "${filmTitle}".

Narrative arc: ${narrativeArc}
Genre: ${genre ?? "cinematic drama"}
Visual style: ${style ?? "photorealistic"}

SCENES:
${scenes.map((s: SceneInput, i: number) => `
SCENE ${i + 1}: ${s.title}
Description: ${s.description}
Mood: ${s.mood}
Camera: ${s.cameraWork ?? "unspecified"}
Color grade: ${s.colorGrade ?? "unspecified"}
Location: ${s.location ?? "unspecified"}
Video ready: ${s.status === "ready" ? "YES" : "PENDING"}
`).join("\n")}

Your task: Design the editorial assembly plan for this film. Return a JSON object with:
1. "order" — array of scene indices (0-based) in the optimal narrative order (you may reorder for dramatic effect)
2. "transitions" — array of transition objects between each consecutive pair of scenes:
   {
     "fromScene": number,
     "toScene": number,
     "type": "cut" | "dissolve" | "smash_cut" | "match_cut" | "fade_to_black" | "wipe",
     "duration_ms": number (0 for cut, 500-2000 for dissolve/fade),
     "bridgePrompt": string (optional — if a 2-3 second bridge clip would strengthen the transition, describe it cinematically),
     "editorialNote": string (why this transition serves the film)
   }
3. "colorConsistency" — object describing the master color grade to unify all scenes: { "grade": string, "rationale": string }
4. "pacing" — object: { "overallTempo": "slow burn" | "pulse" | "frenetic", "climaxAt": number (scene index), "note": string }
5. "filmNote" — one paragraph from the editor's perspective on what makes this film work

Return ONLY valid JSON, no markdown.`;

    const content = await callOpenAI([{ role: "user", content: editorialPrompt }]);
    const editorial = JSON.parse(content);

    const bridgeClips: { fromScene: number; toScene: number; prompt: string; duration: number }[] = [];
    if (editorial.transitions) {
      for (const t of editorial.transitions) {
        if (t.bridgePrompt) {
          bridgeClips.push({ fromScene: t.fromScene, toScene: t.toScene, prompt: t.bridgePrompt, duration: 3 });
        }
      }
    }

    const orderedScenes = (editorial.order ?? scenes.map((_: SceneInput, i: number) => i))
      .map((idx: number) => scenes[idx])
      .filter(Boolean);

    const playlist = orderedScenes.map((scene: SceneInput, i: number) => {
      const nextScene = orderedScenes[i + 1];
      const transition = editorial.transitions?.find(
        (t: { fromScene: number; toScene: number }) =>
          t.fromScene === scene.index && t.toScene === nextScene?.index
      );
      return { scene, transition: transition ?? { type: "cut", duration_ms: 0 } };
    });

    return NextResponse.json({
      filmTitle,
      narrativeArc,
      playlist,
      editorial,
      bridgeClips,
      totalScenes: orderedScenes.length,
      estimatedRuntime: `${orderedScenes.length * 10}–${orderedScenes.length * 30} seconds`,
      status: "assembled",
    });

  } catch (e) {
    console.error("Stitch error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
