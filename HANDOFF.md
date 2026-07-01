# BERYL LIVE — HANDOFF DOC
_Last updated: 2026-06-30_

---

## ⭐ ACTIVE FOCUS: CLIQUE v1 (reduced 4-member live team)

**The Gym is DONE and frozen.** Work has switched back to Clique, which is nearly
complete. Decision: **no pre-baked loops in Clique** — the user powers extra members
with their own API key, so all members can be active.

### Clique v1 spec (as directed)
- **4 members total** (reduced from the full roster). Portraits provided by user.
  - **Amanda** — Clique Supervisor, **Microsoft Agent Framework**. Handles the majority
    of any task ALONE; only pulls in others when a second specialist genuinely helps.
  - **India** — Growth / Distribution (adaptable generalist).
  - **Jeff** — Operations / Delivery / Release (adaptable generalist).
  - **Nu** — Innovation / Lateral Thinker (adaptable generalist).
- **Every member is first and foremost a top-tier software engineer**: min 15 yrs
  FANG experience, staff→principal level. Named role = the lens they lead with, not a
  fence — any member can own any task end-to-end.
- **Meeting protocol (locked in)**:
  1. **Every meeting starts with Amanda alone.** She greets, takes the intake
     (goal / prompt / build request), mirrors back the goal, then decides solo vs.
     bring-in-team.
  2. **India, Jeff, Nu are on realtime-live listening from meeting start** — silent
     and attentive. They **do not speak** until Amanda has introduced them by name.
     If the user names them before Amanda has, they defer with "Listening." and let
     Amanda drive.
  3. Amanda uses a **canonical handoff phrase** to bring a member in:
     _"I'm bringing in <Name> — <Name>, take this."_ Frontends pattern-match this
     via `detectAmandaHandoff()` to flip that agent's UI from silent-listening →
     active.
  4. **Group greeting is the one exception**: "hey everyone" → all four reply
     together, short, enthusiastic, eager. Amanda still leads the working session
     immediately after.
  5. Amanda **closes** every session with a 2–4 line summary (decisions, ownership)
     and a clean handback: _"That's yours to take from here. Ping us when you need us."_
  6. v2 team (rest of scroller) unlocks with funding + own pipeline.
- **Runtime split**:
  - OpenAI Realtime (**realtime-live2**) → voice I/O, computer use, listening.
  - Runway API → the "alive" visual + active-listening presence.
  - Microsoft Agent Framework → Amanda's orchestration brain.

### Clique v1 files
| File | Purpose |
|------|---------|
| `lib/clique-agent-prompts.ts` | **NEW** — master system prompts for all 4 agents + `isGroupGreeting()`, `resolveResponders()`, `detectAmandaHandoff()` helpers. Encodes intake protocol, canonical handoff phrase, close-and-handback. This is the core deliverable. |
| `lib/clique-roster.ts` | Full roster + **NEW** `CLIQUE_V1_TEAM_IDS` / `getV1Team()` (amanda, india, jeff, nu) |
| `components/clique/CliqueRoom.tsx` | Live room UI (Amanda intro + join flow already built) |
| `lib/use-amanda-voice.ts` | Amanda's OpenAI Realtime WebRTC voice hook |
| `app/api/clique/realtime-token/route.ts` | Realtime session token |
| `app/api/clique/livekit-token/route.ts` | LiveKit room token |

### Clique v1 — remaining wiring (next session)
1. Point `CliqueRoom` at `getV1Team()` (4 members) instead of the 9-member default.
2. Wire `resolveResponders()` into the live listener: route each utterance to the
   named member / Amanda, or trigger the all-four group-greeting reply.
3. Feed each agent's `system` prompt from `clique-agent-prompts.ts` into its Realtime
   session (Amanda via MS Agent Framework, others via realtime-live2).
4. Group-greeting choreography: on `isGroupGreeting()`, fire all four `greeting`
   lines in a warm enthusiastic burst (stagger ~200ms so they don't clip).
5. Portraits: user uploaded 4 new headshots — regenerate/replace the SHIELD portraits
   for amanda/eve/brice/india if the new images should be canonical.

---

## Frozen: The Gym — Two-State Live Video Avatar ✅ (DONE, not active)

The Gym is a real-time conversational AI avatar — no overlay, no Runway, no per-second
billing. Eve is **alive on page load** (breathing/blinking idle video) and switches to a
talking-motion loop only while she's speaking. Voice is real TTS; visuals are pre-baked
Wan2.2 clips swapped by audio events.

### Design evolution (important context)
- **v1**: single `eve_talking_loop.mp4` looping every turn → looked scripted/robotic.
- **v2**: viseme PNG frame-swapping synced to TTS word boundaries → too 2D, flickery,
  lost head/body motion. **Abandoned.** (Viseme endpoint + PNGs still exist, unused.)
- **v3 (current)**: two full-motion videos, clean state machine:
  - `eve_idle.mp4` — stationary waiting state, micro eye-movements, slow blink, lips
    closed, breathing. Plays **at all times** including on load.
  - `eve_talking_loop.mp4` — lips/head moving. Swaps in **only** while `<audio>` plays,
    swaps back to idle on `audio.onended`.
  - No wave greeting (deleted — caused two competing loops, unnatural).

### What's Working
- **Grok-3 Mini** → reply (~4s)
- **AIBRUH/eve-tts (fn_index 1)** → audio + word timing (~4s)
- **Total round-trip: ~8–11s**
- **Opener**: on mount, Eve fires `__OPEN__` through the pipeline → speaks a greeting to
  TJ. Idle video already playing underneath.
- **Hardcoded** for demo: no overlay, `userName = "TJ"`. Overlay to be reinstalled later.

---

## Pipeline Architecture

```
Page load
    └─► eve_idle.mp4 plays immediately (alive, waiting)
    └─► after 900ms: eveRespond("__OPEN__", true) → Eve greets TJ

User message
    │
    ▼
POST /api/hf/speak
    ├─► Grok-3 Mini (api.x.ai) ──► reply text (~4s)
    │       (__OPEN__ gets a dedicated "wave hello, introduce yourself" opener prompt)
    └─► AIBRUH/eve-tts fn_index 1 (edge-tts boundary=WordBoundary)
            └─► audioUrl + visemes [{word, offsetMs, durationMs}]  (~4s)
    │
    ▼
Client (the-gym/page.tsx)
    ├─► setVideoSrc(EVE_TALK_VIDEO)  — swap to talking motion
    ├─► <audio> plays audioUrl
    │       onended → setVideoSrc(EVE_IDLE_VIDEO), avatarState "idle"
    └─► visemes[] still returned but NOT used for rendering in v3
        (kept in payload for potential future re-enable)
```

**State machine**: `EVE_IDLE_VIDEO ⇄ EVE_TALK_VIDEO`, driven purely by
`audio.onplay` / `audio.onended`. On any failure → falls back to idle video + browser TTS.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/hf/speak/route.ts` | Pipeline: Grok→TTS, returns `{reply, audioUrl, visemes}`. `__OPEN__` gets opener prompt. |
| `app/the-gym/page.tsx` | Two-state video avatar, TTS playback, chat UI. No overlay, userName="TJ". |
| `public/eve_idle.mp4` | 1.1MB — breathing/blinking waiting state (Wan2.2) |
| `public/eve_talking_loop.mp4` | 1.6MB — talking motion loop (Wan2.2) |
| `public/eve_wave_greeting.mp4` | 1.2MB — wave clip, generated but NO LONGER USED (deleted from flow) |
| `public/visemes/eve_viseme_*.png` | 6 mouth frames from v2 — unused in v3 |
| `public/eve_speaking.mp4` | PROOF: LatentSync lip-sync output (807KB) |

---

## HF Spaces

| Space | Hardware | Status | Role |
|-------|----------|--------|------|
| `AIBRUH/eve-tts` | cpu-upgrade | RUNNING | TTS + word boundaries. fn_index 0 = audio, fn_index 1 = audio + visemes JSON |
| `AIBRUH/latentsync` | A10G Small | **PAUSED** | Video+Audio → lip-synced video (66s). Not in hot path. Paused to stop GPU billing. |
| `eldmans/wan2-2-14b-i2v-480p-lightning-nsfw-diffusers` | GPU | shared | Image→video. Used to bake idle/talk/wave clips. |

**Wake latentsync when needed**: `POST /api/spaces/AIBRUH/latentsync/restart` with HF_TOKEN.

---

## Regenerating Avatar Videos (Wan2.2)

Scripts in scratchpad: `gen_idle.mjs`, `gen_wave.mjs`, `gen_speaking_loop.mjs`.

**Critical gotchas**:
- Must **upload image bytes** to the space first (`/gradio_api/upload`). Passing a
  `berylize.com` URL directly → HF servers return **503** ("Failed to download file").
  Read local `public/characters/EVE_SHIELD.png` and upload it.
- `data` array order (fn_index 0):
  `[imageData, null, prompt, steps(20), negative, duration(4), guidance(7.5), guidance2(1), seed, randomize(true), quality(6), "UniPCMultistep", flow_shift(3), frame_multiplier(16 int), safe_mode(true), video_component(true)]`
- `frame_multiplier` **must be int**. Auth header required on join, SSE, and download.

---

## eve-tts Space: fn_index Map

```
fn_index 0  →  tts_interface(text, voice, rate, pitch) → [AudioFile, warning]
fn_index 1  →  visemes_interface(...) → [AudioFile, visemes_json, warning]
               visemes_json: [{word, offsetMs, durationMs}, ...]
```
- **Voice**: `en-US-AvaNeural - en-US (Female)` — must be standard (not Multilingual),
  and pass `boundary='WordBoundary'` to edge-tts Communicate.
- AvaMultilingualNeural only emits SentenceBoundary → no per-word timing.

---

## API Keys (all in `C:\Users\tjlsu\berylllm\.env` — NEVER commit)
- `XAI_API_KEY` — Grok-3 Mini
- `HF_TOKEN` — eve-tts, latentsync, Wan2.2
- `RUNWAY_API_KEY` — **NOT used in The Gym** (no-Runway rule)
- `LIVEKIT_*` — future Clique real-time room

---

## Hard Constraints
- `pnpm` only — never npm
- Never commit `.env` / `.env.local`
- **No Runway in The Gym** — own pipeline only
- Push to BOTH: `git push origin hf-deploy` AND `git push hf hf-deploy:main`
  (HF remote = `AIBRUH/ycberyldemo`, branch mapping `hf-deploy:main`)
- Zero native binary deps in prod (native `fetch()` only)
- **Video pushes are slow (~2min)** — run `git push` in background, they do complete.

---

## What Was Attempted & Abandoned
| Approach | Why Abandoned |
|----------|---------------|
| LatentSync in hot path | 66s per response — too slow |
| Single talking loop every turn | Looks scripted/robotic |
| Viseme PNG frame-swap (v2) | Too 2D, flickery, no head/body motion |
| Wave greeting on open | Competed with idle loop = unnatural double-loop |
| AvaMultilingualNeural for visemes | No WordBoundary, only SentenceBoundary |
| xAI TTS | 403 "Team not authorized" |
| LongCat, LTX-2-3-sync | ZeroGPU file isolation bug |

---

## Next Steps / Open TODOs
1. **Reinstall overlay**: restore name-entry gate; make `userName` dynamic again (currently
   hardcoded "TJ" in `page.tsx`, was `phase` state + overlay JSX — see git history 40a63ad).
2. **Idle↔talk crossfade**: the `key={videoSrc}` remounts the `<video>` on swap → hard cut.
   Consider two stacked `<video>` elements with opacity crossfade to smooth the transition.
3. **Better lip realism**: current talk loop is generic mouth motion, not synced to actual
   words. If true lip-sync is required, revisit LatentSync (A10G, 66s) as an async
   post-process, or a real-time viseme→video model.
4. **Clique multi-agent**: expand Eve's pipeline to full Clique (CSA on separate HF Space,
   KREWE canvas orchestration, all agents active per 500%-cheaper cost model).
5. **GPU hygiene**: latentsync is PAUSED — remember to restart before any lip-sync work,
   and re-pause after.
