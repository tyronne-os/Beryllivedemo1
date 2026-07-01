import { NextResponse } from "next/server";
import { getAgentPrompt } from "@/lib/clique-agent-prompts";

/**
 * Amanda CSA — OpenAI Realtime ephemeral token
 * Amanda is the Clique Supervisor Agent powered by Beryl Live Human OS.
 * Voice: shimmer (warm, authoritative, professional)
 * Model: gpt-4o-realtime-preview (latest)
 *
 * The client uses this token to establish a WebRTC peer connection directly
 * with OpenAI Realtime — no audio passes through our server.
 */
export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "shimmer",
        modalities: ["audio", "text"],

        instructions: getAgentPrompt("amanda")?.system ?? "You are Amanda, the Clique Supervisor.",

        turn_detection: {
          type: "server_vad",
          threshold: 0.45,
          prefix_padding_ms: 200,
          silence_duration_ms: 600,
        },
        input_audio_transcription: { model: "whisper-1" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      token: data.client_secret?.value ?? data.client_secret,
      expires_at: data.expires_at,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
