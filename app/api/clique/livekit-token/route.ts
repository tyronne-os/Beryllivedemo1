import { NextRequest, NextResponse } from "next/server";

/**
 * Mints a LiveKit access token so a real human can join a Clique room over
 * encrypted WebRTC — sharing the room with the AI agents.
 *
 * Signed with HS256 using Web Crypto (no native deps, no server SDK).
 * POST { room: string, identity: string, name?: string } -> { token, url }
 */

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${b64url(sig)}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 });
  }

  let body: { room?: string; identity?: string; name?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const room = (body.room || "").trim();
  const identity = (body.identity || "").trim();
  if (!room || !identity) {
    return NextResponse.json({ error: "room and identity required" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
    sub: identity,
    name: body.name || identity,
    nbf: now,
    iat: now,
    exp: now + 60 * 60 * 4, // 4h
    video: {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  };

  const token = await signJWT(payload, apiSecret);
  return NextResponse.json({ token, url });
}
