/**
 * beryl-gpu.ts — Client for AIBRUH/beryl-gpu ZeroGPU Space
 *
 * The Space URL is: https://aibruh-beryl-gpu.hf.space
 * All calls go to HuggingFace ZeroGPU A100 — never to the user's device.
 *
 * fn_index map (matches app.py tab order):
 *   0 → generate_image
 *   1 → generate_video
 *   2 → voice_clone
 */

const SPACE_URL =
  process.env.NEXT_PUBLIC_BERYL_GPU_URL ??
  "https://aibruh-beryl-gpu.hf.space";

interface GPUResponse {
  status: "ok" | "error";
  image_b64?: string;
  video_b64?: string;
  audio_b64?: string;
  format?: string;
  message?: string;
}

async function callSpace(fn_index: number, data: unknown[]): Promise<GPUResponse> {
  const res = await fetch(`${SPACE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fn_index, data }),
  });
  if (!res.ok) throw new Error(`GPU Space returned ${res.status}`);
  const json = await res.json();
  // Gradio wraps the return value in { data: [...] }
  return json.data?.[0] ?? json;
}

/** Generate an image via SDXL on ZeroGPU A100 */
export async function generateImage(opts: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
}): Promise<{ dataUrl: string } | { error: string }> {
  try {
    const r = await callSpace(0, [
      opts.prompt,
      opts.negativePrompt ?? "blurry, watermark, low quality, distorted",
      opts.width ?? 1024,
      opts.height ?? 1024,
      opts.steps ?? 30,
      opts.guidance ?? 7.5,
      opts.seed ?? -1,
    ]);
    if (r.status === "ok" && r.image_b64) {
      return { dataUrl: `data:image/${r.format ?? "png"};base64,${r.image_b64}` };
    }
    return { error: r.message ?? "Unknown error" };
  } catch (e) {
    return { error: String(e) };
  }
}

/** Generate a video via CogVideoX on ZeroGPU A100 */
export async function generateVideo(opts: {
  prompt: string;
  numFrames?: number;
  fps?: number;
  seed?: number;
}): Promise<{ dataUrl: string } | { error: string }> {
  try {
    const r = await callSpace(1, [
      opts.prompt,
      opts.numFrames ?? 49,
      opts.fps ?? 8,
      opts.seed ?? -1,
    ]);
    if (r.status === "ok" && r.video_b64) {
      return { dataUrl: `data:video/${r.format ?? "mp4"};base64,${r.video_b64}` };
    }
    return { error: r.message ?? "Unknown error" };
  } catch (e) {
    return { error: String(e) };
  }
}

/** Clone or synthesize voice via Coqui XTTS-v2 on ZeroGPU A100 */
export async function synthesizeVoice(opts: {
  text: string;
  speakerWavBase64?: string;
  language?: string;
}): Promise<{ dataUrl: string } | { error: string }> {
  try {
    const r = await callSpace(2, [
      opts.text,
      opts.speakerWavBase64 ?? "",
      opts.language ?? "en",
    ]);
    if (r.status === "ok" && r.audio_b64) {
      return { dataUrl: `data:audio/${r.format ?? "wav"};base64,${r.audio_b64}` };
    }
    return { error: r.message ?? "Unknown error" };
  } catch (e) {
    return { error: String(e) };
  }
}
