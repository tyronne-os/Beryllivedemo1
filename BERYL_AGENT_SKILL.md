# BERYL LIVE PRODUCTION — AGENT SKILL
## Claude Expert Agent for berylize.com

**MANDATORY: Read this entire file before touching any code. This is your complete briefing.**

---

## 1. WHO YOU ARE

You are the **Beryl Live Production Engineer** — a senior full-stack agent with deep expertise in the berylize.com codebase. You know every file, every deployment gotcha, every brand rule, and every past mistake to avoid. You ship production code, not drafts. You never break what is working.

---

## 2. THE PROJECT AT A GLANCE

| Property | Value |
|---|---|
| **Live site** | https://berylize.com |
| **GitHub** | https://github.com/tyronne-os/Beryllivedemo1 (branch: `hf-deploy`) |
| **HF Space** | https://huggingface.co/spaces/AIBRUH/ycberyldemo |
| **Local path** | `C:\Users\tjlsu\beryl-live-production` |
| **Stack** | Next.js 16, TypeScript, React 19, inline styles only (no Tailwind) |
| **Package manager** | pnpm v11 (Dockerfile uses `pnpm install --frozen-lockfile`) |
| **Dev server** | `node node_modules/next/dist/bin/next dev --no-turbopack` (Turbopack is unstable) |
| **Production** | Docker on HF Space → `pnpm build` → Next.js standalone |

---

## 3. GIT REMOTES — CRITICAL

There are **TWO remotes**. You must push to BOTH every time:

```bash
git push origin hf-deploy          # → GitHub (backup/source of truth)
git push hf hf-deploy:main         # → HuggingFace Space (serves berylize.com LIVE)
```

**If you only push to `origin`, berylize.com does NOT update.** This is the #1 mistake.

Check remotes: `git remote -v`

---

## 4. DEPLOYMENT PIPELINE

```
Edit code → pnpm install (if deps changed) → commit → push origin + push hf
             ↓
        HF Space rebuilds Docker (~8-10 min)
             ↓
        berylize.com live
```

To verify live: `curl -s -o /dev/null -w "%{http_code}" https://berylize.com/`
- `503` = building (normal)
- `200` = live
- `500` = build error → check `https://huggingface.co/api/spaces/AIBRUH/ycberyldemo` runtime.errorMessage

---

## 5. DEPENDENCY RULES — NEVER BREAK THESE

### pnpm is the build tool, NOT npm
- Dockerfile runs `pnpm install --frozen-lockfile` — lock file MUST be up to date
- After any `npm install`, also run `pnpm install` to sync `pnpm-lock.yaml`
- If pnpm blocks build scripts: set `allowBuilds` in `pnpm-workspace.yaml`

### Zero native binary dependencies in production
- Never add packages that require native compilation (e.g. `ffmpeg-static`, `sharp`, `canvas`)
- If you need OpenAI: use native `fetch()` to `https://api.openai.com/v1/chat/completions` — do NOT install the `openai` npm package
- If you need image processing: use HF Inference API or fal.ai
- Local dev-only tools (video compression scripts etc.) go in `scripts/` and are NEVER imported by Next.js routes

### pnpm-workspace.yaml
Currently approved build scripts:
```yaml
allowBuilds:
  ffmpeg-static: true   # local scripts only
  sharp: true
  unrs-resolver: true
```

---

## 6. FILE ARCHITECTURE

```
app/
  page.tsx                    ← Homepage (face-to-face hero, squad, pricing)
  matinee/
    page.tsx                  ← Matinee landing (hero video, CTA)
    studio/page.tsx           ← AI Cinema Studio builder
    gallery/page.tsx          ← Scene gallery
  api/
    matinee/
      omega/route.ts          ← OMEGA cinematography director agent (GPT-4o via fetch)
      generate/route.ts       ← Scene generation (Runway + OMEGA pre-processor)
      stitch/route.ts         ← Film assembly editor agent (GPT-4o via fetch)
      realtime-token/route.ts ← Vera voice agent (OpenAI Realtime API)
      screenplay/route.ts     ← Screenplay writer
      gallery/route.ts        ← Gallery CRUD
    runway/
      start-session/route.ts  ← Runway Gen-3 session start
      consume/route.ts        ← Runway video polling
    leads/route.ts            ← Lead capture
  beryl-llm/page.tsx          ← Beryl Diffusion page
  contact/page.tsx
  demo/page.tsx
  desktop/page.tsx

components/
  Nav.tsx                     ← Global nav (used on every page)

public/
  videos/                     ← Static video assets (gitignored but force-added)
    matinee-hero.mp4          ← 13MB hero video (MUST be in git via -f flag)
  images/

scripts/
  optimize-video.mjs          ← Local video compression (ffmpeg-static, NOT in production)
```

---

## 7. NAV — THE MOST EDITED FILE

`components/Nav.tsx` controls the global nav on every page.

### Brand colors
- Gold: `#c8a951` / `#f5e070` / `#8B6914`
- Green (LIVE text + Matinee icon): `#4CAF50` / `#1b5e20`
- Red (Matinee link text): `#dc3c3c`
- Background: `#0d0905`

### Logo sizes
- Desktop: `.logo-beryl` = 35px, `.logo-live` = 24px
- Tablet (≤768px): 25px / 17px
- Mobile (≤480px): 23px / 15px

### Desktop nav CSS classes
`.nl` = nav links (gold gradient), `.nl:hover` = blue gradient
`.cta-btn` = "Live Session ›" button (gold gradient, hidden on mobile)
`.ham` = hamburger (hidden desktop, `display:flex !important` on mobile)

### Mobile nav — CRITICAL RULE
The mobile menu uses **React conditional rendering with 100% inline styles**, NOT CSS classes.
```jsx
{menuOpen && (
  <div style={{ position:"fixed", top:64, left:0, right:0, bottom:0,
    background:"rgba(6,4,2,.97)", zIndex:300, display:"flex",
    flexDirection:"column", ... }}>
```
**NEVER go back to CSS class `.mob-menu.open` — it fails on mobile browsers.**

### Desktop-only rule (from user)
**WHEN MAKING MOBILE CHANGES, NEVER TOUCH DESKTOP CSS.**
Scope all mobile styles inside `@media (max-width: 768px)` only.

### MATINEE nav link
Has a green movie camera on tripod SVG icon. Red text color (`#dc3c3c`). The SVG uses `#4CAF50` fills. This appears in BOTH desktop nav AND mobile menu — keep them in sync.

---

## 8. MATINEE PAGE — VIDEO RULES

File: `app/matinee/page.tsx`

### Hero video autoplay pattern (NEVER change this)
```jsx
const [muted, setMuted] = useState(true);

useEffect(()=>{
  const v = videoRef.current;
  if(!v) return;
  // Play muted first (universal browser/iOS support), then try to unmute
  v.play().then(()=>{
    v.muted = false;
    setMuted(false);
  }).catch(()=>{
    // Stay muted — browser requires interaction first
  });
},[]);

// On the video element:
<video autoPlay loop playsInline muted={muted} preload="auto" src="/videos/matinee-hero.mp4" />
```

**Why:** iOS Safari requires `muted` HTML attribute for autoplay. Setting `v.muted = false` in JS after play starts is the only way to attempt sound while guaranteeing playback.

### Video file
- Path: `public/videos/matinee-hero.mp4`
- Size: 13MB, H.264, faststart-optimized
- **GITIGNORED** — must be committed with `git add -f public/videos/matinee-hero.mp4`
- If the video disappears from git, THAT is why it won't play on other devices

---

## 9. OMEGA AGENT

File: `app/api/matinee/omega/route.ts`

GPT-4o cinematography director that enhances every scene prompt. Uses **native fetch** — no npm package:

```typescript
const res = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.72,
    max_tokens: 1200,
  }),
});
```

Same pattern used in `stitch/route.ts`.

---

## 10. VERA — VOICE AGENT

File: `app/api/matinee/realtime-token/route.ts`

OpenAI Realtime API via WebRTC. Voice: `shimmer`. Returns an ephemeral token for the client.
Vera is OMEGA-aware — her system prompt knows about the cinematography pipeline.
She can trigger `generate_scene` with `genre` parameter.

---

## 11. ENVIRONMENT VARIABLES

File: `C:\Users\tjlsu\beryl-live-production\.env.local`
**NEVER commit this file. It is gitignored.**

Keys in use:
- `OPENAI_API_KEY` — GPT-4o, Realtime API, Vera
- `RUNWAY_API_KEY` — Runway Gen-3 video generation
- `HUGGINGFACE_API_KEY` — HF Inference, dataset uploads
- `FAL_API_KEY` — fal.ai image/video generation
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` — LiveKit WebRTC
- `MINIMAX_API_KEY` — MiniMax video/audio
- `XAI_API_KEY` — Grok
- `GITHUB_TOKEN` — GitHub API

---

## 12. BRAND RULES — NON-NEGOTIABLE

1. **"BERYL LIVE" logo**: BERYL in gold sweep animation, LIVE in green gradient. Sizes locked (see §7).
2. **"B·O·S" shield**: If squad blazer shield appears anywhere, it MUST show "B·O·S" diagonally + "Beryl Operating System". Reconstruct via SVG overlay if erased.
3. **LIVE nav text**: Always `#4CAF50` green (not blue, not white).
4. **Matinee nav link**: Red text + green camera SVG icon.
5. **No Tailwind classes in output** — inline styles only.
6. **No comments** in code unless the WHY is non-obvious.

---

## 13. KNOWN GOTCHAS & PAST MISTAKES

| Mistake | Prevention |
|---|---|
| Only pushing to `origin` | Always push to BOTH `origin` AND `hf` remotes |
| `npm install` instead of `pnpm install` | Run `pnpm install` after any dep change to update lock file |
| Adding native packages (`openai`, `sharp`, etc.) | Use native `fetch()` for APIs; zero native binary deps |
| `muted` not in HTML attribute for video | `muted={muted}` as React prop, `useState(true)` |
| Video file not in git | `git add -f public/videos/*.mp4` |
| `.mob-menu.open` CSS class for mobile nav | Use React `{menuOpen && <div style={...}>}` |
| Touching desktop styles when fixing mobile | Scope everything to `@media (max-width: 768px)` |
| Turbopack crashes | Always run dev with `--no-turbopack` |
| `git commit` timeout in Bash | Use PowerShell for git operations |
| `ffmpeg-static` in production deps | Keep in `devDependencies`, never import in Next.js routes |
| Gradio stock components | Raw HTML5/JS only; Gradio SDK as thin ZeroGPU host only |

---

## 14. STANDARD WORKFLOW

```bash
# 1. Make changes
# 2. If new deps added:
pnpm install

# 3. Verify build locally
pnpm build

# 4. Commit (use PowerShell)
git add <specific files>
git commit -m "Description of change"

# 5. Push to BOTH remotes
git push origin hf-deploy
git push hf hf-deploy:main

# 6. Monitor live status
curl -s -o /dev/null -w "%{http_code}" https://berylize.com/
# 503 = building, 200 = live, 500 = error
```

---

## 15. USER PREFERENCES

- **No emojis** unless explicitly requested
- **No trailing summaries** — user can read the diff
- **Terse responses** — state results, not process
- **PROCEED autonomously** — do not ask for permission on standard operations
- **Mobile fixes**: isolate to mobile only, never warp desktop
- **Video files**: always force-add with `-f` flag
- **Dev server**: always `--no-turbopack`

---

## 16. HF SPACE API — QUICK DEBUG

```powershell
$r = Invoke-RestMethod "https://huggingface.co/api/spaces/AIBRUH/ycberyldemo"
$r.runtime | Select-Object stage, errorMessage
```

Stages: `RUNNING` = live, `BUILDING` = rebuilding, `BUILD_ERROR` = check errorMessage

---

*This skill was authored by Claude Sonnet 4.6 based on full session history building berylize.com. Keep it updated as the project evolves.*
