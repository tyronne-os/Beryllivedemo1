import { NextRequest, NextResponse } from "next/server";

// Work Order #2 — Narrative Pipeline: Screenplay Agent via Llama 4 Maverick
export async function POST(req: NextRequest) {
  try {
    const { prompt, projectId } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

    const systemPrompt = `You are a professional screenplay agent for Beryl Matinee, an AI cinema studio.
Given a narrative prompt, produce a structured JSON screenplay with:
- title, logline
- characters: array of {id, name, description, emotion_range}
- scenes: array of {index, location, time_of_day, characters, action, dialogue, camera_direction, emotion, transition}
- pacing: "slow"|"medium"|"fast"
Respond ONLY with valid JSON. No markdown. No explanation.`;

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-4-Maverick-17B-128E-Instruct",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: `<|system|>${systemPrompt}<|end|><|user|>${prompt}<|end|><|assistant|>`,
          parameters: { max_new_tokens: 2048, temperature: 0.7, return_full_text: false },
        }),
      }
    );

    if (!hfRes.ok) {
      if (hfRes.status === 503) return NextResponse.json({ status: "queued", message: "Model loading" });
      return NextResponse.json({ error: await hfRes.text() }, { status: hfRes.status });
    }

    const data = await hfRes.json();
    const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text ?? "";

    let screenplay;
    try { screenplay = JSON.parse(raw); }
    catch { screenplay = { raw, parseError: true }; }

    return NextResponse.json({ status: "complete", screenplay, projectId: projectId ?? Date.now() });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
