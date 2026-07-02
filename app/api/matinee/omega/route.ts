import { NextRequest, NextResponse } from "next/server";

const OMEGA_SYSTEM = `You are "OMEGA" — an Academy Award-winning Director of Photography with 25+ years experience across ARRI Alexa, RED Monstro, and Panavision optics. You transform creative prompts into cinematographically perfect specifications that AI generation systems execute at Hollywood blockbuster level.

CAMERA SELECTION MATRIX:
- ACTION: ARRI Alexa LF + Panavision DXL anamorphic optics
- DRAMA/INTIMACY: RED Monstro 8K + Cooke S7 prime lenses
- PERIOD PIECES: ARRI Mini LF + vintage Panavision C-Series
- SCI-FI: RED V-Raptor 8K + ARRI Signature Prime lenses
- NATURAL/DOC: Sony Venice 2 + Leica Thalia lenses

LIGHTING TEMPLATES:
- Golden Hour: 5600K warm shift + long shadows + gold rim lighting
- Night/Moonlight: 3200K cool blue + harsh shadows + green undertone
- Chiaroscuro Drama: 8:1 contrast ratio + deep blacks + strategic highlights
- Natural Overcast: 6500K soft wrap + diffused reflections
- Practical Integration: on-screen lamps/windows/screens as motivated sources

FILM STOCK MATRIX:
- Kodak Vision3 5219: contrasty, rich shadows, orange highlights → thrillers, drama
- Fujifilm ETERNA: soft highlight roll-off, muted palette → indie, naturalistic
- ARRIRAW Digital: 14-stop DR, clean neutral → blockbusters, sci-fi, premium grading

COLOR GRADING PROTOCOL:
- Shadows: crushed blacks with teal/blue bias
- Midtones: neutral with slight warmth for skin realism
- Highlights: controlled orange/warm bias for cinematic depth
- Skin: natural orange-red at 70-80 IRE luminance
- Color science: ACES + Hollywood contrast curve

STYLE MODES:
- photorealistic → ARRI/RED cinema, Kodak emulation, motivated natural light
- pixar → sub-surface skin shaders, volumetric god rays, studio ghibli color boost, exaggerated proportions
- anime → Studio Ghibli painterly, fluid motion, atmospheric depth layers, watercolor backgrounds
- noir → high-contrast 8:1, deep shadows, teal-green underlighting, 1940s film grain
- scifi → cyberpunk neon, lens aberration, futuristic chromatic grading`;

const CONTENT_TEMPLATES: Record<string, string> = {
  live_action: `For this live-action scene, layer your enhancement through 3 passes:
PASS 1 — CINEMATOGRAPHY: Camera system, lens selection, aperture, shutter, frame rate, specific lighting setup with motivated sources, camera movement.
PASS 2 — PRODUCTION DESIGN: Environmental authenticity, texture/material light interaction, weathering, lived-in details, spatial accuracy.
PASS 3 — COLOR GRADING: Film stock emulation, tonal relationships, color bias in shadows/mids/highlights, grain, skin tone preservation.`,

  pixar: `For this animation scene, apply Pixar/Disney enhancement:
PASS 1 — ANIMATION CINEMATOGRAPHY: Virtual lens with warm distortion, volumetric lighting with subsurface scattering, animated dolly movement.
PASS 2 — PRODUCTION DESIGN: Exaggerated proportions with believable physics, plush surfaces, volumetric hair, eye catchlights.
PASS 3 — VISUAL TREATMENT: Studio Ghibli watercolor overlays, Disney saturation boost, enhanced rim lighting, atmospheric particle effects.`,

  scifi: `For this sci-fi scene, apply cyberpunk-blockbuster enhancement:
PASS 1 — CINEMATOGRAPHY: RED V-Raptor with Signature Primes, neon-motivated lighting, wide establishing with close tension cuts.
PASS 2 — PRODUCTION DESIGN: Futuristic materials with realistic wear, holographic UI elements, atmospheric haze and condensation.
PASS 3 — COLOR GRADING: ARRIRAW clean base, neon teal-orange split, lens aberration, deep shadow pools.`,
};

async function callOpenAI(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BERYL_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.72,
      max_tokens: 1200,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content ?? "{}";
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      style = "photorealistic",
      genre = "cinematic drama",
      mood = "dramatic",
      contentType = "live_action",
      title,
    } = await req.json();

    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const template = CONTENT_TEMPLATES[contentType] ?? CONTENT_TEMPLATES[style] ?? CONTENT_TEMPLATES.live_action;

    const userMsg = `Scene title: "${title ?? "Untitled Scene"}"
Raw creative prompt: "${prompt}"
Visual style: ${style}
Genre: ${genre}
Mood: ${mood}

${template}

Return a JSON object with these exact keys:
{
  "cinematographySpec": "one dense paragraph — camera body, lens, aperture, shutter, fps, lighting setup with specific color temperatures, camera movement",
  "productionDesignSpec": "one dense paragraph — environment, surfaces, textures, weathering, lived-in details",
  "colorGradingSpec": "one dense paragraph — film stock, tonal curve, shadow/mid/highlight color bias, grain, skin tone preservation",
  "finalPrompt": "the complete merged cinematic prompt ready for AI video generation — all 3 specs fused into one cohesive, technically precise, vivid description under 400 words",
  "omegaNote": "one sentence from OMEGA on the key visual signature of this shot"
}

Return ONLY valid JSON, no markdown fences.`;

    const content = await callOpenAI([
      { role: "system", content: OMEGA_SYSTEM },
      { role: "user", content: userMsg },
    ]);

    const enhanced = JSON.parse(content);

    return NextResponse.json({
      original: prompt,
      style,
      genre,
      mood,
      ...enhanced,
      omegaProcessed: true,
    });

  } catch (e) {
    console.error("OMEGA error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
