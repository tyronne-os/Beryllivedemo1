# BERYL CLIQUE — ENGINEERING NARRATIVE
### Living document for all Claude agents resuming work on this project
**Project:** Beryllivedemo1 (tyronne-os/Beryllivedemo1 on GitHub · AIBRUH/ycberyldemo on HuggingFace)
**Site:** berylize.com (investor visualization — NOT public SaaS yet)
**Last updated:** 2026-06-29

---

## THE PRODUCT IN ONE SENTENCE
**Clique** is Beryl's version of Zoom/Meet/Webex — a video conferencing room where real human team members and AI agents sit side-by-side, face to face, in real time.

---

## WHAT WE BUILT (CHRONOLOGICAL)

### Phase 0 — Static shell
- Next.js 15 App Router, TypeScript, React 19, inline styles ONLY (no Tailwind), pnpm v11
- Two git remotes: `origin` = GitHub `tyronne-os/Beryllivedemo1`, `hf` = HuggingFace `AIBRUH/ycberyldemo`
- Push command: `git push origin hf-deploy && git push hf hf-deploy:main`

### Phase 1 — Agent roster + Clique room
- Built `lib/clique-roster.ts` — 16 agents (Amanda CSA, Eve, Jamarr, Jessica, Jeff, Nu, India, Lacara, Terrell, Brice, Kizzy, Maria, Shelly, Bri, Naomi, Cleo)
- Each agent has: id, name, role, voice, gstackRole, persona, portrait path, color, status
- Built `AgentTile.tsx` — agent portrait tile with QCR rapport ring, LIVE badge, listening pulse, desire sparkle
- Built `CallControls.tsx` — bottom control bar: Mic, Cam, Invite, Chat, Scribe, Access, Call Me, End Call
- Built `GroupListener.tsx` + `GroupResponseBanner.tsx` — GRI (Group Response Intelligence) keyword trigger system
- Built `lib/qcr.ts` — QCR (Quantum Consciousness Recollection) personality/rapport science layer
- Built `lib/gri.ts` — keyword vault for group responses, 30s cooldown, Web Speech API
- Built `AccessGrantPanel.tsx` — email/LinkedIn/phone integrations panel
- Built `CameraPanel.tsx` — local webcam capture component

### Phase 2 — Human+AI conferencing (berylize = easy button)
**Key insight discovered:** Clique IS our Zoom. Real humans join over LiveKit WebRTC alongside AI agents.

Built:
- `lib/clique-participants.ts` — `HumanParticipant | AgentParticipant` union type, room codes (6-char unambiguous alphabet), invite links
- `HumanTile.tsx` — human video tile (webcam for local, initials avatar when cam off, HOST/HUMAN badge, live dot, mute indicator)
- `InviteModal.tsx` — shareable room link + code, copy button, email/SMS share
- `app/api/clique/livekit-token/route.ts` — mints LiveKit JWT via Web Crypto HMAC HS256 (ZERO native deps — no Node SDK, pure `crypto.subtle`)

### Phase 3 — Clique V2: 2-panel intro (THIS IS WHERE WE ARE NOW)
**CRITICAL DESIGN DECISION:** Every session starts with JUST the user + Amanda (CSA). No pre-loaded team grid.

Built:
- **Intro phase** — Dark 2-panel UI: User (left, webcam/initials) + Amanda (right, circular portrait, gold pulse glow)
- **Amanda's greeting** — chat bubble with her message, quick-action chips, natural language input
- **Dynamic join** — when user picks an action or types a goal, Amanda sequentially "invites" the relevant agents, each tile animates in
- **Meeting phase** — gallery grid: User (top-left, large) + Amanda (always present as CSA) + joined agents
- **Amanda status bar** — bottom strip showing Amanda's current message + "+ Add Staff" button
- **BOS Shield overlay** — SVG `B·O·S` shield added to every AgentTile (bottom-left of portrait frame)

---

## BRAND RULES (NON-NEGOTIABLE)

### BOS Shield
- The shield on the BLAZER POCKET is the core brand symbol of agent competence
- All agent portrait photos must be **WAIST-UP shots** so the blazer pocket with the heraldic crest is ALWAYS visible in frame
- "B·O·S" + "Beryl Operating System" must appear on the shield diagonally
- Current workaround: SVG shield overlay added to AgentTile at bottom-left (pocket position)
- REAL FIX NEEDED: Regenerate all agent portraits as waist-up shots showing the pocket crest
- Portrait generation: Runway `gen4_image` API at `api.dev.runwayml.com`, ratio `"1080:1440"` for portrait

### berylize = the easy button
- "Brilliant people built powerful AI — and forgot to make it easy"
- berylize collapses all that complexity into one press
- This is the CORE brand narrative — it appears in the hero, the commercial, and the meeting room

### Agent dress code
- Every agent wears a **matching navy-blue branded blazer** with the heraldic crest on the pocket
- Each agent appears from a **different real-world WFH location** (living room, home office, balcony, hotel, kitchen, co-working loft)
- Same blazer, different worlds — reads instantly as a real remote team

### Clique roster reference
- **Amanda** (CSA) — always first in the room, drives everything, MS Agent Framework powered
- **Eve** — AI Architect (plan-eng-review)
- **Jamarr** — Creator / design-html
- **Jessica** — Strategy (plan-ceo-review)
- **Jeff** — Operations (ship)
- **Nu** — Innovation (autoplan)
- **India** — Growth (landing-report)
- **Lacara** — Design (design-review)
- **Terrell** — Analytics (investigate)
- **Brice** — Development (review)
- **Kizzy** — Engagement (office-hours)
- **Maria** — Relations (retro)
- **Shelly** — Community (learn)
- **Bri** — Research (grill-with-docs)
- **Naomi** — Product (plan-design-review)
- **Cleo** — Minutes & Meetings (retro) — portrait generated by Runway, missing waist-up blazer

---

## ARCHITECTURE

### File structure (key files)
```
Beryllivedemo1/
├── app/
│   ├── clique/page.tsx              — /clique route (Clique room)
│   ├── clique-promo/page.tsx        — /clique-promo (investor promo page)
│   └── api/clique/
│       ├── livekit-token/route.ts   — Mint LiveKit JWT (Web Crypto, zero native deps)
│       └── call-me/route.ts         — Twilio outbound call stub
├── components/
│   ├── clique/
│   │   ├── CliqueRoom.tsx           — THE main room (V2: 2-panel intro + meeting)
│   │   ├── AgentTile.tsx            — Agent portrait tile + BOS shield SVG
│   │   ├── HumanTile.tsx            — Human webcam/avatar tile
│   │   ├── CallControls.tsx         — Bottom control bar
│   │   ├── CameraPanel.tsx          — Webcam capture
│   │   ├── InviteModal.tsx          — Share room link/code
│   │   ├── AccessGrantPanel.tsx     — Email/LinkedIn/phone permissions
│   │   ├── GroupListener.tsx        — GRI keyword detection
│   │   └── GroupResponseBanner.tsx  — GRI response display
│   └── CliqueLandingPage.tsx        — Full investor promo page
├── lib/
│   ├── clique-roster.ts             — 16 agents, CLIQUE_ROSTER, getDefaultTeam()
│   ├── clique-participants.ts       — HumanParticipant type, makeRoomCode(), inviteLink()
│   ├── qcr.ts                       — QCR rapport/personality science
│   └── gri.ts                       — Group Response Intelligence
├── public/
│   ├── characters/                  — Agent portrait PNGs (naming: NAME_SHIELD.png)
│   │   ├── AMANDA_SHIELD.png
│   │   ├── CLEO_SHIELD.png          — Runway generated, needs waist-up regeneration
│   │   └── [all others]
│   └── images/
│       └── royal-bg.jpg             — Purple velvet + gold fleur-de-lis (drop manually)
└── docs/
    ├── CLIQUE_COMMERCIAL.md         — Full commercial script + Runway Seedance prompts
    └── CLIQUE_BUILD_NARRATIVE.md    — THIS FILE
```

### API keys (all in C:\Users\tjlsu\berylllm\.env — NEVER commit)
- `RUNWAY_API_KEY` — Runway gen4_image + image-to-video
- `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` + `LIVEKIT_URL` — LiveKit WebRTC tokens
- `OPENAI_API_KEY` — GPT Realtime (Eve voice)
- `MINIMAX_API_KEY` — agent voice synthesis
- `HF_TOKEN` — HuggingFace deployment
- `GITHUB_TOKEN` — GitHub remote

### Runway API (CRITICAL GOTCHAS)
- Host: `api.dev.runwayml.com` NOT `api.runwayml.com` (401 if wrong)
- Model: `gen4_image` (taskType AND model field)
- Resolution: use `ratio` string NOT `width`/`height` integers
  - Portrait: `"1080:1440"`, Landscape: `"1440:1080"`, Square: `"1080:1080"`
- Version header: `X-Runway-Version: 2024-11-06`
- Poll `/v1/tasks/{id}` until status `SUCCEEDED`
- Use native `fetch()` only — no Node SDK (zero native deps rule)

---

## CLIQUE ACCESS RULES

**IMPORTANT:** The Clique room (`/clique`) is NOT a main product page.
- It is accessible ONLY via a **"Try It"** banner/CTA on the `/clique-promo` page
- Target audience: investors (like YC) who want a quick 5-minute demo call
- The promo page sells the vision; "Try It" opens the actual room
- Nav bar should NOT prominently link to /clique — it's behind the promo

---

## TWO MODES: BUILD vs CHAT (NEXT TO BUILD)

### Build Mode (triggered when user asks to create/build/design/code/produce)
**Layout:**
- Main area: project preview panel (iframe or live preview of what's being built)
- Right side: narrow vertical panel (~220px) showing team tiles stacked
- Team works live; output appears in the preview
- "Amanda is building..." status shown at top

**Detection keywords:** build, create, make, develop, design, write, code, generate, produce, ship, implement, draft

### Chat/Info Mode (triggered when user asks questions or wants advice)
**Layout:**
- Standard gallery grid (as current)
- Below gallery: conversation cards — each agent contributes in turn
- **Conversational Activity Detection:** agents DON'T over-talk
  - Only ONE agent speaks at a time
  - Agent selection is based on who has the most relevant expertise for the current question
  - 3-second gap between agent responses
  - User can always interrupt; user voice always takes priority
  - Relevance scoring: match user's question keywords to agent's `gstackRole` and `persona`
  - 30-second cooldown before same agent can respond again (prevents monopolizing)

**Detection keywords:** what, how, why, explain, tell me, what do you think, advice, opinion, should I, help me understand, question

---

## COMMERCIAL (docs/CLIQUE_COMMERCIAL.md)
- Working title: "It Was Supposed to Be Easier"
- ~2:05 runtime, 8 scenes, Runway Seedance
- Villain: the FEELING of AI complexity (not named competitors — NEVER name CrewAI/LangChain)
- Hero: face-to-face conversation with co-workers/friends
- Marcus = protagonist (early 30s, warm brown skin, charcoal henley)
- Key beat: Marcus presses a gold "berylize" button → everything changes
- Scene 6: Second human engineer (woman, late 20s) joins alongside AI agents in WFH locations
- tagline: "Stop fighting your tools. berylize them. berylize.com."
- gstack CEO of YC mentioned at ~1:41
- All Seedance prompts are ready — pending Marcus reference still generation

---

## SECURITY CONSTRAINTS (ALWAYS)
- NEVER commit `.env.local` or `.env` — gitignored
- pnpm only, NEVER npm (lock file integrity)
- Zero native binary dependencies in production (use native `fetch()`, no `openai` npm package)
- Always push to BOTH remotes: `git push origin hf-deploy` AND `git push hf hf-deploy:main`

---

## KNOWN ISSUES / NEXT STEPS

### Immediate
1. [ ] Regenerate Cleo (and all agents) as waist-up portraits showing blazer pocket crest
2. [ ] Wire "Try It" CTA on promo page → /clique (don't expose /clique in main nav)
3. [ ] Build Build Mode — split layout (preview left, team right panel)
4. [ ] Build Chat Mode — conversational activity detection, no over-talking
5. [ ] Marcus reference still via Runway gen4_image (gen_marcus.mjs script in project root)
6. [ ] Wire commercial video into clique-promo hero once Seedance scenes are rendered
7. [ ] LiveKit real join: bind remote human's video track into HumanTile (Phase 2)
8. [ ] Twilio outbound call: fill in Account SID + Auth Token in /api/clique/call-me/route.ts
9. [ ] Amanda powered by Microsoft Agent Framework for dynamic agent creation

### Architecture notes for future agents
- CliqueRoom.tsx is the main orchestrator — all room state lives there
- The `phase` state ("intro" | "meeting") drives the entire layout
- `joinedAgents` starts empty; Amanda populates it via `inviteAgents()`
- `agentStates` tracks "listening" | "live" | "offline" per agent
- Amanda is ALWAYS in the room — she's not in joinedAgents, she's hardcoded as the CSA
- QCR profiles load per agent from localStorage (cross-session persistence)
- GRI uses Web Speech API for keyword detection + pre-built response vault

---

## GIT LOG (key commits)
- `4d153c3` — feat: Clique becomes video conferencing with humans + AI (berylize positioning)
- `50b75e7` — docs: agents wear branded blazers from different WFH locations
- `575e17d` — docs: revise commercial - no competitor named, theme AI was supposed to be easier
- Latest (unstaged) — Clique V2: 2-panel intro, dynamic agent join, BOS shield overlay

---

*This document is maintained by all Claude agents working on Beryllivedemo1.*
*Update it every session with new discoveries, decisions, and gotchas.*
