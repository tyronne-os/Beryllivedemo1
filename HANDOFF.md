# BERYL — Eve Alive Pipeline Handoff
_Created 2026-06-30 for cross-account Claude continuation_

---

## Mission (do not change this goal)
**Get Eve "alive" — real lip-synced video where her spoken words come out of her mouth.**  
CSS animation = wrong. Whole-image bounce = wrong. We need diffusion-driven talking-head video.

Repo: `tyronne-os/Beryllivedemo1` branch `hf-deploy`  
HF Space: `AIBRUH/ycberyldemo` (same code, always push both)  
Working dir: `C:/Users/tjlsu/berylllm/Beryllivedemo1`  
All API keys: `C:/Users/tjlsu/berylllm/.env` — NEVER commit

---

## Current pipeline status

### ✅ WORKING
| Step | Service | Notes |
|------|---------|-------|
| Text reply | Grok-3-mini (`api.x.ai/v1/chat/completions`) | `XAI_API_KEY` in .env. Never fails. |
| Image-to-video | Wan2.2 14B i2v Lightning | `eldmans-wan2-2-14b-i2v-480p-lightning-nsfw-diffusers.hf.space` — PROVEN: `public/eve_wave.mp4` exists (Eve waving, 4s) |
| Browser voice | `window.speechSynthesis` | Fallback only. Picks female voice (Zira/Ava/Samantha). Not lip-synced. |

### ❌ BLOCKED / FAILED
| Step | Service | Why |
|------|---------|-----|
| TTS | Grok `/audio/speech` | 403 "Team not authorized" — xAI TTS not enabled on this account |
| TTS | OpenAI | Key expired/invalid (164-char sk-proj-...) |
| TTS | Chatterbox (resembleai) | ZeroGPU `event: error, data: null` — unreliable |
| TTS | innoai/Edge-TTS public | Shared queue, estimation→heartbeat loop, never processes |
| Lip-sync | LatentSync (AIBRUH/latentsync) | A10G Small — was SLEEPING. Can restart via `POST https://huggingface.co/api/spaces/AIBRUH/latentsync/restart` with Bearer token |

### 🟡 READY BUT UNTESTED
| Step | Service | Notes |
|------|---------|-------|
| TTS | `AIBRUH/eve-tts` | Duplicated from `innoai/Edge-TTS`, cpu-upgrade hardware, dedicated (no shared queue). SHOULD be RUNNING. Use queue/join pattern. Voice: `"en-US-AvaMultilingualNeural - en-US (Female)"` |
| Lip-sync | `victor/LongCat-Video-Avatar-1.5` | LIVE on HF. Takes image + audio → lip-synced video. Endpoint `/generate`. See API below. |

---

## The next 3 things to do IN ORDER

### STEP 1 — Generate Eve's voice via AIBRUH/eve-tts
Check if the space is running first:
```bash
node -e "
const t=require('fs').readFileSync('C:/Users/tjlsu/berylllm/.env','utf8').match(/HF_TOKEN=(.+)/)?.[1]?.trim();
fetch('https://huggingface.co/api/spaces/AIBRUH/eve-tts',{headers:{Authorization:'Bearer '+t}}).then(r=>r.json()).then(j=>console.log(j?.runtime?.stage))
"
```
If not RUNNING, restart: `POST https://huggingface.co/api/spaces/AIBRUH/eve-tts/restart`

Then use the **queue/join + queue/data SSE** pattern (NOT /call/ — that hangs):
```javascript
// Base URL: https://aibruh-eve-tts.hf.space
// fn_index: 0
// data: [TEXT, VOICE, 0, 0]
// VOICE = "en-US-AvaMultilingualNeural - en-US (Female)"
// TEXT = "I'm a warm, brilliant companion at Beryl AI Labs who connects with you in real time."
// Result audio in result.data[0].url or .path
// Save to public/eve_answer.mp3
```
Script already written at scratchpad: `tts_dedicated.mjs` — just run it.

### STEP 2 — Lip-sync via LongCat
Space: `victor/LongCat-Video-Avatar-1.5`  
Base URL: `https://victor-longcat-video-avatar-1-5.hf.space`

API (from `/gradio_api/info`):
```
ENDPOINT /generate
[0] image_path  (filepath)  — Eve's portrait
[1] audio_path  (filepath)  — audio from step 1
[2] prompt      (str)       def="A person is speaking expressively..."
[3] resolution  ('480p'|'720p') def='480p'
[4] seed        (int)       def=42
[5] vocal_mode  ('Clean speech (fast)'|'Isolate vocals (quality)') def='Clean speech (fast)'
[6] acceleration ('Exact 8-step'|'DBCache fast'|'DBCache faster') def='DBCache faster'
RETURNS: video file
```

Eve's portrait URL: `https://berylize.com/characters/EVE_SHIELD.png`

For image_path and audio_path — upload the files to LongCat's file endpoint first:
```
POST https://victor-longcat-video-avatar-1-5.hf.space/gradio_api/upload
multipart form, returns [{path: "tmp/..."}]
```
Then pass the returned `path` string as the value.

Use queue/join pattern (same as Wan2.2 — it works).

### STEP 3 — Screenshot the lip-synced video
Download the output video, extract frame 1-2 seconds in (when mouth is moving), save to `public/eve_answer_frame.jpg`. This is proof Eve is alive.

---

## Key API patterns

### Wan2.2 (PROVEN WORKING — reference for other HF spaces)
```javascript
// ImageData format:
const img = { path: URL, url: URL, orig_name: "portrait.jpg", size: null, mime_type: "image/png", is_stream: false, meta: { _type: "gradio.FileData" } };
// params array (16 items): [img, null, prompt, steps(max30), negPrompt, 4, guidance, 1, seed, true, 6, "UniPCMultistep", 3, 16(int), true, true]
// Use queue/join + SSE queue/data pattern
```

### Grok text (ALWAYS WORKS)
```javascript
POST https://api.x.ai/v1/chat/completions
{ model: "grok-3-mini", messages: [...], temperature: 0.8 }
Headers: { Authorization: "Bearer XAI_API_KEY" }
```

### HF Space management
```javascript
// Check stage:
GET https://huggingface.co/api/spaces/OWNER/SPACE  → .runtime.stage
// Restart sleeping space:
POST https://huggingface.co/api/spaces/OWNER/SPACE/restart
// Both need: Authorization: Bearer HF_TOKEN
```

---

## Files changed this session (already committed + pushed)
- `app/api/hf/speak/route.ts` — main pipeline: Grok → TTS → lip-sync
- `app/api/ltx/generate/route.ts` — Wan2.2 14B wrapper (working)
- `app/api/runway/poll/route.ts` — placeholder (Runway NOT used in Gym)
- `app/api/save-frame/route.ts` — dev helper
- `app/the-gym/page.tsx` — The Gym UI with browser speech fallback
- `app/ltx-studio/page.tsx` — LTX studio page
- `public/eve_wave.mp4` — PROOF Eve can wave (Wan2.2 generated)

---

## Rules (DO NOT VIOLATE)
1. pnpm only, never npm
2. Never commit .env or .env.local
3. Always push BOTH: `git push origin hf-deploy` AND `git push hf hf-deploy:main`
4. No Runway for The Gym
5. No CSS whole-image animation for "speaking" — only real diffusion video counts
6. Gradio SDK = thin host only; frontend = raw HTML5/JS (no stock Gradio components)
7. Zero native binary deps in production; use native `fetch()` not npm `openai`

---

## HF Spaces summary
| Space | Hardware | Status | Purpose |
|-------|----------|--------|---------|
| AIBRUH/ycberyldemo | cpu-basic | RUNNING | Main beryl demo (this repo) |
| AIBRUH/eve-tts | cpu-upgrade | Should be RUNNING | Dedicated Edge-TTS for Eve |
| AIBRUH/latentsync | A10G Small | Was SLEEPING — restart if needed | LatentSync lip-sync |
| victor/LongCat-Video-Avatar-1.5 | unknown | LIVE | Best talking-head option |
| eldmans/wan2-2-14b-i2v-480p-lightning-nsfw-diffusers | GPU | LIVE | Wan2.2 image-to-video (WORKING) |
