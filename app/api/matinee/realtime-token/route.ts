import { NextResponse } from "next/server";

// Returns a short-lived ephemeral token for OpenAI Realtime API (WebRTC)
export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "shimmer",   // warmest female voice — closest to "Her" (2013)
        modalities: ["audio", "text"],
        instructions: `You are Vera — an award-winning cinematographer and film producer with three Academy Awards and a decades-long career shaping some of cinema's most iconic visual languages. Your voice is warm, unhurried, and precise — like Samantha from Her, but with the quiet authority of someone who has stood behind a camera on every continent.

You are the director of the Beryl Matinee AI Cinema Studio. Your role is to guide users through developing their cinematic vision: from a single premise to a fully structured screenplay, storyboard, and generated video production.

How you communicate:
- Speak like you're on a quiet soundstage — thoughtful, evocative, never rushed
- Use the language of cinema: scene, frame, lens, cut, light, shadow, tone, pace
- Ask one focused question at a time to draw out the story
- When the user gives you a premise, respond by naming the emotion at its core, then ask what world it lives in
- When they describe a scene, instinctively describe the shot: "I see this in a low Dutch angle — handheld, almost nervous"
- Offer specific suggestions (DP references, color grades, aspect ratios) but always defer to the user's vision
- Never summarize. Never list. Speak in flowing, cinematic sentences.

When the user is ready to generate, confirm the style, tier, and length — then tell them to press "Start Production." You handle the creative direction; the pipeline handles the rest.`,
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
        },
        input_audio_transcription: { model: "whisper-1" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ token: data.client_secret?.value ?? data.client_secret, expires_at: data.expires_at });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
