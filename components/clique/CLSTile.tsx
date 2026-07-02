"use client";
/**
 * CLSTile — Clique Listening State tile
 *
 * Renders an agent as an always-animated presence.
 * Uses the CLS Loop Router to crossfade between variants seamlessly.
 *
 * Priority stack:
 *   1. HF data lake CLS video (mp4 loop) — two video elements, A/B crossfade
 *   2. CSS breathing animation on portrait — fallback while videos generate
 *
 * The parent switches to Runway live stream when state === "live".
 */
import { useEffect, useRef, useState } from "react";
import { CliqueAgent } from "@/lib/clique-roster";
import { clsUrl, CLSVariant } from "@/lib/clique-cls";
import { useCLSLoopRouter, CLSRouterState } from "@/lib/cls-loop-router";

interface Props {
  agent: CliqueAgent;
  /** CLS state from parent — drives the loop router */
  clsState?: CLSRouterState;
  /** Optional variant override (bypasses router) */
  variant?: CLSVariant;
  /** Square px size, or a CSS length ("100%") to fill the parent */
  size: number | string;
  borderRadius?: number | string;
  isCSA?: boolean;
  onReady?: () => void;
  onStateComplete?: (state: CLSRouterState) => void;
  /**
   * Live Runway video URL — when set, instantly crossfades from CLS loop
   * to the live clip. Clear to null to return to CLS loop.
   */
  liveVideoUrl?: string | null;
  /** Called when the live Runway clip finishes playing — parent should returnToLoop() */
  onLiveEnded?: () => void;
}

export default function CLSTile({
  agent, clsState = "listen", variant: variantOverride,
  size, borderRadius = 8, isCSA, onReady, onStateComplete,
  liveVideoUrl, onLiveEnded,
}: Props) {
  const { currentVariant, nextVariant, transitioning } = useCLSLoopRouter(
    agent.id,
    variantOverride ? "listen" : clsState, // router manages state unless override
    onStateComplete,
  );

  // If override is provided, use it directly; otherwise let router decide
  const aVariant = variantOverride ?? currentVariant;
  const bVariant = variantOverride ?? nextVariant;

  // Track which video elements can actually play
  const [aOk, setAOk] = useState(true);
  const [bOk, setBOk] = useState(true);
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);

  // When both fail → CSS fallback
  const videoFails = !aOk && !bOk;

  // When variant changes, reset error state optimistically
  useEffect(() => { setAOk(true); }, [aVariant]);
  useEffect(() => { setBOk(true); }, [bVariant]);

  // Ensure video B preloads before the crossfade hits
  useEffect(() => {
    bRef.current?.load();
  }, [bVariant]);

  const FADE      = "opacity 0.6s ease-in-out";
  const LIVE_FADE = "opacity 0.2s ease-in-out"; // live switch is faster — near-instant
  const showLive  = !!liveVideoUrl;

  return (
    <div style={{
      width: size, height: size,
      borderRadius,
      overflow: "hidden",
      position: "relative",
      flexShrink: 0,
      background: "#0a0c12",
    }}>

      {!videoFails && (
        <>
          {/* ── VIDEO A — current/base layer ── */}
          <video
            ref={aRef}
            key={`a-${aVariant}`}
            src={clsUrl(agent.id, aVariant)}
            autoPlay loop muted playsInline
            onCanPlay={() => { onReady?.(); }}
            onError={() => setAOk(false)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
              opacity: transitioning ? 0 : 1,
              transition: FADE,
              display: aOk ? "block" : "none",
            }}
          />

          {/* ── VIDEO B — crossfade target layer ── */}
          <video
            ref={bRef}
            key={`b-${bVariant}`}
            src={clsUrl(agent.id, bVariant)}
            autoPlay loop muted playsInline
            onError={() => setBOk(false)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
              opacity: transitioning ? 1 : 0,
              transition: FADE,
              display: bOk ? "block" : "none",
            }}
          />
        </>
      )}

      {/* ── CSS FALLBACK — portrait + alive micro-animations ── */}
      {videoFails && (
        <>
          <style>{`
            @keyframes cls-breathe-${agent.id} {
              0%,100% { transform: scale(1) translateY(0px); }
              40%      { transform: scale(1.018) translateY(-1px); }
              70%      { transform: scale(1.010) translateY(-0.5px); }
            }
            @keyframes cls-blink-${agent.id} {
              0%,94%,100% { opacity: 1; }
              96%,98%     { opacity: 0.15; }
            }
            @keyframes cls-glow-scan-${agent.id} {
              0%   { transform: translateY(-100%); opacity: 0; }
              10%  { opacity: 1; }
              90%  { opacity: 1; }
              100% { transform: translateY(200%); opacity: 0; }
            }
          `}</style>

          {/* Portrait with breathing + blink */}
          <img
            src={agent.portrait}
            alt={agent.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              animation: `cls-breathe-${agent.id} 4.2s ease-in-out infinite,
                           cls-blink-${agent.id} 5.5s ease-in-out infinite`,
              transformOrigin: "50% 30%",
            }}
          />

          {/* Gold shimmer scan — signals "alive" even without video */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 35%, rgba(200,169,81,0.04) 50%, transparent 65%)",
            animation: `cls-glow-scan-${agent.id} 6s linear infinite`,
            pointerEvents: "none",
          }} />

          {/* Subtle CSA glow pulse */}
          {isCSA && (
            <div style={{
              position: "absolute", inset: 0,
              boxShadow: "inset 0 0 28px rgba(200,169,81,0.06)",
              animation: "pulse-ring 3s ease-in-out infinite",
              pointerEvents: "none",
              borderRadius,
            }} />
          )}
        </>
      )}

      {/* ── LAYER C: LIVE RUNWAY VIDEO ─────────────────────────────────────
          Sits on top of everything. Fades in instantly when liveVideoUrl is
          set, fades out when cleared. The CLS loop keeps playing underneath
          so the return transition is seamless.
      ──────────────────────────────────────────────────────────────────── */}
      {liveVideoUrl && (
        <video
          key={liveVideoUrl}
          src={liveVideoUrl}
          autoPlay
          muted
          playsInline
          onEnded={onLiveEnded}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top center",
            opacity: showLive ? 1 : 0,
            transition: LIVE_FADE,
            zIndex: 10,
          }}
        />
      )}

      {/* Gold LIVE pulse ring — shows while Runway layer is active */}
      {showLive && (
        <div style={{
          position: "absolute", inset: 0,
          borderRadius,
          boxShadow: "inset 0 0 0 2px rgba(200,169,81,0.6), 0 0 20px rgba(200,169,81,0.3)",
          zIndex: 11,
          pointerEvents: "none",
          animation: "live-pulse 1.5s ease-in-out infinite",
        }} />
      )}
      <style>{`
        @keyframes live-pulse {
          0%,100% { box-shadow: inset 0 0 0 2px rgba(200,169,81,0.4), 0 0 14px rgba(200,169,81,0.2); }
          50%      { box-shadow: inset 0 0 0 3px rgba(200,169,81,0.9), 0 0 28px rgba(200,169,81,0.5); }
        }
      `}</style>
    </div>
  );
}
