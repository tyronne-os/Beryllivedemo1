"use client";
/**
 * CLSTile — Clique Listening State tile
 *
 * Every agent renders as an animated presence — never a frozen 2D image.
 * Priority:
 *   1. HF data lake CLS video loop (mp4, loops silently)
 *   2. CSS "alive" breathing animation on the portrait (fallback while videos load)
 *
 * The parent switches from CLSTile → live Runway stream when the agent goes LIVE.
 */
import { useEffect, useRef, useState } from "react";
import { CliqueAgent } from "@/lib/clique-roster";
import { clsUrl, CLSVariant } from "@/lib/clique-cls";

interface Props {
  agent: CliqueAgent;
  variant: CLSVariant;
  size: number;           // pixel dimension (square)
  borderRadius?: number | string;
  isCSA?: boolean;
  onReady?: () => void;   // fires when video starts playing
}

export default function CLSTile({ agent, variant, size, borderRadius = 8, isCSA, onReady }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(true); // optimistically try video first

  const src = clsUrl(agent.id, variant);

  useEffect(() => {
    setVideoOk(true); // reset on variant change
  }, [src]);

  return (
    <div style={{
      width: size, height: size,
      borderRadius,
      overflow: "hidden",
      position: "relative",
      flexShrink: 0,
      background: "#0a0c12",
    }}>
      {/* ── CLS VIDEO LOOP ── */}
      {videoOk && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => { onReady?.(); }}
          onError={() => setVideoOk(false)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      )}

      {/* ── CSS FALLBACK — portrait + breathing animation ── */}
      {!videoOk && (
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
            @keyframes cls-glow-${agent.id} {
              0%,100% { box-shadow: inset 0 0 0 0 rgba(200,169,81,0); }
              50%     { box-shadow: inset 0 0 18px 0 rgba(200,169,81,0.06); }
            }
          `}</style>
          <div style={{
            position: "absolute", inset: 0,
            animation: `cls-glow-${agent.id} 4s ease-in-out infinite`,
          }}>
            <img
              src={agent.portrait}
              alt={agent.name}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                animation: `cls-breathe-${agent.id} 4.2s ease-in-out infinite,
                             cls-blink-${agent.id} 5.5s ease-in-out infinite`,
                transformOrigin: "50% 30%",
              }}
            />
          </div>

          {/* Subtle shimmer scan line — signals "alive" */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(200,169,81,0.03) 50%, transparent 60%)",
            animation: `cls-shimmer-scan 6s linear infinite`,
            pointerEvents: "none",
          }} />
          <style>{`
            @keyframes cls-shimmer-scan {
              0%   { transform: translateY(-100%); }
              100% { transform: translateY(200%); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
