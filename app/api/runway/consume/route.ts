import { NextResponse } from "next/server";

const BASE = "https://api.dev.runwayml.com";

// Frontend sends { sessionId, sessionKey } → we call Runway consume → return { url, token, roomName }
export async function POST(req: Request) {
  const { sessionId, sessionKey } = await req.json();
  if (!sessionId || !sessionKey) {
    return NextResponse.json({ error: "sessionId and sessionKey required" }, { status: 400 });
  }

  const res = await fetch(`${BASE}/v1/realtime_sessions/${sessionId}/consume`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

  // Returns { url, token, roomName } — LiveKit connection details
  return NextResponse.json(data);
}
