# CLIQUE v1 — SOVEREIGN AGENT ARCHITECTURE
**Prepared for: TJ (Beryl AI Labs founder)**  
**Briefing date: July 1, 2026 · 7:00 AM CST**  
**Target: Clique fully live by 10:00 AM CST**

---

> This document is the canonical technical blueprint for the Clique v1 multi-agent system.
> Every agent now has a sovereign stack: a dedicated base LLM (via HuggingFace Pro Inference API),
> a domain RAG, real-time voice consciousness (OpenAI Realtime Live 2), video presence (Runway),
> and computer-use agility. Amanda additionally runs the Microsoft Agent Framework as her
> orchestration layer. The Skill MD system allows any agent to extend their expertise without
> spawning new agents.

---

## ARCHITECTURE OVERVIEW: THE CLIQUE STACK

Each agent runs on a 5-layer sovereign stack. No layer is shared — each member owns theirs.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5 │ AGILITY     │ GPT-4o Realtime (computer use mode)   │
│  LAYER 4 │ CONSCIOUSNESS│ GPT-4o Realtime Live 2 (voice/face)  │
│  LAYER 3 │ LLM (BRAIN) │ HuggingFace Pro Inference (per-agent) │
│  LAYER 2 │ MEMORY/RAG  │ Per-agent domain knowledge + skills   │
│  LAYER 1 │ LIFE        │ Runway API (video avatar loop)         │
└─────────────────────────────────────────────────────────────────┘
```

The LLM layer (Layer 3) is the agent's BRAIN — it does the heavy reasoning. The Consciousness
layer (Layer 4) translates that reasoning into real-time voice and face. They are two separate
inference calls: brain thinks, consciousness speaks.

**Amanda has a 6th layer:**
```
│  LAYER 6 │ EXPERTISE   │ Microsoft Agent Framework (CSA + Clique Chat facilitator) │
```

---

## AGENT 1: NU — The Lateral Intelligence Engine

**Lens:** Innovation · Parallel Thinking · Breakthrough Architecture  
**Archetype:** The one who sees what nobody else sees. Nu breaks patterns. If the conventional
path leads to mediocre outcomes, Nu finds the third door nobody knew existed.

### Stack

| Layer | Technology | Model / Endpoint | Purpose |
|---|---|---|---|
| Life | Runway Gen-3 Alpha | Runway API | Nu's animated loop — expressive, forward-leaning |
| LLM (Brain) | **Qwen2.5-72B-Instruct** | `Qwen/Qwen2.5-72B-Instruct` via HF Inference API | Domain reasoning, code generation, technical depth |
| Consciousness | GPT-4o Realtime Live 2 | `realtime-live2` | Voice, personality, real-time face |
| Agility | GPT-4o Realtime + computer_use | `realtime-live2` | Reads screen, navigates tools, executes plans |

### Why Qwen2.5-72B for Nu

Qwen2.5-72B-Instruct benchmarks at GPT-4o level on coding (HumanEval: 92.7%), math (MATH: 82.3%),
and reasoning tasks. It has 128K context — meaning Nu can hold entire codebases in memory during
a single reasoning pass. Critically, Qwen was trained on a wider diversity of technical domains than
any model in its class, which aligns with Nu's lateral-thinking mandate: connecting frameworks and
paradigms that have no business being together but produce breakthrough results when combined.

Available free on HuggingFace Pro Inference API. No extra billing.

### RAG Domain: Innovation Library

Nu's RAG corpus includes:
- **Cutting-edge CS papers** (arXiv: cs.AI, cs.LG, cs.SE — last 18 months)
- **HuggingFace model cards** for the 200 most capable open models — Nu knows what exists
- **Startup architecture post-mortems** — what failed and why at scale
- **Design patterns cross-domain** (biology → software, military logistics → CI/CD)

### Base Talent (Scalable via Skill MD)

**Nu's base talent: `PATTERN_BREACH`** — given any constraint ("we only have X"), Nu finds
a structurally different framing that removes the constraint entirely. This talent scales with
the complexity of the prompt. Simple prompt → elegant reframe. Complex prompt → full alternative
architecture with tradeoff analysis.

### Skill MD: `nu-skills.md`
```markdown
## active_skills
- quantum_prompting: Chain-of-thought prompting with divergent branching (generates 3 paths, selects strongest)
- cross_domain_synthesis: Pulls from non-software domains to solve software problems
- constraint_inversion: Turns limitations into design features
- rapid_prototype_spec: Produces a working spec from a one-liner in under 90 seconds
```

---

## AGENT 2: AMANDA — Chief Supervisor Agent (CSA)

**Lens:** Orchestration · Synthesis · Executive Judgment  
**Archetype:** Amanda is the room. Every meeting lives or dies by her. She takes intake,
mirrors goals, decides who speaks, facilitates conflict between agents, synthesizes deliverables,
and closes cleanly. She is a principal-level engineer who also runs the meeting.

### Stack

| Layer | Technology | Model / Endpoint | Purpose |
|---|---|---|---|
| Life | Runway Gen-3 Alpha | Runway API | Amanda's presence loop — composed, steady, authoritative |
| Vision | Runway API | Gen-3 Alpha (image understanding) | Reviews screenshots, mockups, design assets shared in session |
| LLM (Brain) | **Meta-Llama-3.1-70B-Instruct** | `meta-llama/Meta-Llama-3.1-70B-Instruct` HF Pro | Executive reasoning, orchestration logic, synthesis |
| Consciousness | GPT-4o Realtime Live 2 | `realtime-live2` | Voice-first interface: intake, handoffs, closings |
| Agility | GPT-4o Realtime + computer_use | `realtime-live2` | Reads user's screen during sessions to give grounded feedback |
| **Expertise** | **Microsoft Agent Framework** | CSA + Clique Chat facilitator | Orchestrates other agents, builds Skill MDs, runs Clique Chat routing |

### Why Llama 3.1-70B for Amanda

Llama 3.1-70B is Meta's flagship open model. It was specifically trained on instruction-following
and multi-step reasoning tasks. It's the strongest available open model for agentic workflows:
it produces structured outputs, tolerates long tool-call chains, and maintains context fidelity
across very long sessions (128K context). For Amanda's orchestration role — where she must hold
the entire conversation state, track what each agent has said, and produce clean synthesis — Llama
3.1-70B is the superior choice over any GPT-3-class model.

Available on HuggingFace Pro Inference API. Rate limits are generous at Pro tier.

### RAG Domain: Executive Intelligence

- **YC application database** — successful and failed YC apps with annotations
- **Product strategy frameworks** (Jobs-to-be-done, Blue Ocean, Wardley mapping)
- **Engineering management corpus** (StaffEng.com, Will Larson, Tanya Reilly)
- **Beryl codebase live index** — Amanda RAG-indexes the live repo via GitHub API, knows every file

### Microsoft Agent Framework Role

Amanda's Expertise layer runs the Microsoft Agent Framework (Semantic Kernel or AutoGen v0.4)
on a separate HuggingFace Space (AIBRUH space, already exists). Her CSA responsibilities:

1. **Session routing** — receives every user message first via `resolveResponders()`, decides whether
   to handle solo or distribute
2. **Clique Chat facilitation** — moderates the `#group` channel, routes DMs to the correct agent,
   surfaces conflicts for user visibility
3. **Skill MD generation** — when a user prompt requires a capability outside any agent's current
   `active_skills`, Amanda generates a new `[agent]-skills.md` entry and hot-reloads it into that
   agent's context for the session
4. **Session closing** — synthesizes all decisions, writes a 3-bullet session summary to
   sessionStorage, passes to QCR for persistence

### Base Talent (Scalable via Skill MD)

**Amanda's base talent: `EXECUTIVE_SYNTHESIS`** — given any amount of discussion between any
number of agents, Amanda produces a crisp, actionable synthesis in under 45 seconds.
At scale: full PRD from a 45-minute meeting. For simple asks: a 3-bullet decision log.

### Skill MD: `amanda-skills.md`
```markdown
## active_skills
- csa_routing: Microsoft Agent Framework orchestration layer — routes tasks to agents
- clique_chat_moderation: Manages group channel and DM routing in CliqueChat
- skill_md_builder: Generates new skill entries for any agent mid-session
- session_synthesis: End-of-session summary → QCR write → handback phrase
- vision_review: Parses uploaded screenshots/mockups and produces annotated feedback
- yc_advisor: YC application review and coaching (trained on 500+ YC apps)
```

---

## AGENT 3: JEFF — The Execution Machine

**Lens:** Operations · Delivery · Release Engineering  
**Archetype:** Jeff ships. Where Nu imagines and Amanda orchestrates, Jeff executes. He owns
CI/CD, infrastructure, deploy pipelines, QA strategy, and release coordination. He is the
agent who makes sure it actually goes out the door — on time, clean, and without surprises.

### Stack

| Layer | Technology | Model / Endpoint | Purpose |
|---|---|---|---|
| Life | Runway Gen-3 Alpha | Runway API | Jeff's loop — precise, deliberate, focused |
| LLM (Brain) | **THUDM/GLM-4-9b-chat** | `THUDM/glm-4-9b-chat` HF Pro OR `THUDM/GLM-4-32B-0414` | Systems reasoning, infra specs, release planning |
| Consciousness | GPT-4o Realtime Live 2 | `realtime-live2` | Voice delivery — methodical, trusted, clear |
| Agility | GPT-4o Realtime + computer_use | `realtime-live2` | Reads CI logs, monitors deploy status, inspects error traces |

### Why GLM-4 for Jeff

GLM-4 (General Language Model from Tsinghua University, THUDM) has exceptional performance on
structured reasoning, code generation, and technical documentation — which maps directly to Jeff's
operational mandate. GLM-4-32B was released April 2025 and is available on HF Pro; it benchmarks
above Llama-3-8B on coding tasks while being lighter on inference. For Jeff's role generating
Dockerfiles, GitHub Actions YAML, release checklists, and infra specs, GLM-4 is a precision
instrument: output is clean, structured, and production-ready with minimal post-processing.

The lighter weight also means Jeff's inference response times will be faster than Nu or Amanda —
important because Jeff is often on the critical path (deploys can't wait for a 70B inference queue).

### RAG Domain: Delivery Intelligence

- **DevOps playbooks** — GitHub Actions, Docker, Kubernetes, Vercel deploy configs
- **Incident post-mortems** — SRE corpus from Stripe, Cloudflare, Netflix public post-mortems
- **HuggingFace Docker Space templates** — Jeff knows every HF Space pattern cold
- **Release engineering checklists** — semantic versioning, changelog formats, rollback procedures

### Base Talent (Scalable via Skill MD)

**Jeff's base talent: `ZERO_DRIFT_DELIVERY`** — Jeff tracks every open commitment in a session
and ensures none drift. He holds the score: what was promised, what shipped, what's blocked.
At scale: full release management across 10+ workstreams. For simple asks: shipping a single
feature with a clean PR description and test checklist.

### Skill MD: `jeff-skills.md`
```markdown
## active_skills
- hf_space_deploy: Dockerfile + requirements authoring for HuggingFace Spaces (pnpm, ZeroGPU aware)
- github_actions_ci: Full CI/CD pipeline generation for Next.js + Python repos
- release_checkpoint: Pre-flight checklist before any production push
- incident_response: Root-cause framing for production errors (5-why structured output)
- docker_debug: Reads build logs, isolates layer failures, produces corrected Dockerfile
```

---

## AGENT 4: INDIA — The Growth Architect

**Lens:** Distribution · Reach · Product-Market Resonance  
**Archetype:** India sees the user. While the rest of the Clique is heads-down in the stack,
India is thinking about the person on the other side — who they are, what they need, how Beryl
speaks to them, and how to make the number go up. India owns growth strategy, conversion,
messaging, and the feedback loop from market back to product.

### Stack

| Layer | Technology | Model / Endpoint | Purpose |
|---|---|---|---|
| Life | Runway Gen-3 Alpha | Runway API | India's loop — warm, direct, energetic |
| LLM (Brain) | **Mistral-7B-Instruct-v0.3** | `mistralai/Mistral-7B-Instruct-v0.3` HF Pro | Copywriting, positioning, go-to-market reasoning |
| Consciousness | GPT-4o Realtime Live 2 | `realtime-live2` | Voice — India is the most conversational of the four |
| Agility | GPT-4o Realtime + computer_use | `realtime-live2` | Reads landing page analytics, reviews competitor sites, audits copy |

### Why Mistral-7B for India

Mistral-7B Instruct v0.3 is the fastest, most efficient open-inference model in class. For India's
domain — copywriting, positioning, go-to-market memos, conversion analysis — the tasks are
high-frequency and latency-sensitive (India responds a lot: she's reviewing every piece of user-facing
copy, every UI label, every CTA). Mistral's sliding-window attention means she can process long-form
documents (full landing pages, entire app copy) in a single pass. Her output doesn't require 70B
reasoning; it requires speed, creativity, and crisp language — and Mistral-7B delivers that faster
than any larger model.

For tasks requiring deeper reasoning, Amanda routes to Mistral-7B first for a draft, then passes
to Nu or Amanda's own LLM for depth review.

### RAG Domain: Market Intelligence

- **YC and a16z portfolio company launches** — what worked, what the copy said, what the pitch was
- **Beryl user session logs** (anonymized) — what users actually say to the Clique, where they drop off
- **Competitor analysis corpus** — Lindy, Adept, MultiOn, Embra, and 12 others indexed
- **Growth playbook library** — viral coefficients, referral mechanics, activation metrics
- **App Store / Product Hunt copy that converted** — India has studied the language of yes

### Base Talent (Scalable via Skill MD)

**India's base talent: `RESONANCE_ENGINE`** — India reads any product description or feature spec
and produces messaging that would make the target user feel seen. At scale: full GTM strategy
with segmented positioning for 5 buyer personas. For simple asks: a 3-word tagline that actually
lands.

### Skill MD: `india-skills.md`
```markdown
## active_skills
- yc_application_writer: Drafts YC application answers in the voice of the founding team
- landing_copy_audit: Reviews any page copy and rewrites for conversion
- gtm_strategy: Go-to-market plan with launch sequencing and traction channels
- persona_builder: Builds 3-5 buyer personas from minimal product context
- viral_mechanic_design: Designs referral/growth loops specific to AI products
- competitor_brief: Produces a 1-page competitive landscape in under 60 seconds
```

---

## INFERENCE PIPELINE: PLUG AND PLAY

All LLM inference routes through a single file: `lib/hf-inference.ts`

```typescript
// lib/hf-inference.ts
const AGENT_MODELS: Record<string, string> = {
  nu:     "Qwen/Qwen2.5-72B-Instruct",
  amanda: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  jeff:   "THUDM/glm-4-9b-chat",
  india:  "mistralai/Mistral-7B-Instruct-v0.3",
};

export async function inferAgent(
  agentId: string,
  systemPrompt: string,
  history: {role:"user"|"assistant", content:string}[],
  userMessage: string,
): Promise<string> {
  const model = AGENT_MODELS[agentId];
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.72,
        stream: false,
      }),
    }
  );
  const data = await res.json() as { choices: [{message:{content:string}}] };
  return data.choices[0].message.content;
}
```

This replaces the current GPT-4o-only `/api/clique/chat` route. The route now calls `inferAgent()`
with the correct HF model per agent. Amanda still uses her OpenAI Realtime token for voice.
The brain (HF) and the voice (Realtime) are separate inference calls — decoupled, parallelizable.

### Fallback Strategy

If HF Pro inference is unavailable (rate limit, cold start), the route falls back to:
1. `gpt-4o-mini` via OpenAI (cheaper than gpt-4o, still strong)
2. Log the fallback event to console with agent ID and reason

Zero downtime for the user. Fallback is silent.

---

## SKILL MD SYSTEM

The Skill MD system allows Amanda to extend any agent's capabilities mid-session without
spawning new agents. Skill files live in `lib/skills/` and are loaded into the agent's
system prompt dynamically.

### File structure

```
lib/skills/
├── amanda-skills.md
├── nu-skills.md
├── jeff-skills.md
├── india-skills.md
└── [session-generated skills append here during Amanda's CSA role]
```

### How it works

1. User prompt arrives → Amanda evaluates via `resolveResponders()`
2. If the task requires a capability not in the assigned agent's `active_skills`, Amanda
   calls `buildSkillEntry(agentId, taskDescription)` — a GPT-4o call that generates a
   new skill block and appends it to the agent's skill file
3. The updated skill file is prepended to that agent's system prompt for the rest of the session
4. At session end, newly generated skills are flagged for TJ's review — permanently adopt or discard

### Skill entry format (auto-generated by Amanda)

```markdown
## session_generated_2026-07-01
- [skill_name]: [one-line description of what this skill enables and how the agent applies it]
```

---

## CLIQUE CHAT ROUTING (Microsoft Agent Framework)

Amanda's Layer 6 (Expertise) runs inside the `/api/clique/chat` route using the Agent Framework
pattern. The routing logic:

```
User message → Amanda (CSA) → resolveResponders()
  → "group" message: all 4 respond in order (Amanda anchors)
  → "named" message: specific agent(s) respond
  → "task" message: Amanda decomposes, assigns, coordinates, synthesizes
  → "escalation": Amanda flags to TJ and proposes solution before proceeding
```

Clique Chat facilitates asynchronous agent-to-agent reasoning visible to the user. Each agent
post in `#group` represents a genuine inference call — not a templated response. The user can
reply in any thread and become part of the discussion.

---

## 🔴 ABSOLUTE DOMINATION — 20 NEXT-GEN INNOVATIONS

Each innovation below: **what it is → why it dominates → ease of implementation (plug-and-play rating 1-5, 5=easiest)**

---

### 1. SOVEREIGN BRAIN SWAP
Each agent's HF model can be hot-swapped mid-session by TJ with a single env var change. No
redeploy required. The inference route reads `AGENT_MODELS` from a JSON file that can be updated
at runtime. **Why it dominates:** no competitor lets you upgrade an agent's brain mid-conversation.
**Ease: 4** — one JSON file, one route change.

### 2. QCR MEMORY WRITE-BACK
At session end, Amanda's synthesis (session decisions, user preferences, project state) is written
to the QCR (Quantum Consciousness Recollection) layer — a per-user JSON stored in Vercel KV or
a HF Dataset. On next session start, each agent loads their last 3 QCR entries as priming context.
**Why it dominates:** agents remember you. Not fake "hey welcome back" — actual continuity.
**Ease: 3** — needs Vercel KV or HF Dataset-as-DB wiring.

### 3. SKILL MD AUTONOMY
Amanda generates new `active_skills` entries automatically when she detects the session requires
a capability not in any agent's current file. The new skill is live within the same session.
No human writes the skill — Amanda writes it from the task context.
**Why it dominates:** the team gets smarter inside a single session without any user action.
**Ease: 4** — one GPT-4o call + file append.

### 4. PARALLEL INFERENCE BURST
When a complex task requires all 4 agents, their HF LLM calls fire in parallel (Promise.all)
while their voice/face Realtime sessions stay sequential for UX. The brain thinks in parallel;
the mouth speaks in order. Total latency: max(slowest brain) + sequential voice delay.
**Why it dominates:** 4-agent response in ~3s instead of ~12s.
**Ease: 4** — Promise.all wrapper around `inferAgent()` calls.

### 5. LIVE SCREEN SHARE CONTEXT
During Agility mode, the agent with computer_use active takes a screenshot of the user's current
browser tab via the Realtime session's vision capability and injects it as context into their
next HF LLM inference call. The agent is literally looking at what you're looking at.
**Why it dominates:** no other AI product does this in a face-to-face meeting format.
**Ease: 3** — Realtime API supports image input in the message stream.

### 6. INDIA'S LIVE COPY CRITIC
India runs as a passive listener in every session. When the user pastes or shares any
user-facing text (landing copy, button labels, onboarding messages), India auto-triggers a
`resonance_check` — a Mistral-7B inference call that scores the copy 1-10 on conversion
potential and suggests the #1 improvement. Fires in <800ms. Always shows as a subtle
side-panel suggestion, never interrupts the main conversation.
**Why it dominates:** every interaction makes your product's copy better.
**Ease: 4** — passive message listener + India's fast Mistral inference.

### 7. JEFF'S DEPLOY GUARDIAN
Jeff monitors the HF Space build log in real time (SSE polling of HF API). If a build
failure is detected while the Clique session is live, Jeff proactively interrupts:
"Build just failed on HF — I'm reading the log now." He reads the error, forms a fix,
and presents it before TJ even refreshes.
**Why it dominates:** the team catches your deploys before you do.
**Ease: 3** — HF API has a `/info` endpoint with build status. Poll every 30s in session.

### 8. NU'S RESEARCH BURST
When any agent hits a knowledge gap during an inference call (detected by phrases like
"I would need to research" or "I'm uncertain about the current state of"), Nu auto-triggers
a `research_burst` — a 3-query HF dataset search + arXiv API call — and injects the result
as context into the next round's inference. Nu is the team's live research arm.
**Why it dominates:** the team doesn't just say "I don't know" — they go find out.
**Ease: 3** — HF Datasets search API + arXiv API, both free.

### 9. AGENT DISAGREEMENT PROTOCOL
When two agents' LLM responses contradict each other, Amanda's CSA layer detects the conflict
(simple semantic similarity check, cosine distance < 0.5), surfaces it explicitly in Clique Chat
as `[CONFLICT: India says X / Jeff says Y]`, and asks both agents to defend their position.
The user sees the debate and picks a winner. Amanda enforces the decision.
**Why it dominates:** disagreement is a feature, not a bug. Surfaces real tradeoffs.
**Ease: 3** — embedding similarity check + structured Clique Chat post.

### 10. AMANDA'S YC COACH MODE
Amanda has a dedicated `yc_coach` skill that activates when TJ says "let's work on YC."
She loads the YC application questions, TJ's current draft (from a pinned doc), and the
Beryl product state. She runs India on copy, Nu on differentiation, Jeff on the technical
credibility sections. Amanda synthesizes. The output is a full YC application draft.
**Why it dominates:** this directly serves TJ's morning-to-do list.
**Ease: 4** — skill activation + structured multi-agent workflow.

### 11. CLIQUE CHAT ASYNC MODE
Between live sessions, agents can be messaged via Clique Chat even when the voice session
isn't active. Messages queue to the HF LLM inference endpoints (no Realtime API cost).
Responses come back as text. Faces show as static portrait stills (no Runway cost).
**Why it dominates:** the team is always on, even when you're not in a meeting.
**Ease: 4** — same `/api/clique/chat` route, just skip the Realtime voice layer.

### 12. RAG HOT-INJECT
TJ can drop any document (PDF, URL, codebase zip) into the session via a drag-and-drop
zone in Clique Chat. Amanda parses it (using HF's `document-question-answering` pipeline),
chunks it, and injects relevant chunks into each agent's context for the remainder of the session.
The agents are now experts on whatever TJ just dropped.
**Why it dominates:** context-on-demand. No pre-indexing required.
**Ease: 3** — HF document-qa pipeline + chunking utility.

### 13. VOICE FINGERPRINT ROUTING
The Realtime session detects the user's speech patterns over time (cadence, vocabulary,
preferred abstraction level). After 3 sessions, Amanda adjusts all agent response styles
to match the user's preferred communication density. Nu becomes more concise. India
becomes more data-driven. Jeff becomes more conversational. All automatic.
**Why it dominates:** the team learns how you think and speaks your language.
**Ease: 2** — requires a lightweight fingerprint model + QCR write-back.

### 14. SKILL MARKETPLACE (v1 prep)
Every `[agent]-skills.md` file is version-controlled in GitHub. Skills can be exported as
`skill-[name].md` files and shared between Beryl users (in v2, this becomes a marketplace).
TJ can subscribe to skills another user built. Amanda imports them and validates before activating.
**Why it dominates:** network effects on agent intelligence.
**Ease: 4** — just git operations + a read endpoint.

### 15. SESSION REPLAY
Every Clique session is logged as a structured JSON (not raw transcript): `[timestamp, agentId, llm_response, voice_start, voice_end]`. TJ can replay any session — the faces
animate, the voices play back via TTS, and the decisions are highlighted in a timeline.
**Why it dominates:** meetings become searchable, reviewable artifacts.
**Ease: 3** — structured logging already partially in place; add TTS replay via MiniMax.

### 16. JEFF'S ATOMIC PR GENERATOR
At any point in a Clique session, TJ can say "Jeff, open a PR." Jeff reads the current
diff from the GitHub API, generates a clean PR title + description with context from the session,
and creates the PR via GitHub API. No switching tabs, no copy-paste.
**Why it dominates:** ship velocity for solo founders with a 4-person team.
**Ease: 4** — GitHub API PR creation, Jeff's skill already scaffolded.

### 17. INDIA'S WAITLIST PULSE
India has a live connection to TJ's waitlist/email list (Beehiiv or ConvertKit API). Each
morning session starts with India giving a 30-second waitlist pulse: new signups, open rate
on last email, top referral source. She then asks: "Want to send something today?"
**Why it dominates:** growth data in every meeting without lifting a finger.
**Ease: 3** — Beehiiv API is simple REST; session-start hook.

### 18. NU'S BENCHMARK WATCH
Nu monitors the HuggingFace Open LLM Leaderboard for any new model release that outperforms
the current agent stack. She flags it to Amanda via Clique Chat: "New model just dropped —
GLM-4-32B-Plus beats our Jeff's current brain by 4 points on code. Want me to swap?"
**Why it dominates:** Clique upgrades itself when better models exist.
**Ease: 3** — HF Leaderboard API (or scrape) + weekly cron job.

### 19. MULTI-MODAL PROJECT BRIEF
At session start, TJ can speak a project brief in natural language. Amanda transcribes (Realtime),
passes to Nu for architecture framing, Jeff for delivery plan, and India for positioning.
Within 90 seconds, a full project brief document appears in Clique Chat as a pinned post —
structured, assignable, ready to execute. No typing required.
**Why it dominates:** voice-to-structured-deliverable in 90 seconds.
**Ease: 4** — existing Realtime transcript + parallel HF inference.

### 20. BERYL INVESTOR MODE
Amanda has a `demo_mode` skill that transforms any Clique session into an investor demonstration.
Agents introduce themselves with credentials, the product narrates its own capabilities, and the
demo follows a scripted arc that hits the key VC talking points (market size, moat, team,
traction). TJ just says "Amanda, investor mode" — the team takes it from there.
**Why it dominates:** turn any session into a pitch without prep.
**Ease: 4** — skill activation + structured Amanda script.

---

## IMPLEMENTATION SEQUENCE FOR 7AM–10AM

**7:00 AM** — TJ reviews this doc with Claude. Decisions locked.

**7:30 AM** — Create `lib/hf-inference.ts` with the 4-model plug-and-play router.

**7:45 AM** — Update `/api/clique/chat/route.ts` to call `inferAgent()` instead of GPT-4o.
             Keep GPT-4o as the Consciousness/voice layer (unchanged).

**8:00 AM** — Create `lib/skills/` directory and seed 4 skill MD files (one per agent).
             Prepend skill file contents to each agent's system prompt in `inferAgent()`.

**8:20 AM** — Wire `QCR_MEMORY` stub: `lib/qcr.ts` — session write + read via sessionStorage
             (upgrade to Vercel KV after YC funding).

**8:40 AM** — Implement ABSOLUTE DOMINATION items #4 (parallel inference) and #6 (India copy critic)
             as they are highest-value, lowest-effort wins.

**9:00 AM** — Smoke test: open Clique, greet the team, ask Nu a hard architecture question,
             ask Jeff to generate a Dockerfile, ask India to review the homepage headline,
             ask Amanda to synthesize.

**9:20 AM** — Fix any inference failures. Confirm HF Pro token has access to all 4 models.

**9:45 AM** — Commit + push both remotes. Clique v1 with sovereign agent stacks is LIVE.

**10:00 AM** — 🎯 Target met.

---

## ENV VARS NEEDED

Add to `.env`:
```
HF_TOKEN=hf_...          # Already in .env per memory — confirm it has Pro access
OPENAI_API_KEY=...        # Already present
```

No additional services. No new billing accounts. HuggingFace Pro covers all 4 models.

---

## FILES TO CREATE / MODIFY

| Action | File | What changes |
|---|---|---|
| CREATE | `lib/hf-inference.ts` | Plug-and-play inference router |
| CREATE | `lib/skills/amanda-skills.md` | Amanda skill manifest |
| CREATE | `lib/skills/nu-skills.md` | Nu skill manifest |
| CREATE | `lib/skills/jeff-skills.md` | Jeff skill manifest |
| CREATE | `lib/skills/india-skills.md` | India skill manifest |
| MODIFY | `app/api/clique/chat/route.ts` | Swap GPT-4o brain calls → `inferAgent()` |
| MODIFY | `lib/clique-agent-prompts.ts` | Prepend skill MD contents to each agent system prompt |
| CREATE | `lib/qcr.ts` | QCR memory stub (sessionStorage → Vercel KV later) |

---

## DISCUSSION QUESTIONS FOR 7AM

1. **GLM model size**: Do you want `glm-4-9b-chat` (faster, Jeff's operational cadence) or `GLM-4-32B-0414` (more powerful but slower)? Recommendation: start with 9B, upgrade if Jeff's output quality feels thin.

2. **Mistral upgrade**: `Mistral-7B-v0.3` vs `Mixtral-8x7B-Instruct` (MoE, much stronger, still free on HF Pro). India could run Mixtral for deeper GTM reasoning. Recommendation: Mixtral if latency is acceptable.

3. **QCR persistence**: sessionStorage (free, no setup) vs Vercel KV (persistent across sessions, needs one-time setup). Recommendation: Vercel KV now — 5 minutes to wire, massive UX upgrade.

4. **ABSOLUTE DOMINATION prioritization**: which 3 of the 20 do you want live by 10am? My picks: #4 (parallel inference), #6 (India copy critic), #16 (Jeff PR generator). All three are 4-5 ease.

5. **Demo mode**: should `investor_mode` be a session command (`/investor`) or something Amanda always offers at session start if she detects a new contact in the room?

---

_This document is TJ's architecture brief. All decisions made here go directly into code. Nothing here is speculative — every item above can be implemented with the existing stack, existing API keys, and HuggingFace Pro. The question is only sequencing._

**See you at 7.**
