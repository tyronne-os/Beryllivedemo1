# BERYL LIVE — HANDOFF DOC
_Last updated: 2026-06-30 (user hits weekly rate limit, resumes on another account
within 10 min or by July 5)_

**Read this whole top section before touching anything.** The user has just
switched Claude accounts because of a weekly rate limit. Everything is pushed
to both remotes and typechecks clean. Do not re-derive.

---

## 🚀 WHERE TO START (next Claude, cold-boot)

1. **Read `lib/clique-agent-prompts.ts` in full.** It's the core deliverable of the
   last session. It encodes the entire Clique v1 conversation protocol — master
   prompts for Amanda / India / Jeff / Nu + the routing helpers
   (`isGroupGreeting`, `resolveResponders`, `detectAmandaHandoff`).
2. **Read this section: "Clique v1 — REMAINING WIRING"** below. That's the
   ordered task list. Start with #1 (point `CliqueRoom` at `getV1Team()`).
3. **Do NOT touch The Gym.** It's frozen and working. Its section is below for
   reference only.
4. **Commercial scripts are done** — user is shooting them himself in Runway UI.
   Don't rewrite them unless asked.
5. **User's name for personalization: TJ.** He's the founder. Address him
   directly.
6. Push pattern (do BOTH remotes every commit, video assets are slow so run in
   background):
   ```
   git push origin hf-deploy
   git push hf hf-deploy:main
   ```

---

## ⭐ ACTIVE FOCUS: CLIQUE v1 (reduced 4-member live team)

**The Gym is DONE and frozen** (see later section). Active work is Clique, which
is now feature-defined and needs frontend wiring.

### Clique v1 team — LOCKED IN
Exactly 4 members. User has provided their canonical portraits. The rest of the
scroller is **v2**, unlocked when funding + own pipeline arrive — do NOT expand
the team.

| Order | Agent | Lens | Runtime |
|---|---|---|---|
| 1 | **India** | Growth / Distribution / Reach | OpenAI Realtime (realtime-live2) |
| 2 | **Jeff** | Operations / Delivery / Release | OpenAI Realtime (realtime-live2) |
| 3 | **Nu** | Innovation / Lateral Thinker | OpenAI Realtime (realtime-live2) |
| 4 | **Amanda** | Clique Supervisor & Chief Orchestrator | **Microsoft Agent Framework** |

**Every member is first and foremost a top-tier software engineer**: min 15 yrs
FANG (Google/Meta/Amazon/Apple/Netflix/Microsoft), staff→principal level. The named
lens is what they lead with, NOT a fence — any member can own any task end-to-end.
Amanda handles the majority of any task alone and only escalates when specialist
depth or parallelism genuinely helps.

### Meeting protocol (LOCKED IN — do not renegotiate)
1. **Every meeting starts with Amanda alone.** She greets, takes the intake
   (goal / prompt / build request), mirrors back the goal in one crisp sentence,
   asks at most one clarifying question, then decides: solo vs. bring-in-team.
2. **India, Jeff, Nu are on realtime-live listening from meeting start** — silent
   and attentive from second zero. They DO NOT speak until Amanda has introduced
   them by name. If the user names them before Amanda has, they defer with a
   single word — *"Listening."* — and let Amanda drive.
3. **Canonical handoff phrase** (say the name TWICE, exactly as written):
   > *"I'm bringing in <Name> — <Name>, take this."*
   Frontends pattern-match via `detectAmandaHandoff(text)` from
   `lib/clique-agent-prompts.ts` and flip that agent's UI from silent-listening →
   active. Both em-dash and hyphen tolerated.
4. **Group greeting is the ONE exception**: "hey everyone" / "hi team" /
   "hello Clique" → ALL FOUR reply together (one short warm eager line each,
   staggered ~200ms so they don't clip). Amanda leads the working session
   immediately after. Detect via `isGroupGreeting(text)`.
5. Amanda **closes** every session with a 2–4 line summary (decisions, ownership)
   and a clean handback: *"That's yours to take from here. Ping us when you need us."*
6. Never mention OpenAI / Runway / Microsoft / Anthropic / "as an AI" — they are
   simply people on the team.

### Runtime stack
- **OpenAI Realtime (realtime-live2)** → voice I/O, computer use, listening for all
  four (Amanda's voice too — she just also runs MS Agent Framework for orchestration).
- **Runway API** → the "alive" visual state + active-listening presence for all four.
  (Runway IS allowed in Clique — the no-Runway rule is Gym-only.)
- **Microsoft Agent Framework** → Amanda's orchestration brain (tool routing,
  member-invocation, computer-use).
- **LiveKit** → the shared room. Every agent joins from meeting start so their
  Realtime session is warm before Amanda calls their name.

### Clique v1 code — what exists
| File | Status | Purpose |
|------|--------|---------|
| `lib/clique-agent-prompts.ts` | ✅ SHIPPED | Master system prompts for all 4 agents. Shared `CORE` preamble encodes conversation protocol (active-listening default, speak-only-when-named, pre-introduction silence, group-greeting override, handoff phrase, close-and-handback). Exports `CLIQUE_V1_PROMPTS`, `CLIQUE_V1_IDS`, `getAgentPrompt()`, `isGroupGreeting()`, `resolveResponders()`, `detectAmandaHandoff()`. **This is the core deliverable of the session — read it first.** |
| `lib/clique-roster.ts` | ✅ SHIPPED | Full roster + `CLIQUE_V1_TEAM_IDS = ["amanda", "india", "jeff", "nu"]` + `getV1Team()` helper. |
| `components/clique/CliqueRoom.tsx` | 🟡 EXISTS, needs rewiring | Live room UI. Currently keys off `AMANDA` from full roster + Amanda intro/join flow. Needs to (a) point at `getV1Team()`, (b) consume master prompts from `clique-agent-prompts.ts`, (c) implement `detectAmandaHandoff()` on Amanda's transcript stream. |
| `components/clique/AgentTile.tsx` | 🟡 EXISTS | Individual tile UI. Needs to accept a "silent-listening" state distinct from "listening" so pre-introduction agents render dimmed/quiet. |
| `lib/use-amanda-voice.ts` | ✅ EXISTS | Amanda's OpenAI Realtime WebRTC hook. Need equivalent hooks for India/Jeff/Nu (or a generalized `useAgentVoice(agentId)`). |
| `app/api/clique/realtime-token/route.ts` | ✅ EXISTS | Realtime session token minting. |
| `app/api/clique/livekit-token/route.ts` | ✅ EXISTS | LiveKit room token minting. |
| `app/clique/page.tsx` | 🟡 EXISTS | Landing page. May need copy update aligned with commercial docs. |

### Clique v1 — REMAINING WIRING (do these in order)
1. **Point `CliqueRoom` at `getV1Team()`**. Replace 9-member default with the 4.
2. **Feed each agent's master `system` prompt** from `clique-agent-prompts.ts` into
   its Realtime session at connect time (Amanda's session gets Amanda's prompt +
   MS Agent Framework tools; the other three get their prompts via realtime-live2).
3. **Wire `resolveResponders(text)`** into the live transcript listener so each
   incoming user utterance is routed:
   - `isGroupGreeting(text)` → fire all 4 `greeting` lines (stagger ~200ms).
   - named member(s) mentioned → only those speak.
   - else → Amanda answers/routes.
4. **Wire `detectAmandaHandoff(text)`** on Amanda's outgoing transcript. When it
   returns an agent id, flip that AgentTile from "silent-listening" → "active" so
   they can speak on their next turn.
5. **Pre-introduction silence**: India/Jeff/Nu render as active-listening (dim,
   attentive) from meeting start but their Realtime session's response is
   suppressed until step 4 flips them active. If the user names them early, they
   emit exactly the word *"Listening."* and defer.
6. **Amanda's canonical opener** on meeting start:
   *"Hey — I'm Amanda. Tell me what you're building."* Prefer this over any prior
   greeting text.
7. **Portraits**: user has re-uploaded canonical portraits for the 4. If they end
   up as new SHIELD PNGs, replace `public/characters/{AMANDA,INDIA,JEFF,NU}_SHIELD.png`
   accordingly. Do NOT retouch the other 15+ portraits — v2 concern.

### Clique v1 — DO NOT DO (explicit non-goals)
- **Do not add pre-baked video loops** to Clique. User uses own API key to power all
  four active simultaneously. No loops needed.
- Do not expand beyond the 4 members. The scroller = v2.
- Do not remove Runway from Clique. The no-Runway rule is **Gym-only**.
- Do not rename the handoff phrase. Frontend + regex + prompt all depend on the
  exact wording *"I'm bringing in X — X, take this."*

---

## 🎬 COMMERCIAL SCRIPTS (three docs, all shipped)

Three commercial scripts live in `docs/` — all pushed to both remotes.

| Doc | Runtime | Purpose | Status |
|-----|---------|---------|--------|
| `docs/CLIQUE_COMMERCIAL.md` | ~95s (8×~12s) | v1 original — villain: "complexity". **Archived**, do not use as source of truth. | archive |
| `docs/CLIQUE_COMMERCIAL_V2.md` | ~95s (8×~12s) | v2 revision — villain: **facelessness of AI agents**. Amanda's arrival is the pivot. Full production notes. | **canonical long-form** |
| `docs/CLIQUE_COMMERCIAL_40S.md` | 40s (4×10s) | **Compact sound-native Runway prompts** — one copy-paste prompt per 10s clip, in-clip narration + music + SFX described directly. Close: *"The first of its kind. Video chat with your AI agents. This is how we do AI now."* NO funding-round mention (user removed it — that info was for internal context only). | **canonical short-form / active shooting script** |

### 40s promo — the exact structure

| Seg | 0–10s | 10–20s | 20–30s | 30–40s |
|---|---|---|---|---|
| **Beat** | THE PROBLEM | THE SOLUTION | THE TEAM | THE CATEGORY |
| **Faces** | Marcus (prompt-gen'd, no ref) | Marcus + **Amanda** | Amanda + **India + Jeff + Nu** | All 4 in logo lockup |
| **Villain** | Faceless dashboards, nameless bots | — | — | — |
| **Turn** | — | Amanda: *"Hey — I'm Amanda. Tell me what you're building."* | Amanda: *"I'm bringing in India, Jeff, and Nu — team, meet him."* | Narrator: *"The first of its kind. Video chat — with your AI agents. Not prompts. Not chatbots. People. This is how we do AI now."* |
| **Transition OUT** | 0.7s cold→warm cross-dissolve | 0.5s gold-particle wipe | 0.6s slow zoom-out | hold on logo |

**Key production constraint**: user is building the video **manually in the Runway
build UI** to save credits (NOT via API). Prompts are written to be **sound-native**
— narration + music + SFX described inside the visual prompt, so Runway's audio
model generates it in-clip. No separate VO mix needed. India/Jeff/Nu/Amanda MUST
remain identifiable via the existing `*_SHIELD.png` reference stills — every
Runway prompt already flags this.

### Commercial — remaining
- User will shoot the 4 clips in Runway and stitch them. Nothing for Claude to do
  unless prompts need tweaks.
- The v2 long-form script (`CLIQUE_COMMERCIAL_V2.md`) is the source of truth for
  the fuller ~95s version if he decides to shoot that too later.

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
