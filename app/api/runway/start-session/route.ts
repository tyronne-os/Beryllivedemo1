import { NextResponse } from "next/server";

const BASE = "https://api.dev.runwayml.com";
const EVE_AVATAR_ID = "15d823b6-8075-4fa1-8532-21e59629db44";
const VERSION = "2024-11-06";

export async function POST() {
  const key = process.env.RUNWAY_API_KEY;
  if (!key) return NextResponse.json({ error: "RUNWAY_API_KEY not set" }, { status: 500 });

  const headers = {
    Authorization: `Bearer ${key}`,
    "X-Runway-Version": VERSION,
    "Content-Type": "application/json",
  };

  // 1. Create realtime session
  const createRes = await fetch(`${BASE}/v1/realtime_sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gwm1_avatars",
      avatar: { type: "custom", avatarId: EVE_AVATAR_ID },
      maxDuration: 185,
    }),
  });

  const created = await createRes.json();
  if (!createRes.ok) return NextResponse.json({ error: created }, { status: createRes.status });

  const sessionId = created.id;

  // 2. Poll until READY (max 20s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await fetch(`${BASE}/v1/realtime_sessions/${sessionId}`, { headers });
    const data = await poll.json();

    if (data.status === "READY") {
      return NextResponse.json({ sessionId, sessionKey: data.sessionKey });
    }
    if (data.status === "FAILED" || data.status === "CANCELLED") {
      return NextResponse.json({ error: data }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Session did not become ready in time" }, { status: 504 });
}
