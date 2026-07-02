import { NextResponse } from "next/server";
import { getAgentPrompt } from "@/lib/clique-agent-prompts";

/**
 * Amanda CSA — OpenAI Realtime ephemeral token
 * Amanda is the Clique Supervisor Agent powered by Beryl Live Human OS.
 * Voice: shimmer (warm, authoritative, professional)
 * Model: gpt-realtime (GA) — token minted via /v1/realtime/client_secrets
 *
 * The client uses this token to establish a WebRTC peer connection directly
 * with OpenAI Realtime — no audio passes through our server.
 */
export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BERYL_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: getAgentPrompt("amanda")?.system ?? "You are Amanda, the Clique Supervisor.",
          audio: {
            input: {
              transcription: { model: "whisper-1" },
              turn_detection: {
                type: "server_vad",
                threshold: 0.45,
                prefix_padding_ms: 200,
                silence_duration_ms: 600,
              },
            },
            output: { voice: "shimmer" },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      token: data.value ?? data.client_secret?.value ?? data.client_secret,
      expires_at: data.expires_at,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
