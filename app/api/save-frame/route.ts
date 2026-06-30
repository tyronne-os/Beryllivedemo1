import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Dev-only helper: accept a base64 image dataURL from the browser and write it to disk.
export async function POST(req: NextRequest) {
  const { name, dataUrl } = await req.json().catch(() => ({})) as { name?: string; dataUrl?: string };
  if (!dataUrl) return NextResponse.json({ error: "no dataUrl" }, { status: 400 });

  const b64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const dir = join(process.cwd(), "public", "frames");
  mkdirSync(dir, { recursive: true });
  const safe = (name ?? "frame.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  const file = join(dir, safe);
  writeFileSync(file, Buffer.from(b64, "base64"));
  return NextResponse.json({ ok: true, file, bytes: Buffer.from(b64, "base64").length });
}
