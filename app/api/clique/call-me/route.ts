import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/clique/call-me
 * Initiates an outbound call from an agent to the user.
 *
 * Body: { agentId: string, phone: string }
 *
 * Phase 1 implementation will:
 *  1. Initiate a Twilio outbound call to `phone`
 *  2. Connect to an OpenAI Realtime session pre-seeded with the agent's
 *     QCR profile and the last meeting context from beryl-clique-lake
 *  3. Stream the call via Realtime voice (gpt-realtime, voice per agentId)
 *
 * V1: returns 200 with a placeholder so the UI flow is wired end-to-end.
 */
export async function POST(req: NextRequest) {
  try {
    const { agentId, phone } = await req.json() as { agentId?: string; phone?: string };
    if (!agentId || !phone) {
      return NextResponse.json({ error: "agentId and phone required" }, { status: 400 });
    }

    // TODO Phase 1: Twilio + OpenAI Realtime outbound call
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    // await client.calls.create({ to: phone, from: process.env.TWILIO_NUMBER, twiml: ... });

    return NextResponse.json({
      ok: true,
      message: `${agentId} will call ${phone} shortly.`,
      status: "queued",
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
