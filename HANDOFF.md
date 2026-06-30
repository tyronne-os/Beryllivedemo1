# BERYL LIVE — HANDOFF DOC
_Last updated: 2026-06-30_

---

## Current State: Viseme-Driven Real-Time Lip Sync ✅

The Gym is now a genuine real-time conversational AI avatar — no pre-baked video loop,
no Runway, no per-second billing. Eve's mouth moves in sync with what she's actually
saying, driven by word-boundary timestamps from the TTS output.

### What's Working
- **Grok-3 Mini** → reply in ~4s
- **AIBRUH/eve-tts (fn_index 1)** → audio + word-boundary viseme timing in ~4s
- **Total round-trip: ~8–11s** (measured 11.24s end-to-end)
- **Viseme sync**: `requestAnimationFrame` loop reads `audio.currentTime`, finds active
  word boundary, swaps Eve's mouth-shape frame in real time
- **6 viseme frames** extracted from Eve's own Wan2.2 speaking footage, served from
  `/public/visemes/`: rest, aa (wide), ou (round), ee (smile), fv (teeth-lip), mid

---

## Pipeline Architecture

```
User message
    │
    ▼
POST /api/hf/speak
    ├─► Grok-3 Mini (api.x.ai) ──► reply text (~4s)
    └─► AIBRUH/eve-tts fn_index 1 (edge-tts boundary=WordBoundary)
            └─► audioUrl + visemes [{word, offsetMs, durationMs}] (~4s)
                         (sequential — TTS runs on the reply, not the user text)
    │
    ▼
Client (the-gym/page.tsx)
    ├─► <audio> plays audioUrl
    ├─► rAF loop: audio.currentTime → active viseme → swap <img src>
    └─► wordToViseme() grapheme classifier:
            rest  → M/B/P or silence
            aa    → A vowels
            ou    → O/U vowels
            ee    → E/I vowels
            fv    → F/V consonants
            mid   → everything else
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/hf/speak/route.ts` | Main pipeline: Grok→TTS, returns `{reply, audioUrl, visemes}` |
| `app/the-gym/page.tsx` | Avatar UI, viseme rAF loop, `wordToViseme()` classifier |
| `public/visemes/eve_viseme_*.png` | 6 mouth-shape frames (rest/aa/ou/ee/fv/mid) |
| `public/eve_speaking.mp4` | PROOF: LatentSync lip-sync output (807KB, 66s A10G) |
| `public/eve_answer.mp3` | Eve TTS reference audio (43KB) |

---

## HF Spaces

| Space | Hardware | Role |
|-------|----------|------|
| `AIBRUH/eve-tts` | cpu-upgrade | TTS + word boundaries. fn_index 0 = audio only, fn_index 1 = audio + visemes JSON |
| `AIBRUH/latentsync` | A10G Small | Takes VIDEO+AUDIO → lip-synced video (66s, proven). NOT in hot path. |
| `eldmans/wan2-2-14b-i2v-480p-lightning-nsfw-diffusers` | GPU | Image→video. Used to generate viseme source footage. |

---

## eve-tts Space: fn_index Map

```
fn_index 0  →  tts_interface(text, voice, rate, pitch)
               returns: [AudioFile, warning]

fn_index 1  →  visemes_interface(text, voice, rate, pitch)
               returns: [AudioFile, visemes_json_string, warning]
               visemes_json: [{word, offsetMs, durationMs}, ...]
```

**Voice**: `en-US-AvaNeural - en-US (Female)`
Note: AvaMultilingualNeural does NOT emit WordBoundary events (only SentenceBoundary).
Must use standard AvaNeural and pass `boundary='WordBoundary'` to edge-tts Communicate.

---

## API Keys (all in `C:\Users\tjlsu\berylllm\.env` — NEVER commit)

- `XAI_API_KEY` — Grok-3 Mini
- `HF_TOKEN` — eve-tts, latentsync, Wan2.2
- `RUNWAY_API_KEY` — NOT used in The Gym (no Runway rule)
- `LIVEKIT_*` — for future Clique real-time room

---

## Hard Constraints

- `pnpm` only — never npm
- Never commit `.env` or `.env.local`
- No Runway in The Gym — own pipeline only
- Push to BOTH: `git push origin hf-deploy` AND `git push hf hf-deploy:main`
- Zero native binary deps in production (use native `fetch()`)

---

## What Was Attempted & Abandoned

| Approach | Why Abandoned |
|----------|---------------|
| LatentSync in hot path | 66s per response — too slow for conversation |
| Pre-baked eve_talking_loop.mp4 | Same loop every turn = looks scripted/robotic |
| AvaMultilingualNeural for visemes | No WordBoundary support, only SentenceBoundary |
| xAI TTS | 403 "Team not authorized" on this account |
| LongCat, LTX-2-3-sync | ZeroGPU file isolation bug — uploads inaccessible in GPU container |

---

## Next Steps / Open TODOs

1. **Idle animation between turns**: replace CSS breathing with an actual idle video loop
   (subtle blink/sway via Wan2.2 "woman listening, micro-expressions, slight breathing")
   shown while `avatarState === "idle"` instead of still portrait.

2. **Smooth viseme transitions**: add 60–80ms crossfade between mouth frames to reduce
   hard-swap flicker at word boundaries.

3. **True phoneme timing**: current heuristic classifies by first vowel / leading
   consonant per word. For finer accuracy, integrate a G2P library (e.g. `g2p-en` on HF)
   that maps text to ARPAbet phonemes with per-phoneme timing within each word boundary.

4. **Clique multi-agent**: once Eve's pipeline is solid, expand to full Clique — CSA on
   separate HF Space, n8n-style orchestration via KREWE canvas, all agents active
   simultaneously per the 500%-cheaper cost model.

5. **Screenshot proof**: `preview_screenshot` times out in this dev environment;
   `computer-use` screenshot fails too. Open `localhost:3000/the-gym` in Chrome directly,
   enter a name, ask a question, and capture mid-response manually — or reconnect the
   Chrome extension for automated capture.
