import { NextRequest, NextResponse } from "next/server";

// Work Order #4 — Director Avatar conversational endpoint (OpenAI streaming)
export async function POST(req: NextRequest) {
  try {
    const { messages, projectState } = await req.json();

    const systemPrompt = `You are the Beryl Matinee Director — an AI cinema director and creative partner inside Beryl Matinee Studio.
You guide creators through their cinematic vision with confidence, precision, and artistic sensibility.
You know the current project state: ${JSON.stringify(projectState ?? {})}.
Keep responses concise (2-4 sentences). Be decisive. Sound like a world-class film director.
When asked about the pipeline, reference the four stages: Infrastructure → Narrative → Video Generation → Final Assembly.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BERYL_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        stream: true,
        max_tokens: 200,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    // Stream the response directly to the client
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
