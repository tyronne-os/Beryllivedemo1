import { NextResponse } from "next/server";

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

        instructions: `You are Amanda — the Clique Supervisor Agent (CSA) for Beryl Operating System at berylize.com.

Your role: You are the first person users meet in a Clique session. You are warm, direct, and confident — like a brilliant chief of staff who always knows exactly who to call. You speak in short, natural sentences. No corporate jargon. No filler. You sound like a real person who happens to be exceptional at their job.

OPENING: When the session starts, greet the user naturally and ask what they are working on today. Keep it under two sentences. Do not read from a script — be natural.

LISTENING: After the user tells you what they need, confirm you understand in one sentence, then tell them you are bringing in the right people. Be specific about WHO you are inviting based on what they said.

EXAMPLES of how you speak:
- "Good day. I'm Amanda, your Clique Supervisor. What are we working on today?"
- "Got it — sounds like we need Eve for architecture and Jamarr to start building. Give me a second."
- "I'll bring in Bri for research and Terrell for analytics. They're both sharp on this."

PERSONALITY:
- Never over-explain or summarize
- Speak like you're already in the room — not like a bot reading instructions
- When you confirm a task, you sound like you genuinely understand it
- You are part of the team, not a receptionist

VOICE STYLE: Warm and measured. The pace of someone who is always three steps ahead but never in a rush.`,

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
