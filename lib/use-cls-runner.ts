"use client";
/**
 * useCLSRunner — CLS ↔ Live Runway Switcher
 *
 * Orchestrates the full lifecycle for one agent:
 *   CLS loop (idle)  →  generate Runway clip  →  instant switch to LIVE  →  return to CLS
 *
 * The switch from loop → live happens in < 200ms once the Runway clip is ready.
 * Clips are pre-generated speculatively so the switch feels instant to the user.
 *
 * Usage:
 *   const { liveVideoUrl, isLive, goLive, returnToLoop } = useCLSRunner(agentId);
 *   // Pass liveVideoUrl to CLSTile — it handles the visual crossfade.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type LiveMood = "speak" | "nod" | "react" | "explain";

export interface CLSRunnerHandle {
  /** URL of the ready Runway live clip — null while in CLS loop mode */
  liveVideoUrl: string | null;
  /** True when the live Runway layer is showing */
  isLive: boolean;
  /** True while a Runway clip is being generated */
  isGenerating: boolean;
  /** Trigger a live moment — generates clip + switches instantly when ready */
  goLive: (mood?: LiveMood) => void;
  /** Return to CLS idle loop */
  returnToLoop: () => void;
  /** Pre-warm: silently generate a clip in background so next goLive() is instant */
  prewarm: (mood?: LiveMood) => void;
}

const POLL_INTERVAL_MS = 1_500;

export function useCLSRunner(agentId: string): CLSRunnerHandle {
  const [liveVideoUrl, setLiveVideoUrl] = useState<string | null>(null);
  const [isLive,       setIsLive]       = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-warmed clip cache: mood → url
  const cache      = useRef<Map<string, string>>(new Map());
  const pollTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTask= useRef<string | null>(null);
  const pendingMood= useRef<LiveMood>("speak");
  const unmounted  = useRef(false);

  useEffect(() => () => { unmounted.current = true; stopPoll(); }, []);

  function stopPoll() {
    if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
  }

  async function submitTask(mood: LiveMood): Promise<string | null> {
    try {
      const res = await fetch("/api/clique/cls-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, mood }),
      });
      if (!res.ok) return null;
      const { taskId } = await res.json();
      return taskId ?? null;
    } catch { return null; }
  }

  async function pollTask(taskId: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/clique/cls-live?taskId=${taskId}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === "SUCCEEDED") return data.videoUrl ?? null;
      if (data.status === "FAILED")    return null;
      return undefined as unknown as null; // still running
    } catch { return null; }
  }

  // ── goLive ────────────────────────────────────────────────────────────────
  const goLive = useCallback(async (mood: LiveMood = "speak") => {
    if (unmounted.current) return;
    pendingMood.current = mood;

    // 1. Check cache first — instant switch
    const cached = cache.current.get(mood);
    if (cached) {
      setLiveVideoUrl(cached);
      setIsLive(true);
      cache.current.delete(mood); // consume it
      return;
    }

    // 2. Not cached — generate now and switch when ready
    setIsGenerating(true);
    const taskId = await submitTask(mood);
    if (!taskId || unmounted.current) { setIsGenerating(false); return; }
    currentTask.current = taskId;

    stopPoll();
    pollTimer.current = setInterval(async () => {
      if (unmounted.current) { stopPoll(); return; }
      const url = await pollTask(currentTask.current!);
      if (url === null) { stopPoll(); setIsGenerating(false); return; } // failed
      if (typeof url === "string" && url.length > 0) {
        stopPoll();
        setIsGenerating(false);
        if (unmounted.current) return;
        setLiveVideoUrl(url);
        setIsLive(true);
      }
      // undefined = still running, keep polling
    }, POLL_INTERVAL_MS);
  }, [agentId]);

  // ── returnToLoop ──────────────────────────────────────────────────────────
  const returnToLoop = useCallback(() => {
    stopPoll();
    setIsLive(false);
    setLiveVideoUrl(null);
    setIsGenerating(false);
    currentTask.current = null;
  }, []);

  // ── prewarm ───────────────────────────────────────────────────────────────
  const prewarm = useCallback(async (mood: LiveMood = "speak") => {
    if (cache.current.has(mood) || unmounted.current) return;

    const taskId = await submitTask(mood);
    if (!taskId) return;

    const timer = setInterval(async () => {
      if (unmounted.current) { clearInterval(timer); return; }
      const url = await pollTask(taskId);
      if (typeof url === "string" && url.length > 0) {
        clearInterval(timer);
        cache.current.set(mood, url);
      }
      if (url === null) clearInterval(timer); // failed silently
    }, POLL_INTERVAL_MS);
  }, [agentId]);

  return { liveVideoUrl, isLive, isGenerating, goLive, returnToLoop, prewarm };
}
