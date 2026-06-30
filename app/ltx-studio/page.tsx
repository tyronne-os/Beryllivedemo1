"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Nav from "@/components/Nav";
import { CLIQUE_ROSTER } from "@/lib/clique-roster";

// ── Admin config type ─────────────────────────────────────────────────────────
interface LTXAdmin {
  guidanceScale: number;
  numSteps: number;
  stgScale: number;
  stgRescale: number;
  stgSkipLayers: string;
  imageCondNoise: number;
  fps: number;
  width: number;
  height: number;
  numFrames: number;
  promptPrefix: string;
  negativePrompt: string;
  guardrailsOff: boolean;
  customInstruction: string;
}

const DEFAULT_ADMIN: LTXAdmin = {
  guidanceScale: 3.5,
  numSteps: 50,
  stgScale: 1.0,
  stgRescale: 0.7,
  stgSkipLayers: "[19, 20]",
  imageCondNoise: 0.15,
  fps: 24,
  width: 480,
  height: 832,
  numFrames: 257,
  promptPrefix: "photorealistic cinematic portrait, ARRI Alexa 35 cinema camera, Leica Summilux 75mm f/1.4 at f/2.0, natural window diffused light, real human skin texture with subtle visible pores, genuine hair strand detail, authentic micro-expressions, natural eye moisture and corneal reflections, soft organic breathing movement, true-to-life skin subsurface scattering, filmic color science, no artificial smoothing, ",
  negativePrompt: "anime, cartoon, painting, illustration, 3D render, CGI, digital art, artificial, plastic skin, wax figure, mannequin, smooth synthetic skin, uncanny valley, deformed face, distorted features, extra fingers, bad anatomy, unrealistic proportions, watermark, text, logo, blurry, low quality, compression artifacts, oversaturated, overexposed, heavily film grained, flickering, temporal jitter, AI art style, robot features, alien, doll-like, flat studio lighting, motion blur overload, unstable head position, eye drift, unnatural blinking, smooth featureless skin, airbrushed, beauty filter, instagram filter",
  guardrailsOff: false,
  customInstruction: "",
};

const ADMIN_KEY = "ltx-admin-v1";
function loadAdmin(): LTXAdmin {
  try { return { ...DEFAULT_ADMIN, ...JSON.parse(localStorage.getItem(ADMIN_KEY) ?? "{}") }; }
  catch { return DEFAULT_ADMIN; }
}
function saveAdmin(cfg: LTXAdmin) {
  try { localStorage.setItem(ADMIN_KEY, JSON.stringify(cfg)); } catch {}
}

// ── Batch / HITL Types ────────────────────────────────────────────────────────
interface BatchJob {
  id: string;
  agentId: string;
  agentName: string;
  portraitUrl: string;
  mood: string;
  variant: number;
  prompt: string;
  negativePrompt: string;
  status: "pending" | "generating" | "awaiting_approval" | "approved" | "complete" | "failed" | "skipped";
  videoUrl?: string;
  seed?: number;
}

interface ApprovalPair {
  jobs: [BatchJob, BatchJob];
  pairIndex: number; // 0-based; first 3 pairs (0,1,2) require human approval
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryClip {
  id: string;
  videoUrl: string;
  mood: string;
  agentId?: string;
  agentName?: string;
  prompt: string;
  createdAt: string;
  resolution: string;
  seed: number;
}

const MOODS = [
  { id: "listen",  label: "Listen",  icon: "👂", desc: "Attentive, breathing, soft blinks" },
  { id: "speak",   label: "Speak",   icon: "🗣️", desc: "Talking, expressive, animated" },
  { id: "nod",     label: "Nod",     icon: "✅", desc: "Affirming, confident head nods" },
  { id: "react",   label: "React",   icon: "😮", desc: "Surprise, authentic emotion" },
  { id: "wave",    label: "Wave",    icon: "👋", desc: "Friendly greeting, warm smile" },
  { id: "think",   label: "Think",   icon: "🤔", desc: "Contemplative, thoughtful pause" },
];

const LILLY_AGENTS = CLIQUE_ROSTER.map(a => ({
  id: a.id,
  name: a.name,
  portrait: a.portrait,
}));

const GALLERY_KEY = "ltx-gallery-v1";

function loadGallery(): GalleryClip[] {
  try {
    return JSON.parse(localStorage.getItem(GALLERY_KEY) ?? "[]");
  } catch { return []; }
}
function saveGallery(clips: GalleryClip[]) {
  try { localStorage.setItem(GALLERY_KEY, JSON.stringify(clips)); } catch {}
}

// ── Client-side video stitch via Canvas + MediaRecorder ───────────────────────
async function stitchToBlob(
  clips: GalleryClip[],
  onProgress: (p: number) => void,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 480; canvas.height = 832;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(24);

  const mimeType = MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise(async (resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = reject;
    recorder.start(100);

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      onProgress(Math.round((i / clips.length) * 90));

      const video = document.createElement("video");
      video.src = clip.videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 832;
          res();
        };
        video.onerror = rej;
        video.load();
      });

      await new Promise<void>(res => {
        video.onended = () => res();
        video.play();
        const draw = () => {
          if (video.ended || video.paused) { res(); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(draw);
        };
        draw();
      });
    }

    onProgress(98);
    recorder.stop();
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LTXStudio() {
  const [imageUrl,     setImageUrl]     = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [mood,         setMood]         = useState("listen");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating,   setGenerating]   = useState(false);
  const [genStatus,    setGenStatus]    = useState("");
  const [gallery,      setGallery]      = useState<GalleryClip[]>([]);
  const [stitchMode,   setStitchMode]   = useState(false);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [stitching,    setStitching]    = useState(false);
  const [stitchPct,    setStitchPct]    = useState(0);
  const [stitchedClip, setStitchedClip] = useState<GalleryClip | null>(null);
  const [preview,      setPreview]      = useState<GalleryClip | null>(null);
  const [adminOpen,       setAdminOpen]       = useState(false);
  const [admin,           setAdmin]           = useState<LTXAdmin>(DEFAULT_ADMIN);
  const [adminSaved,      setAdminSaved]      = useState(false);
  const [negativeOverride, setNegativeOverride] = useState("");
  const [durationSec,     setDurationSec]     = useState(10.7);

  // ── Batch / HITL state ───────────────────────────────────────────────────
  const [batchOpen,        setBatchOpen]        = useState(false);
  const [batchAgents,      setBatchAgents]      = useState<string[]>([]);
  const [batchClipsEach,   setBatchClipsEach]   = useState(20);
  const [batchRunning,     setBatchRunning]      = useState(false);
  const [batchJobs,        setBatchJobs]        = useState<BatchJob[]>([]);
  const [batchDone,        setBatchDone]        = useState(0);
  const [batchTotal,       setBatchTotal]       = useState(0);
  const [approvalPair,     setApprovalPair]     = useState<ApprovalPair | null>(null);
  const [approvedPairs,    setApprovedPairs]    = useState(0);
  const [editingPrompt,    setEditingPrompt]    = useState("");
  const [editingNeg,       setEditingNeg]       = useState("");
  const approvalResolve    = useRef<((approved: boolean) => void) | null>(null);
  const batchAbort         = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Convert slider seconds → valid LTX frame count (must be 8N+1)
  const secToFrames = (s: number) => Math.round((s * 24 - 1) / 8) * 8 + 1;
  const framesToSec = (f: number) => (f / 24).toFixed(1);

  useEffect(() => {
    setGallery(loadGallery());
    const saved = loadAdmin();
    setAdmin(saved);
    setDurationSec(parseFloat((saved.numFrames / 24).toFixed(1)));
  }, []);

  const updateAdmin = useCallback((patch: Partial<LTXAdmin>) => {
    setAdmin(prev => ({ ...prev, ...patch }));
  }, []);

  const saveAdminCfg = useCallback(() => {
    saveAdmin(admin);
    setAdminSaved(true);
    setTimeout(() => setAdminSaved(false), 2000);
  }, [admin]);

  // Pick agent → auto-fill portrait
  const pickAgent = useCallback((agentId: string) => {
    const agent = LILLY_AGENTS.find(a => a.id === agentId);
    if (!agent) return;
    setSelectedAgent(agentId);
    setImageUrl(agent.portrait);
    setImagePreview(agent.portrait);
  }, []);

  // Upload portrait file
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const data = e.target?.result as string;
      setImagePreview(data);
      setImageUrl(data);
      setSelectedAgent("");
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Batch: generate a single job via API ─────────────────────────────────
  const runBatchJob = useCallback(async (job: BatchJob): Promise<string | null> => {
    const res = await fetch("/api/ltx/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: job.portraitUrl,
        prompt: job.prompt,
        mood: job.mood,
        agentId: job.agentId,
        agentName: job.agentName,
        seed: -1,
        negativeOverride: job.negativePrompt,
        adminOverride: { ...admin },
      }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d.videoUrl ?? null;
  }, [admin]);

  // ── Batch: wait for human approval of a pair ─────────────────────────────
  const waitForApproval = useCallback((pair: ApprovalPair): Promise<boolean> => {
    return new Promise(resolve => {
      setApprovalPair(pair);
      setEditingPrompt(pair.jobs[0].prompt);
      setEditingNeg(pair.jobs[0].negativePrompt);
      approvalResolve.current = resolve;
    });
  }, []);

  // ── Batch: main runner ───────────────────────────────────────────────────
  const runBatch = useCallback(async () => {
    if (batchAgents.length === 0) return;
    batchAbort.current = false;
    setBatchRunning(true);
    setApprovedPairs(0);

    // Build job list: agents × moods × variants
    const moodList = MOODS.map(m => m.id);
    const jobs: BatchJob[] = [];
    let variant = 0;
    for (const agentId of batchAgents) {
      const agent = LILLY_AGENTS.find(a => a.id === agentId)!;
      for (let i = 0; i < batchClipsEach; i++) {
        const mood = moodList[i % moodList.length];
        jobs.push({
          id: `batch-${agentId}-${i}`,
          agentId,
          agentName: agent.name,
          portraitUrl: agent.portrait,
          mood,
          variant: i + 1,
          prompt: customPrompt,
          negativePrompt: negativeOverride,
          status: "pending",
        });
        variant++;
      }
    }

    const total = jobs.length;
    setBatchJobs([...jobs]);
    setBatchTotal(total);
    setBatchDone(0);

    let currentPrompt = customPrompt;
    let currentNeg = negativeOverride;
    let pairIdx = 0;
    let done = 0;

    // Process in pairs
    for (let i = 0; i < jobs.length; i += 2) {
      if (batchAbort.current) break;

      const jobA = { ...jobs[i], prompt: currentPrompt, negativePrompt: currentNeg, status: "generating" as const };
      const jobB = jobs[i + 1] ? { ...jobs[i + 1], prompt: currentPrompt, negativePrompt: currentNeg, status: "generating" as const } : null;

      // Update UI to show generating
      setBatchJobs(prev => prev.map((j, idx) =>
        idx === i || idx === i + 1 ? { ...j, status: "generating", prompt: currentPrompt } : j
      ));

      // Generate both in parallel
      const [urlA, urlB] = await Promise.all([
        runBatchJob(jobA),
        jobB ? runBatchJob(jobB) : Promise.resolve(null),
      ]);

      jobA.videoUrl = urlA ?? undefined;
      jobA.status = urlA ? "awaiting_approval" : "failed";
      if (jobB) { jobB.videoUrl = urlB ?? undefined; jobB.status = urlB ? "awaiting_approval" : "failed"; }

      setBatchJobs(prev => prev.map((j, idx) =>
        idx === i ? { ...j, ...jobA } : idx === i + 1 && jobB ? { ...j, ...jobB } : j
      ));

      // First 3 pairs → human approval gate
      if (pairIdx < 3 && (urlA || urlB)) {
        const pair: ApprovalPair = { jobs: [jobA, jobB ?? jobA], pairIndex: pairIdx };
        const approved = await waitForApproval(pair);

        if (!approved) {
          // User edited prompt — re-run this pair
          currentPrompt = editingPrompt;
          currentNeg = editingNeg;
          i -= 2; // repeat this pair with new prompt
          setApprovalPair(null);
          continue;
        }
        setApprovedPairs(p => p + 1);
        setApprovalPair(null);
      }

      // Save completed clips to gallery
      [jobA, jobB].forEach(job => {
        if (!job?.videoUrl) return;
        const clip: GalleryClip = {
          id: `ltx-${Date.now()}-${Math.random()}`,
          videoUrl: job.videoUrl,
          mood: job.mood,
          agentId: job.agentId,
          agentName: job.agentName,
          prompt: job.prompt,
          createdAt: new Date().toISOString(),
          resolution: `${admin.width}×${admin.height}`,
          seed: job.seed ?? 0,
        };
        setGallery(prev => {
          const next = [clip, ...prev];
          try { localStorage.setItem(GALLERY_KEY, JSON.stringify(next.slice(0, 200))); } catch {}
          return next;
        });
      });

      done += jobB ? 2 : 1;
      setBatchDone(done);
      setBatchJobs(prev => prev.map((j, idx) =>
        idx === i ? { ...j, status: "complete" } : idx === i + 1 && jobB ? { ...j, status: "complete" } : j
      ));
      pairIdx++;
    }

    setBatchRunning(false);
  }, [batchAgents, batchClipsEach, customPrompt, negativeOverride, admin, runBatchJob, waitForApproval, editingPrompt, editingNeg]);


  // Generate
  const generate = useCallback(async () => {
    if (!imageUrl) {
      setGenStatus("⚠ STEP 1 REQUIRED — Select a Clique member below or upload a portrait on the left before generating");
      return;
    }
    setGenerating(true);
    setGenStatus("◉ Joining Wan2.2 queue… (may take 1-3 min)");

    try {
      const res = await fetch("/api/ltx/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          mood,
          prompt: customPrompt,
          agentId: selectedAgent || undefined,
          agentName: LILLY_AGENTS.find(a => a.id === selectedAgent)?.name,
          negativeOverride: negativeOverride.trim() || undefined,
          // Admin overrides — sent raw, API uses these directly
          adminOverride: {
            guidanceScale:   admin.guidanceScale,
            numSteps:        admin.numSteps,
            stgScale:        admin.stgScale,
            stgRescale:      admin.stgRescale,
            stgSkipLayers:   admin.stgSkipLayers,
            imageCondNoise:  admin.imageCondNoise,
            fps:             admin.fps,
            width:           admin.width,
            height:          admin.height,
            numFrames:       admin.numFrames,
            promptPrefix:    admin.guardrailsOff ? "" : admin.promptPrefix,
            negativePrompt:  admin.guardrailsOff ? "" : admin.negativePrompt,
            customInstruction: admin.customInstruction,
            guardrailsOff:   admin.guardrailsOff,
          },
        }),
      });

      if (res.status === 202) {
        const d202 = await res.json().catch(() => ({}));
        const wait = (d202.retryAfter ?? 30) * 1000;
        setGenStatus(`◉ Wan2.2 Space waking up — retrying in ${wait/1000}s…`);
        await new Promise(r => setTimeout(r, wait));
        setGenerating(false);
        generate();
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setGenStatus(`Error: ${err.error ?? "generation failed"}`);
        setGenerating(false);
        return;
      }

      const data = await res.json();
      const clip: GalleryClip = {
        id: `ltx-${Date.now()}`,
        videoUrl: data.videoUrl,
        mood: data.mood,
        agentId: data.agentId,
        agentName: data.agentName,
        prompt: data.prompt,
        createdAt: new Date().toISOString(),
        resolution: data.resolution,
        seed: data.seed,
      };

      setGallery(prev => {
        const next = [clip, ...prev];
        saveGallery(next);
        return next;
      });
      setGenStatus("✓ Done — clip added to gallery");
    } catch (e) {
      setGenStatus(`Error: ${String(e)}`);
    }
    setGenerating(false);
  }, [imageUrl, mood, customPrompt, selectedAgent]);

  // Stitch selected clips
  const doStitch = useCallback(async () => {
    const toStitch = gallery.filter(c => selected.has(c.id));
    if (toStitch.length < 2) return;
    setStitching(true);
    setStitchPct(0);

    try {
      const blob = await stitchToBlob(toStitch, setStitchPct);
      const url = URL.createObjectURL(blob);
      const clip: GalleryClip = {
        id: `stitch-${Date.now()}`,
        videoUrl: url,
        mood: "stitch",
        agentName: `${toStitch.length}-clip stitch`,
        prompt: toStitch.map(c => c.mood).join(" → "),
        createdAt: new Date().toISOString(),
        resolution: toStitch[0]?.resolution ?? "480×832",
        seed: 0,
      };
      setStitchedClip(clip);
      setGallery(prev => {
        const next = [clip, ...prev];
        saveGallery(next);
        return next;
      });
      setSelected(new Set());
      setStitchMode(false);
    } catch (e) {
      alert(`Stitch failed: ${String(e)}`);
    }
    setStitching(false);
    setStitchPct(100);
  }, [gallery, selected]);

  const downloadClip = useCallback((clip: GalleryClip) => {
    const a = document.createElement("a");
    a.href = clip.videoUrl;
    a.download = `ltx-${clip.agentId ?? "clip"}-${clip.mood}-${clip.id.slice(-6)}.mp4`;
    a.click();
  }, []);

  const sendToCLS = useCallback((clip: GalleryClip) => {
    const agentId = clip.agentId;
    if (!agentId) { alert("No agent linked to this clip — assign an agent before sending to CLS vault."); return; }
    const hfPath = `avatars/${agentId}/cls_${clip.mood}.mp4`;
    navigator.clipboard.writeText(hfPath).catch(() => {});
    alert(`CLS path copied: ${hfPath}\n\nUpload to: huggingface.co/datasets/AIBRUH/beryl-clique-lake`);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const orderedSelected = gallery.filter(c => selected.has(c.id));

  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&family=Roboto+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#06080d;overflow-x:hidden;}

        @keyframes gold-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes ltx-pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes stitch-glow{0%,100%{box-shadow:0 0 12px rgba(200,169,81,.3)}50%{box-shadow:0 0 28px rgba(200,169,81,.7)}}

        .ltx-card{
          border:1px solid rgba(200,169,81,.12);background:rgba(255,255,255,.02);
          transition:border-color .2s,background .2s;animation:fade-in .3s ease;
        }
        .ltx-card:hover{border-color:rgba(200,169,81,.35);background:rgba(200,169,81,.04);}
        .ltx-card.selected{border-color:#c8a951;background:rgba(200,169,81,.08);animation:stitch-glow 1.5s ease-in-out infinite;}

        .mood-btn{
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;
          padding:8px 12px;cursor:pointer;border:1px solid rgba(200,169,81,.15);
          background:transparent;color:rgba(232,220,200,.45);transition:all .2s;
        }
        .mood-btn.active{border-color:#c8a951;background:rgba(200,169,81,.1);color:#c8a951;}
        .mood-btn:hover:not(.active){border-color:rgba(200,169,81,.4);color:rgba(232,220,200,.8);}

        .agent-chip{
          font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;text-transform:uppercase;
          padding:5px 10px;cursor:pointer;border:1px solid rgba(255,255,255,.08);
          background:transparent;color:rgba(232,220,200,.35);transition:all .2s;
          display:inline-flex;align-items:center;gap:5px;
        }
        .agent-chip.active{border-color:#c8a951;background:rgba(200,169,81,.08);color:#c8a951;}
        .agent-chip:hover:not(.active){border-color:rgba(200,169,81,.3);color:rgba(232,220,200,.7);}

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(200,169,81,.3);border-radius:2px}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#06080d", paddingBottom: 80 }}>

        {/* ── HEADER ── */}
        <div style={{
          borderBottom: "1px solid rgba(200,169,81,.15)",
          background: "rgba(6,8,13,.97)", backdropFilter: "blur(20px)",
          padding: "12px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 64, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              fontFamily: "'Cinzel Decorative',serif", fontSize: 15, fontWeight: 900,
              background: "linear-gradient(135deg,#6b3fa0,#a855f7,#e0c3ff,#a855f7,#6b3fa0)",
              backgroundSize: "300% auto", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "gold-shimmer 3s linear infinite",
            }}>LTX STUDIO</div>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(232,220,200,.4)", textTransform: "uppercase" }}>
              Wan2.2 · Max Human Realism · CLS Vault Builder
            </div>
            <div style={{
              padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(168,85,247,.3)",
              background: "rgba(168,85,247,.06)", display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 8, color: "#a855f7", animation: "ltx-pulse 2s ease-in-out infinite" }}>◉</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#a855f7", textTransform: "uppercase" }}>STG ACTIVE</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

            {/* ── DURATION SLIDER ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "rgba(200,169,81,.6)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Duration
              </div>
              <input
                type="range"
                min={1}
                max={10.7}
                step={0.1}
                value={durationSec}
                onChange={e => {
                  const s = parseFloat(e.target.value);
                  setDurationSec(s);
                  const frames = secToFrames(s);
                  updateAdmin({ numFrames: frames });
                }}
                style={{
                  width: 120, accentColor: "#a855f7", cursor: "pointer",
                  height: 3, background: "rgba(255,255,255,.1)",
                }}
              />
              <div style={{
                fontFamily: "'Roboto Mono',monospace", fontSize: 10, fontWeight: 700,
                color: "#a855f7", minWidth: 40, textAlign: "right",
              }}>
                {durationSec.toFixed(1)}s
              </div>
            </div>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.08)" }} />

            {/* Admin icon */}
            <button
              onClick={() => setAdminOpen(o => !o)}
              title="LTX Model Admin"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: adminOpen ? "rgba(168,85,247,.2)" : "rgba(255,255,255,.04)",
                border: `1px solid ${adminOpen ? "rgba(168,85,247,.6)" : "rgba(255,255,255,.1)"}`,
                color: adminOpen ? "#a855f7" : "rgba(232,220,200,.4)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, transition: "all .2s",
                boxShadow: adminOpen ? "0 0 12px rgba(168,85,247,.3)" : "none",
              }}
            >⚙</button>
            {stitchMode && selected.size >= 2 && (
              <button onClick={doStitch} disabled={stitching} style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                padding: "8px 20px",
                background: stitching ? "#333" : "linear-gradient(135deg,#4a1a8a,#a855f7)",
                color: stitching ? "#666" : "#fff", border: "none", cursor: stitching ? "default" : "pointer",
              }}>
                {stitching ? `◉ Stitching ${stitchPct}%…` : `⊞ Combine ${selected.size} Clips`}
              </button>
            )}
            <button onClick={() => { setStitchMode(s => !s); setSelected(new Set()); }} style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
              padding: "8px 16px",
              background: stitchMode ? "rgba(200,169,81,.15)" : "transparent",
              border: `1px solid ${stitchMode ? "#c8a951" : "rgba(200,169,81,.25)"}`,
              color: stitchMode ? "#c8a951" : "rgba(232,220,200,.5)", cursor: "pointer",
            }}>
              {stitchMode ? "✕ Cancel Stitch" : "⊞ Stitch Mode"}
            </button>
            <button onClick={() => setBatchOpen(o => !o)} style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
              padding: "8px 16px",
              background: batchOpen ? "rgba(74,26,138,.3)" : "transparent",
              border: `1px solid ${batchOpen ? "#a855f7" : "rgba(168,85,247,.35)"}`,
              color: batchOpen ? "#a855f7" : "rgba(168,85,247,.7)", cursor: "pointer",
            }}>
              ⚡ Batch CLS
            </button>
            <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "rgba(232,220,200,.25)" }}>
              {gallery.length} clip{gallery.length !== 1 ? "s" : ""} in vault
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>

          {/* ── CONTROL PANEL ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "300px 1fr",
            gap: 20, marginBottom: 36,
          }}>

            {/* LEFT — Portrait */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {!imageUrl && (
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
                    background: "linear-gradient(90deg,#c8a951,#f0d060)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    animation: "ltx-pulse 1.5s ease-in-out infinite",
                    fontWeight: 700,
                  }}>STEP 1</div>
                )}
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: imageUrl ? "rgba(200,169,81,.6)" : "#c8a951", textTransform: "uppercase" }}>
                  Reference Portrait
                </div>
                {imageUrl && <div style={{ fontSize: 10, color: "#4ade80" }}>✓</div>}
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={e => e.preventDefault()}
                style={{
                  width: "100%", aspectRatio: "9/16",
                  border: imageUrl ? "1px dashed rgba(200,169,81,.3)" : "1px dashed rgba(200,169,81,.7)",
                  background: imageUrl ? "rgba(255,255,255,.02)" : "rgba(200,169,81,.04)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden", marginBottom: 12,
                  transition: "all .2s",
                  boxShadow: imageUrl ? "none" : "0 0 20px rgba(200,169,81,.12)",
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="portrait" style={{
                    width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
                  }} />
                ) : (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <div style={{ fontSize: 36, marginBottom: 10, opacity: .6, animation: "ltx-pulse 1.5s ease-in-out infinite" }}>🖼</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#c8a951", lineHeight: 1.8, marginBottom: 6 }}>
                      Click to upload portrait
                    </div>
                    <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.35)" }}>
                      or pick from Clique roster below
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {/* URL input */}
              <input
                type="url"
                placeholder="or paste image URL…"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); setSelectedAgent(""); }}
                style={{
                  width: "100%", background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(200,169,81,.15)", color: "#E8DCC8",
                  fontSize: 9, fontFamily: "'Roboto Mono',monospace", padding: "7px 10px", outline: "none",
                  marginBottom: 14,
                }}
              />

              {/* Agent picker */}
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 8 }}>
                Quick Pick — Clique Roster
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {LILLY_AGENTS.map(a => (
                  <button key={a.id} className={`agent-chip${selectedAgent === a.id ? " active" : ""}`}
                    onClick={() => pickAgent(a.id)}>
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — Prompt Control */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── POSITIVE PROMPT ── */}
              <div style={{
                border: "1px solid rgba(200,169,81,.35)",
                background: "rgba(200,169,81,.03)",
              }}>
                {/* Label bar */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 14px",
                  background: "rgba(200,169,81,.08)",
                  borderBottom: "1px solid rgba(200,169,81,.2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: 3, color: "#c8a951", textTransform: "uppercase",
                    }}>
                      [ POSITIVE PROMPT ]
                    </div>
                    <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.35)" }}>
                      — paste your full generation instruction here
                    </span>
                  </div>
                  {/* Quick-fill mood chips */}
                  <div style={{ display: "flex", gap: 5 }}>
                    {MOODS.map(m => (
                      <button key={m.id}
                        title={m.desc}
                        onClick={() => { setMood(m.id); if (!customPrompt) setCustomPrompt(m.desc); }}
                        style={{
                          fontFamily: "'Roboto Mono',monospace", fontSize: 7, letterSpacing: 1,
                          padding: "3px 7px", cursor: "pointer",
                          border: `1px solid ${mood === m.id ? "rgba(200,169,81,.6)" : "rgba(255,255,255,.08)"}`,
                          background: mood === m.id ? "rgba(200,169,81,.12)" : "transparent",
                          color: mood === m.id ? "#c8a951" : "rgba(232,220,200,.3)",
                          transition: "all .15s",
                        }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder={`Paste your [POSITIVE PROMPT] here.\n\nExample:\nA seamless, hyper-realistic 3D cinematic idle video loop of the woman from the reference image. She is in a stationary waiting state, maintaining an expression of active listening, anticipation, and high alertness. Her eyes execute tiny, natural micro-movements and a slow, soft blink while looking forward toward the viewer...`}
                  rows={9}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", color: "#E8DCC8",
                    fontSize: 11, fontFamily: "'Cinzel',serif", padding: "14px 16px",
                    outline: "none", resize: "vertical", lineHeight: 1.85,
                    letterSpacing: .3,
                  }}
                />
                <div style={{
                  padding: "6px 14px", borderTop: "1px solid rgba(200,169,81,.1)",
                  fontFamily: "'Roboto Mono',monospace", fontSize: 7,
                  color: "rgba(200,169,81,.35)", letterSpacing: 1,
                  display: "flex", justifyContent: "space-between",
                }}>
                  <span>Filmmaker prefix auto-prepended · STG 1.0 active · 24fps cinematic</span>
                  <span>{customPrompt.length} chars</span>
                </div>
              </div>

              {/* ── NEGATIVE DIRECTIVES ── */}
              <div style={{
                border: "1px solid rgba(220,60,60,.25)",
                background: "rgba(220,60,60,.02)",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 14px",
                  background: "rgba(220,60,60,.06)",
                  borderBottom: "1px solid rgba(220,60,60,.15)",
                }}>
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: 3, color: "#dc3c3c", textTransform: "uppercase",
                  }}>
                    [ NEGATIVE DIRECTIVES ]
                  </div>
                  <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.3)" }}>
                    — what to suppress / exclude from the generation
                  </span>
                  <button
                    onClick={() => setNegativeOverride("")}
                    style={{
                      marginLeft: "auto", fontFamily: "'Roboto Mono',monospace", fontSize: 7,
                      padding: "3px 8px", background: "none",
                      border: "1px solid rgba(220,60,60,.2)", color: "rgba(220,60,60,.4)", cursor: "pointer",
                    }}>
                    Clear
                  </button>
                </div>
                <textarea
                  value={negativeOverride}
                  onChange={e => setNegativeOverride(e.target.value)}
                  placeholder={`Paste your [NEGATIVE DIRECTIVES] here.\n\nExample:\nwind, blowing hair, hand gestures, waving, talking, lip movement, shifting background, clothing change, hair deformation, camera shake, low resolution, plastic skin, twitching.`}
                  rows={4}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", color: "#E8DCC8",
                    fontSize: 11, fontFamily: "'Cinzel',serif", padding: "14px 16px",
                    outline: "none", resize: "vertical", lineHeight: 1.85,
                    letterSpacing: .3,
                  }}
                />
                <div style={{
                  padding: "6px 14px", borderTop: "1px solid rgba(220,60,60,.08)",
                  fontFamily: "'Roboto Mono',monospace", fontSize: 7,
                  color: "rgba(220,60,60,.3)", letterSpacing: 1,
                }}>
                  Merged with base 42-term human-realism guard · ⚙ Admin → Negative Prompt to edit base
                </div>
              </div>

              {/* Realism stack status */}
              <div style={{
                padding: "10px 14px", background: "rgba(168,85,247,.04)",
                border: "1px solid rgba(168,85,247,.12)",
                display: "flex", gap: 20, flexWrap: "wrap",
              }}>
                {[
                  ["CAMERA", "ARRI Alexa 35 · Leica 75mm"],
                  ["GUIDANCE", "3.5 · STEPS 50 · STG 1.0"],
                  ["FPS", "24 cinematic"],
                  ["FRAMES", `${admin.numFrames} (~${(admin.numFrames/admin.fps).toFixed(1)}s)`],
                  ["GUARD", "42-term human realism"],
                ].map(([k, v]) => (
                  <div key={k} style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8 }}>
                    <span style={{ color: "rgba(168,85,247,.7)" }}>{k} </span>
                    <span style={{ color: "rgba(232,220,200,.4)" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Generate */}
              <button
                onClick={generate}
                disabled={generating}
                style={{
                  fontFamily: "'Cinzel Decorative',serif", fontSize: 13, letterSpacing: 3,
                  padding: "18px 32px", textTransform: "uppercase",
                  cursor: generating ? "default" : "pointer",
                  background: generating
                    ? "rgba(255,255,255,.05)"
                    : "linear-gradient(135deg,#4a1a8a,#7c3aed,#a855f7,#7c3aed,#4a1a8a)",
                  backgroundSize: "300% auto",
                  animation: generating ? "none" : "gold-shimmer 3s linear infinite",
                  color: generating ? "rgba(232,220,200,.25)" : "#fff",
                  border: "none", transition: "all .2s",
                  boxShadow: generating ? "none" : "0 0 30px rgba(168,85,247,.3)",
                  width: "100%",
                }}
              >
                {generating ? "◉ Generating with Wan2.2…" : "⬤ Generate CLS Clip"}
              </button>

              {generating && (
                <button
                  onClick={() => { setGenerating(false); setGenStatus(""); }}
                  style={{
                    fontFamily: "'Roboto Mono',monospace", fontSize: 9, letterSpacing: 2,
                    padding: "6px 16px", background: "transparent",
                    border: "1px solid rgba(220,60,60,.4)", color: "rgba(220,60,60,.6)",
                    cursor: "pointer", textTransform: "uppercase", width: "100%",
                  }}
                >
                  ✕ Cancel
                </button>
              )}

              {genStatus && (
                <div style={{
                  fontFamily: "'Roboto Mono',monospace",
                  fontSize: genStatus.startsWith("⚠") ? 10 : 9,
                  color: genStatus.startsWith("✓") ? "#4ade80" : genStatus.startsWith("⚠") ? "#f0d060" : genStatus.startsWith("Error") ? "#dc3c3c" : "#c8a951",
                  letterSpacing: 1,
                  padding: genStatus.startsWith("⚠") ? "10px 14px" : 0,
                  background: genStatus.startsWith("⚠") ? "rgba(200,169,81,.08)" : "transparent",
                  border: genStatus.startsWith("⚠") ? "1px solid rgba(200,169,81,.25)" : "none",
                  lineHeight: 1.6,
                }}>
                  {genStatus}
                </div>
              )}
            </div>
          </div>

          {/* ── BATCH CLS PANEL ── */}
          {batchOpen && (
            <div style={{
              border: "1px solid rgba(168,85,247,.3)", background: "rgba(74,26,138,.06)",
              marginBottom: 24, padding: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase" }}>
                  ⚡ Batch CLS Generator — Human-in-the-Loop
                </div>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.5)" }}>
                  First 3 pairs → approval gate · Then auto-runs remaining
                </div>
              </div>

              {/* Agent selector */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(200,169,81,.6)", textTransform: "uppercase", marginBottom: 8 }}>
                  Select Agents ({batchAgents.length} selected)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {LILLY_AGENTS.map(a => {
                    const on = batchAgents.includes(a.id);
                    return (
                      <button key={a.id}
                        onClick={() => setBatchAgents(prev => on ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                        style={{
                          fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1, padding: "4px 10px",
                          border: `1px solid ${on ? "#a855f7" : "rgba(255,255,255,.1)"}`,
                          background: on ? "rgba(168,85,247,.15)" : "transparent",
                          color: on ? "#a855f7" : "rgba(232,220,200,.4)", cursor: "pointer",
                        }}>
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clips per agent */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(200,169,81,.6)", textTransform: "uppercase" }}>
                  Clips / Agent
                </div>
                <input type="range" min={2} max={20} step={2} value={batchClipsEach}
                  onChange={e => setBatchClipsEach(Number(e.target.value))}
                  style={{ width: 120, accentColor: "#a855f7" }} />
                <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 11, color: "#a855f7", fontWeight: 700 }}>
                  {batchClipsEach}
                </span>
                <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.3)" }}>
                  = {batchAgents.length * batchClipsEach} total clips · ~{Math.ceil(batchAgents.length * batchClipsEach * 1.75)} min · ~${(batchAgents.length * batchClipsEach * 1.75 / 60 * 0.60).toFixed(2)}
                </span>
              </div>

              {/* Progress bar */}
              {batchRunning && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "#a855f7" }}>
                      ◉ Running — {batchDone}/{batchTotal} clips complete
                    </span>
                    <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "rgba(200,169,81,.6)" }}>
                      {approvedPairs < 3 ? `HITL: ${approvedPairs}/3 pairs approved` : "Auto-running ✓"}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2 }}>
                    <div style={{
                      width: `${batchTotal > 0 ? (batchDone / batchTotal) * 100 : 0}%`,
                      height: "100%", background: "linear-gradient(90deg,#6b3fa0,#a855f7)",
                      borderRadius: 2, transition: "width .5s ease",
                    }} />
                  </div>
                  {/* Job grid */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                    {batchJobs.map(j => (
                      <div key={j.id} title={`${j.agentName} · ${j.mood} #${j.variant}`} style={{
                        width: 18, height: 18, borderRadius: 2,
                        background: j.status === "complete" ? "#4ade80"
                          : j.status === "generating" ? "#a855f7"
                          : j.status === "awaiting_approval" ? "#f0d060"
                          : j.status === "failed" ? "#dc3c3c"
                          : "rgba(255,255,255,.08)",
                        border: j.status === "generating" ? "1px solid #a855f7" : "none",
                        animation: j.status === "generating" ? "ltx-pulse 1s ease-in-out infinite" : "none",
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Run / Stop */}
              <div style={{ display: "flex", gap: 10 }}>
                {!batchRunning ? (
                  <button
                    onClick={runBatch}
                    disabled={batchAgents.length === 0 || batchRunning}
                    style={{
                      fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, padding: "12px 28px",
                      background: batchAgents.length === 0 ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#4a1a8a,#a855f7)",
                      color: batchAgents.length === 0 ? "rgba(255,255,255,.2)" : "#fff",
                      border: "none", cursor: batchAgents.length === 0 ? "default" : "pointer", textTransform: "uppercase",
                    }}>
                    ⚡ Run Batch ({batchAgents.length * batchClipsEach} clips)
                  </button>
                ) : (
                  <button onClick={() => { batchAbort.current = true; setBatchRunning(false); }} style={{
                    fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, padding: "12px 28px",
                    background: "rgba(220,60,60,.15)", border: "1px solid rgba(220,60,60,.4)",
                    color: "#dc3c3c", cursor: "pointer", textTransform: "uppercase",
                  }}>
                    ✕ Abort Batch
                  </button>
                )}
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.25)", alignSelf: "center", lineHeight: 1.6 }}>
                  Prompts loaded from fields above<br />Switch to T4 GPU Space for ~$0.60/hr
                </div>
              </div>
            </div>
          )}

          {/* ── APPROVAL OVERLAY ── */}
          {approvalPair && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(6,8,13,.95)",
              zIndex: 500, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: 32,
            }}>
              <div style={{ maxWidth: 900, width: "100%" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, letterSpacing: 4, color: "#a855f7", marginBottom: 6 }}>
                    QUALITY GATE {approvedPairs + 1} / 3
                  </div>
                  <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 10, color: "rgba(232,220,200,.4)" }}>
                    Review both clips before the batch continues · Edit prompt or approve
                  </div>
                </div>

                {/* Two videos side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {approvalPair.jobs.map((job, idx) => (
                    <div key={idx} style={{ border: "1px solid rgba(168,85,247,.2)", background: "rgba(255,255,255,.02)", padding: 12 }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "rgba(200,169,81,.6)", marginBottom: 8, textTransform: "uppercase" }}>
                        Clip {idx + 1} · {job.agentName} · {job.mood}
                      </div>
                      {job.videoUrl ? (
                        <video src={job.videoUrl} controls autoPlay loop muted
                          style={{ width: "100%", aspectRatio: "9/16", objectFit: "cover", background: "#000" }} />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "9/16", background: "rgba(220,60,60,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "#dc3c3c" }}>Generation failed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Prompt editor */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(200,169,81,.6)", textTransform: "uppercase", marginBottom: 6 }}>
                    Edit Positive Prompt (applies to all remaining clips)
                  </div>
                  <textarea
                    value={editingPrompt}
                    onChange={e => setEditingPrompt(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%", background: "rgba(200,169,81,.04)", border: "1px solid rgba(200,169,81,.2)",
                      color: "#E8DCC8", fontFamily: "'Roboto Mono',monospace", fontSize: 9,
                      padding: 10, resize: "vertical", outline: "none",
                    }}
                  />
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(220,60,60,.6)", textTransform: "uppercase", marginBottom: 6, marginTop: 10 }}>
                    Edit Negative Directives
                  </div>
                  <textarea
                    value={editingNeg}
                    onChange={e => setEditingNeg(e.target.value)}
                    rows={2}
                    style={{
                      width: "100%", background: "rgba(220,60,60,.03)", border: "1px solid rgba(220,60,60,.15)",
                      color: "#E8DCC8", fontFamily: "'Roboto Mono',monospace", fontSize: 9,
                      padding: 10, resize: "vertical", outline: "none",
                    }}
                  />
                </div>

                {/* Approve / Re-run */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => { approvalResolve.current?.(true); approvalResolve.current = null; }}
                    style={{
                      flex: 1, fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 3,
                      padding: "16px", background: "linear-gradient(135deg,#166534,#4ade80,#166534)",
                      color: "#fff", border: "none", cursor: "pointer", textTransform: "uppercase",
                    }}>
                    ✓ Approve &amp; Continue Batch
                  </button>
                  <button
                    onClick={() => { approvalResolve.current?.(false); approvalResolve.current = null; }}
                    style={{
                      flex: 1, fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 3,
                      padding: "16px", background: "rgba(220,60,60,.15)",
                      border: "1px solid rgba(220,60,60,.4)", color: "#dc3c3c", cursor: "pointer", textTransform: "uppercase",
                    }}>
                    ✎ Edit Prompt &amp; Re-run Pair
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STITCH MODE BANNER ── */}
          {stitchMode && (
            <div style={{
              padding: "12px 18px", marginBottom: 20,
              background: "rgba(200,169,81,.06)", border: "1px solid rgba(200,169,81,.25)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, color: "#c8a951" }}>
                  STITCH MODE ACTIVE
                </span>
                <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "rgba(232,220,200,.5)", marginLeft: 16 }}>
                  Click clips to select them in order · {selected.size} selected
                  {selected.size >= 2 ? ` — ready to combine!` : ` — select ${2 - selected.size} more`}
                </span>
              </div>
              {orderedSelected.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(200,169,81,.6)" }}>Order:</span>
                  {orderedSelected.map((c, i) => (
                    <span key={c.id} style={{
                      fontFamily: "'Cinzel',serif", fontSize: 8, padding: "3px 8px",
                      background: "rgba(200,169,81,.1)", border: "1px solid rgba(200,169,81,.3)",
                      color: "#c8a951",
                    }}>
                      {i + 1}. {c.agentName ?? c.mood}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STITCHED RESULT HIGHLIGHT ── */}
          {stitchedClip && (
            <div style={{
              padding: "14px 18px", marginBottom: 20,
              background: "rgba(76,175,80,.06)", border: "1px solid rgba(76,175,80,.25)",
              display: "flex", alignItems: "center", gap: 16, animation: "fade-in .4s ease",
            }}>
              <span style={{ fontSize: 20 }}>🎬</span>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "#4CAF50", letterSpacing: 2 }}>
                  Stitch Complete — {stitchedClip.prompt}
                </div>
                <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(76,175,80,.6)", marginTop: 3 }}>
                  Combined video added to gallery · click to preview then download
                </div>
              </div>
              <button onClick={() => downloadClip(stitchedClip)} style={{
                marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
                padding: "7px 16px", background: "rgba(76,175,80,.15)",
                border: "1px solid rgba(76,175,80,.4)", color: "#4CAF50", cursor: "pointer",
              }}>
                ↓ Download
              </button>
              <button onClick={() => setStitchedClip(null)} style={{
                background: "none", border: "none", color: "rgba(232,220,200,.3)", cursor: "pointer", fontSize: 16,
              }}>✕</button>
            </div>
          )}

          {/* ── GALLERY HEADING ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            borderBottom: "1px solid rgba(200,169,81,.1)", paddingBottom: 14, marginBottom: 24,
          }}>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 13, fontWeight: 900,
              background: "linear-gradient(135deg,#c8a951,#fff8e1,#c8a951)",
              backgroundSize: "300% auto", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gold-shimmer 4s linear infinite",
            }}>
              LTX VAULT
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(232,220,200,.35)", textTransform: "uppercase" }}>
              {gallery.length} Generated Clips
            </div>
            {gallery.length > 0 && (
              <button onClick={() => { if (confirm("Clear entire gallery?")) { setGallery([]); saveGallery([]); setStitchedClip(null); } }} style={{
                marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
                padding: "4px 10px", background: "transparent",
                border: "1px solid rgba(220,60,60,.2)", color: "rgba(220,60,60,.4)", cursor: "pointer",
              }}>
                Clear All
              </button>
            )}
          </div>

          {/* ── GALLERY GRID ── */}
          {gallery.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: .25 }}>🎞</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, color: "rgba(232,220,200,.2)", lineHeight: 2 }}>
                No clips yet.<br />Upload a LILLY portrait and generate your first CLS clip.
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {gallery.map(clip => {
                const isSelected = selected.has(clip.id);
                const selOrder = isSelected ? [...selected].indexOf(clip.id) + 1 : 0;
                return (
                  <div
                    key={clip.id}
                    className={`ltx-card${stitchMode && isSelected ? " selected" : ""}`}
                    style={{ position: "relative", cursor: stitchMode ? "pointer" : "default" }}
                    onClick={() => stitchMode && toggleSelect(clip.id)}
                  >
                    {/* Video thumbnail */}
                    <div style={{ aspectRatio: "9/16", background: "#000", position: "relative", overflow: "hidden" }}>
                      <video
                        src={clip.videoUrl}
                        loop muted playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                        onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                      />

                      {/* Stitch order badge */}
                      {stitchMode && isSelected && (
                        <div style={{
                          position: "absolute", top: 8, left: 8,
                          width: 24, height: 24, borderRadius: "50%",
                          background: "#c8a951", color: "#000",
                          fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {selOrder}
                        </div>
                      )}

                      {/* Mood badge */}
                      <div style={{
                        position: "absolute", bottom: 8, left: 8,
                        padding: "3px 8px", background: "rgba(0,0,0,.7)",
                        border: "1px solid rgba(200,169,81,.3)",
                        fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1, color: "#c8a951",
                      }}>
                        {MOODS.find(m => m.id === clip.mood)?.icon ?? "🎬"} {clip.mood}
                      </div>

                      {/* Preview button */}
                      {!stitchMode && (
                        <button onClick={() => setPreview(clip)} style={{
                          position: "absolute", top: 8, right: 8,
                          background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.2)",
                          color: "#fff", fontSize: 12, width: 28, height: 28,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>▶</button>
                      )}
                    </div>

                    {/* Clip info */}
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, color: "#E8DCC8", marginBottom: 3 }}>
                        {clip.agentName ?? "Untitled"}
                      </div>
                      <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 7, color: "rgba(232,220,200,.3)", letterSpacing: 1, marginBottom: 8 }}>
                        {clip.resolution} · {new Date(clip.createdAt).toLocaleTimeString()}
                      </div>

                      {!stitchMode && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => downloadClip(clip)} style={{
                            flex: 1, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1,
                            padding: "6px 0", background: "rgba(200,169,81,.08)",
                            border: "1px solid rgba(200,169,81,.2)", color: "#c8a951", cursor: "pointer",
                          }}>
                            ↓ Download
                          </button>
                          {clip.agentId && (
                            <button onClick={() => sendToCLS(clip)} style={{
                              flex: 1, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1,
                              padding: "6px 0", background: "rgba(76,175,80,.06)",
                              border: "1px solid rgba(76,175,80,.2)", color: "#4CAF50", cursor: "pointer",
                            }}>
                              → CLS
                            </button>
                          )}
                          <button onClick={() => { setGallery(prev => { const n = prev.filter(c => c.id !== clip.id); saveGallery(n); return n; }); }} style={{
                            width: 28, fontFamily: "'Roboto Mono',monospace", fontSize: 12,
                            background: "none", border: "1px solid rgba(220,60,60,.15)",
                            color: "rgba(220,60,60,.4)", cursor: "pointer",
                          }}>
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ADMIN PANEL DRAWER ── */}
      {adminOpen && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
          background: "#070910", borderLeft: "1px solid rgba(168,85,247,.25)",
          zIndex: 10000, overflowY: "auto", display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,.6)",
        }}>
          {/* Drawer header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(168,85,247,.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(168,85,247,.05)", position: "sticky", top: 0, zIndex: 1,
          }}>
            <div>
              <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 12, fontWeight: 900, color: "#a855f7", letterSpacing: 3 }}>
                LTX MODEL ADMIN
              </div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.5)", marginTop: 3, letterSpacing: 1 }}>
                Direct model control · weights · instructions
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveAdminCfg} style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, padding: "7px 16px",
                background: adminSaved ? "rgba(76,175,80,.15)" : "rgba(168,85,247,.15)",
                border: `1px solid ${adminSaved ? "rgba(76,175,80,.4)" : "rgba(168,85,247,.4)"}`,
                color: adminSaved ? "#4CAF50" : "#a855f7", cursor: "pointer", transition: "all .3s",
              }}>
                {adminSaved ? "✓ Saved" : "Save"}
              </button>
              <button onClick={() => { setAdmin(DEFAULT_ADMIN); saveAdmin(DEFAULT_ADMIN); }} style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, padding: "7px 12px",
                background: "transparent", border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(232,220,200,.4)", cursor: "pointer",
              }}>Reset</button>
              <button onClick={() => setAdminOpen(false)} style={{
                background: "none", border: "none", color: "rgba(232,220,200,.4)",
                cursor: "pointer", fontSize: 18, lineHeight: 1,
              }}>✕</button>
            </div>
          </div>

          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Guardrails toggle */}
            <div style={{
              padding: "14px 16px",
              background: admin.guardrailsOff ? "rgba(220,60,60,.08)" : "rgba(76,175,80,.05)",
              border: `1px solid ${admin.guardrailsOff ? "rgba(220,60,60,.3)" : "rgba(76,175,80,.15)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, color: admin.guardrailsOff ? "#dc3c3c" : "#4CAF50", textTransform: "uppercase" }}>
                  {admin.guardrailsOff ? "⚠ Guardrails OFF — Raw Model" : "✓ Guardrails ON — Filmmaker Presets"}
                </div>
                <button onClick={() => updateAdmin({ guardrailsOff: !admin.guardrailsOff })} style={{
                  fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, padding: "5px 12px",
                  background: admin.guardrailsOff ? "rgba(220,60,60,.15)" : "rgba(76,175,80,.1)",
                  border: `1px solid ${admin.guardrailsOff ? "rgba(220,60,60,.4)" : "rgba(76,175,80,.3)"}`,
                  color: admin.guardrailsOff ? "#dc3c3c" : "#4CAF50", cursor: "pointer",
                }}>
                  {admin.guardrailsOff ? "Turn ON" : "Turn OFF"}
                </button>
              </div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.35)", lineHeight: 1.7 }}>
                {admin.guardrailsOff
                  ? "Prompt prefix and negative prompt are cleared. Raw prompts sent directly to LTX-Video 2.3. Use custom instruction below to fully control the model."
                  : "Filmmaker prompt prefix and 42-term negative prompt are applied to every generation. Toggle off for raw model access."}
              </div>
            </div>

            {/* Custom instruction */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(168,85,247,.7)", textTransform: "uppercase", marginBottom: 8 }}>
                Custom System Instruction
              </div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.3)", marginBottom: 8, lineHeight: 1.7 }}>
                Prepended to every prompt. Use this to lock character appearance, style, lighting, or any permanent instruction for all generations in this session.
              </div>
              <textarea
                value={admin.customInstruction}
                onChange={e => updateAdmin({ customInstruction: e.target.value })}
                rows={5}
                placeholder="e.g. Black woman, 30s, natural hair, warm brown skin, confident expression. Always lit with soft golden hour window light from camera left. Never smile wide — keep expression professional and warm..."
                style={{
                  width: "100%", background: "rgba(168,85,247,.04)",
                  border: "1px solid rgba(168,85,247,.2)", color: "#E8DCC8",
                  fontSize: 10, fontFamily: "'Roboto Mono',monospace", padding: "10px 12px",
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                }}
              />
            </div>

            {/* Prompt prefix */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(200,169,81,.6)", textTransform: "uppercase", marginBottom: 8 }}>
                Prompt Prefix {admin.guardrailsOff && <span style={{ color: "#dc3c3c", fontSize: 8 }}>(disabled — guardrails off)</span>}
              </div>
              <textarea
                value={admin.promptPrefix}
                onChange={e => updateAdmin({ promptPrefix: e.target.value })}
                rows={4}
                disabled={admin.guardrailsOff}
                style={{
                  width: "100%", background: admin.guardrailsOff ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.03)",
                  border: "1px solid rgba(200,169,81,.15)", color: admin.guardrailsOff ? "rgba(232,220,200,.2)" : "#E8DCC8",
                  fontSize: 9, fontFamily: "'Roboto Mono',monospace", padding: "10px 12px",
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                }}
              />
            </div>

            {/* Negative prompt */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(220,60,60,.6)", textTransform: "uppercase", marginBottom: 8 }}>
                Negative Prompt {admin.guardrailsOff && <span style={{ color: "#dc3c3c", fontSize: 8 }}>(disabled — guardrails off)</span>}
              </div>
              <textarea
                value={admin.negativePrompt}
                onChange={e => updateAdmin({ negativePrompt: e.target.value })}
                rows={4}
                disabled={admin.guardrailsOff}
                style={{
                  width: "100%", background: admin.guardrailsOff ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.03)",
                  border: "1px solid rgba(220,60,60,.15)", color: admin.guardrailsOff ? "rgba(232,220,200,.2)" : "#E8DCC8",
                  fontSize: 9, fontFamily: "'Roboto Mono',monospace", padding: "10px 12px",
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                }}
              />
            </div>

            {/* Model weights / parameters */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(168,85,247,.7)", textTransform: "uppercase", marginBottom: 14 }}>
                Model Parameters
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {([
                  { key: "guidanceScale",  label: "Guidance Scale",     min: 1, max: 10, step: 0.1,  tip: "3.5 = Lightricks sweet spot. Lower = creative/loose. Higher = prompt-locked but may over-saturate." },
                  { key: "numSteps",       label: "Inference Steps",    min: 10, max: 100, step: 1,  tip: "50 = quality ceiling for LTX. 20-30 for fast draft. 50 for final." },
                  { key: "stgScale",       label: "STG Scale",          min: 0, max: 3, step: 0.05,  tip: "Spatio-Temporal Guidance. 1.0 eliminates face artifacts. 0 = off. >1.5 = over-smooth." },
                  { key: "stgRescale",     label: "STG Rescale",        min: 0, max: 1, step: 0.05,  tip: "0.7 reduces ghosting on skin/hair edges. Keep between 0.6-0.8." },
                  { key: "imageCondNoise", label: "Image Cond Noise",   min: 0, max: 1, step: 0.01,  tip: "0.15 = faithful to portrait with natural motion. 0 = static/stiff. 0.5 = heavy drift from reference." },
                  { key: "fps",            label: "Frame Rate (FPS)",   min: 8, max: 30, step: 1,    tip: "24 = cinematic. 30 = soap-opera effect. 12 = animation style." },
                  { key: "width",          label: "Width (px)",         min: 256, max: 1280, step: 32, tip: "480 = portrait mode (9:16). 832 = landscape. Must be divisible by 32." },
                  { key: "height",         label: "Height (px)",        min: 256, max: 1280, step: 32, tip: "832 = portrait mode (9:16). 480 = landscape. Must be divisible by 32." },
                  { key: "numFrames",      label: "Num Frames",         min: 9, max: 257, step: 8,   tip: "257 = ~10.7s (max). 193 = 8s. 145 = 6s. 97 = 4s. Must be (8×N)+1." },
                ] as {key: keyof LTXAdmin; label: string; min: number; max: number; step: number; tip: string}[]).map(({ key, label, min, max, step, tip }) => (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.5)", letterSpacing: 1 }}>{label}</span>
                      <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 9, color: "#a855f7", fontWeight: 600 }}>
                        {admin[key] as number}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step}
                      value={admin[key] as number}
                      onChange={e => updateAdmin({ [key]: parseFloat(e.target.value) } as Partial<LTXAdmin>)}
                      style={{ width: "100%", accentColor: "#a855f7" }}
                    />
                    <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 7, color: "rgba(232,220,200,.2)", lineHeight: 1.6, marginTop: 2 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* STG skip layers */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "rgba(168,85,247,.7)", textTransform: "uppercase", marginBottom: 8 }}>
                STG Skip Layers
              </div>
              <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.3)", marginBottom: 6, lineHeight: 1.7 }}>
                JSON array of transformer block indices to apply STG to. [19, 20] targets face quality blocks. Try [16, 17, 18, 19, 20] for stronger effect.
              </div>
              <input
                type="text"
                value={admin.stgSkipLayers}
                onChange={e => updateAdmin({ stgSkipLayers: e.target.value })}
                style={{
                  width: "100%", background: "rgba(168,85,247,.04)",
                  border: "1px solid rgba(168,85,247,.2)", color: "#a855f7",
                  fontSize: 11, fontFamily: "'Roboto Mono',monospace", padding: "8px 12px", outline: "none",
                }}
              />
            </div>

            {/* Current config snapshot */}
            <div style={{ padding: 14, background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 3, color: "rgba(232,220,200,.3)", textTransform: "uppercase", marginBottom: 8 }}>
                Live Config Snapshot
              </div>
              <pre style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.6)", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
{JSON.stringify({
  guidance_scale: admin.guidanceScale,
  num_inference_steps: admin.numSteps,
  stg_scale: admin.stgScale,
  stg_rescale: admin.stgRescale,
  stg_skip_layers: admin.stgSkipLayers,
  image_cond_noise_scale: admin.imageCondNoise,
  frame_rate: admin.fps,
  width: admin.width,
  height: admin.height,
  num_frames: admin.numFrames,
  guardrails_off: admin.guardrailsOff,
  has_custom_instruction: !!admin.customInstruction,
}, null, 2)}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* ── FULL-SCREEN PREVIEW MODAL ── */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.92)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            position: "relative", maxWidth: 480, width: "90%",
          }}>
            <video
              src={preview.videoUrl}
              autoPlay loop muted={false} playsInline controls
              style={{ width: "100%", borderRadius: 4, display: "block" }}
            />
            <div style={{ padding: "12px 0", display: "flex", gap: 10 }}>
              <button onClick={() => downloadClip(preview)} style={{
                flex: 1, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
                padding: "10px", background: "rgba(200,169,81,.15)",
                border: "1px solid rgba(200,169,81,.4)", color: "#c8a951", cursor: "pointer",
              }}>↓ Download to Device</button>
              {preview.agentId && (
                <button onClick={() => sendToCLS(preview)} style={{
                  flex: 1, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
                  padding: "10px", background: "rgba(76,175,80,.1)",
                  border: "1px solid rgba(76,175,80,.3)", color: "#4CAF50", cursor: "pointer",
                }}>→ Send to CLS Vault</button>
              )}
              <button onClick={() => setPreview(null)} style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, padding: "10px 16px",
                background: "none", border: "1px solid rgba(255,255,255,.15)",
                color: "rgba(232,220,200,.5)", cursor: "pointer",
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
