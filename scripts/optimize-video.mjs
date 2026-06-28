/**
 * Video optimization script for Beryl Matinee hero video.
 * Compresses + web-optimizes: faststart moov atom, H.264 crf23, 1280px max.
 * Run: node scripts/optimize-video.mjs
 */
import { createRequire } from "module";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Resolve ffmpeg-static binary path
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const input  = join(root, "public", "videos", "matinee-hero.mp4");
const output = join(root, "public", "videos", "matinee-hero-opt.mp4");

if (!existsSync(input)) {
  console.error("❌ Input not found:", input);
  process.exit(1);
}

console.log("◈ OMEGA Video Optimizer");
console.log("  Input :", input);
console.log("  Output:", output);
console.log("  Processing — this takes ~60s for a 26MB file…\n");

ffmpeg(input)
  .videoCodec("libx264")
  .addOption("-crf", "22")          // quality: 18=lossless, 28=low; 22 is cinema-grade web
  .addOption("-preset", "slow")     // slower preset = better compression ratio
  .addOption("-tune", "film")       // optimize for cinematic content
  .addOption("-profile:v", "high")
  .addOption("-level", "4.1")
  .addOption("-pix_fmt", "yuv420p") // broad browser compatibility
  .videoFilter("scale=1280:-2")     // max 1280px wide, keep aspect ratio
  .audioCodec("aac")
  .addOption("-b:a", "128k")
  .addOption("-movflags", "+faststart") // ← CRITICAL: moov atom first = instant play on load
  .output(output)
  .on("start", cmd => console.log("  FFmpeg:", cmd.slice(0, 100), "..."))
  .on("progress", p => process.stdout.write(`\r  Progress: ${Math.round(p.percent ?? 0)}%`))
  .on("end", () => {
    console.log("\n\n✅ Optimization complete!");
    console.log("  Replace the original:");
    console.log("  → Copy public/videos/matinee-hero-opt.mp4 → public/videos/matinee-hero.mp4");
  })
  .on("error", err => {
    console.error("\n❌ FFmpeg error:", err.message);
    process.exit(1);
  })
  .run();
