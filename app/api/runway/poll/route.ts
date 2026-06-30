import { NextRequest, NextResponse } from "next/server";

const RUNWAY_KEY = process.env.RUNWAY_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const res = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${RUNWAY_KEY}`,
      "X-Runway-Version": "2024-11-06",
    },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ status: "error", error: `Runway ${res?.status}` }, { status: 502 });
  }

  const data = await res.json() as {
    id: string;
    status: string;
    output?: string[];
    failure?: string;
  };

  const videoUrl = data?.output?.[0] ?? null;

  return NextResponse.json({
    status: data.status,      // PENDING | RUNNING | SUCCEEDED | FAILED
    videoUrl,
    failure: data.failure ?? null,
  });
}
