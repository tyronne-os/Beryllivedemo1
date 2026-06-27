/**
 * CDN resolver — resolves static asset URLs.
 *
 * Uses NEXT_PUBLIC_USE_HF_CDN (set in the HF Space README variables).
 * NEXT_PUBLIC_ prefix means Next.js bakes the value in at BUILD time —
 * identical on server and client, so no hydration mismatch.
 *
 * Production (HF Space): serves from AIBRUH/beryl-assets Dataset CDN
 * Local dev:             serves from /public
 */

const HF_CDN = "https://huggingface.co/datasets/AIBRUH/beryl-assets/resolve/main";

// NEXT_PUBLIC_ is inlined at build time — same value server + client
const USE_CDN = process.env.NEXT_PUBLIC_USE_HF_CDN === "true";

export function cdn(path: string): string {
  const clean = path.replace(/^\//, "");
  return USE_CDN ? `${HF_CDN}/${clean}` : `/${clean}`;
}

export const VIDEO = {
  hero:       cdn("videos/beryl-banner.mp4"),
  eve:        cdn("videos/eve-demo.mp4"),
  highlights: cdn("videos/beryl-llm-highlights.mp4"),
} as const;
