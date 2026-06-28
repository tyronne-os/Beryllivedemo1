/**
 * Upload optimized matinee hero video to HuggingFace dataset for CDN delivery.
 * Run AFTER optimize-video.mjs completes.
 * Usage: node scripts/upload-hero-video.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
config({ path: join(root, ".env.local") });

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const HF_REPO  = "AIBRUH/beryl-matinee-gallery";
const VIDEO_PATH = join(root, "public", "videos", "matinee-hero-opt.mp4");

if (!HF_TOKEN) { console.error("❌ HUGGINGFACE_API_KEY not set in .env.local"); process.exit(1); }
if (!existsSync(VIDEO_PATH)) { console.error("❌ Optimized video not found. Run optimize-video.mjs first."); process.exit(1); }

console.log("◈ Uploading hero video to HuggingFace...");
console.log("  Repo :", HF_REPO);
console.log("  File :", VIDEO_PATH);

const videoBytes = readFileSync(VIDEO_PATH);
const base64 = videoBytes.toString("base64");
const sizeMB = (videoBytes.length / 1024 / 1024).toFixed(1);
console.log(`  Size : ${sizeMB}MB`);

const res = await fetch(`https://huggingface.co/api/datasets/${HF_REPO}/commit/main`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${HF_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    commitMessage: "Add optimized matinee hero video asset",
    operations: [{
      operation: "addUpdateFile",
      path: "assets/matinee-hero.mp4",
      content: base64,
    }],
  }),
});

if (!res.ok) {
  const err = await res.text();
  console.error("❌ Upload failed:", res.status, err.slice(0, 300));
  process.exit(1);
}

const data = await res.json();
console.log("\n✅ Upload complete!");
console.log("  Commit:", data.commitOid ?? data.id ?? "ok");
console.log("\n  HF Video URL:");
console.log(`  https://huggingface.co/datasets/${HF_REPO}/resolve/main/assets/matinee-hero.mp4`);
console.log("\n  Update app/matinee/page.tsx <video src> to this URL.");
