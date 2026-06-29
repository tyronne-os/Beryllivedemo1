"use client";
import { useMemo } from "react";
import { CliqueAgent } from "@/lib/clique-roster";
import { QCRProfile, rapportColor, rapportLabel } from "@/lib/qcr";
import CLSTile from "./CLSTile";
import { CLSVariant } from "@/lib/clique-cls";
import { CLSRouterState } from "@/lib/cls-loop-router";

interface Props {
  agent: CliqueAgent;
  state: "listening" | "live" | "offline";
  size?: "sm" | "md" | "lg";
  qcr?: QCRProfile;
  onClick?: () => void;
  /** Override the CLS variant (e.g. "wave" for first entry) */
  clsVariant?: CLSVariant;
  /** CLS router state — drives the loop router inside CLSTile */
  clsState?: CLSRouterState;
}

const MOOD_COLOR: Record<string, string> = {
  energized: "#f5e070",
  focused:   "#1a5f7a",
  stressed:  "#dc3c3c",
  curious:   "#9c27b0",
  satisfied: "#4CAF50",
  neutral:   "#888",
};

export default function AgentTile({ agent, state, size = "md", qcr, onClick, clsVariant, clsState }: Props) {
  const dim      = size === "lg" ? 180 : size === "sm" ? 100 : 136;
  const isLive   = state === "live";
  const isOff    = state === "offline";

  const rapport   = qcr?.rapportScore ?? 0.3;
  const ringColor = rapportColor(rapport);
  const ringWidth = 2 + Math.round(rapport * 3);
  const desire    = qcr?.desireLevel ?? 0.5;
  const moodColor = MOOD_COLOR[qcr?.moodRead ?? "neutral"];
  const showDesire = desire > 0.75 && !isLive;

  // Stable variant override per mount — only used when router is bypassed
  const variantOverride = useMemo(
    () => clsVariant ?? undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agent.id]
  );

  // Router state: live agents go "live", CSA follows parent state, others listen
  const routerState: CLSRouterState = clsState ?? (isLive ? "live" : agent.isCSA ? "wave" : "listen");

  const borderRadius = agent.isCSA ? "50%" : 6;

  return (
    <div
      onClick={onClick}
      title={qcr ? `${rapportLabel(rapport)} · ${qcr.personalityAttractor}` : agent.name}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        cursor: onClick ? "pointer" : "default",
        opacity: isOff ? 0.4 : 1,
        transition: "opacity .3s, transform .3s",
        transform: isLive ? "scale(1.07)" : "scale(1)",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes desire-sparkle-${agent.id} {
          0%,100%{opacity:.5;transform:scale(1) rotate(0deg)}
          50%{opacity:1;transform:scale(1.12) rotate(8deg)}
        }
        @keyframes live-ring-${agent.id} {
          0%{box-shadow:0 0 0 0 rgba(245,224,112,.5)}
          100%{box-shadow:0 0 0 10px rgba(245,224,112,0)}
        }
      `}</style>

      {/* Desire sparkle */}
      {showDesire && (
        <div style={{
          position: "absolute", top: -6, right: -4, fontSize: 13, zIndex: 10,
          animation: `desire-sparkle-${agent.id} 2s ease-in-out infinite`,
          pointerEvents: "none",
        }}>✦</div>
      )}

      {/* Portrait / CLS frame */}
      <div style={{
        position: "relative",
        width: dim, height: dim,
        borderRadius,
        overflow: "hidden",
        border: isLive
          ? "3px solid #f5e070"
          : `${ringWidth}px solid ${ringColor}`,
        boxShadow: isLive
          ? "0 0 0 4px rgba(245,224,112,.2), 0 0 28px rgba(200,169,81,.55)"
          : agent.isCSA
            ? "0 0 0 3px rgba(200,169,81,.15), 0 4px 20px rgba(0,0,0,.12)"
            : "0 4px 14px rgba(0,0,0,.08)",
        flexShrink: 0,
        animation: isLive ? `live-ring-${agent.id} 1.2s ease-out infinite` : "none",
      }}>
        {/* CLS animated loop — always alive, never a frozen image */}
        <CLSTile
          agent={agent}
          clsState={routerState}
          variant={variantOverride}
          size={dim}
          borderRadius={borderRadius}
          isCSA={agent.isCSA}
        />

        {/* LIVE gradient overlay */}
        {isLive && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg,transparent 55%,rgba(200,169,81,.1) 100%)",
            pointerEvents: "none",
          }} />
        )}

        {/* LIVE badge */}
        {isLive && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "#dc3c3c", color: "#fff",
            fontFamily: "'Cinzel',serif", fontSize: 8, fontWeight: 700,
            letterSpacing: 2, padding: "2px 7px", borderRadius: 2,
            textTransform: "uppercase", boxShadow: "0 0 8px rgba(220,60,60,.6)",
          }}>LIVE</div>
        )}

        {/* CSA badge */}
        {agent.isCSA && (
          <div style={{
            position: "absolute", bottom: 5, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(200,169,81,.95)", color: "#0a0604",
            fontFamily: "'Cinzel',serif", fontSize: 7, fontWeight: 700,
            letterSpacing: 1.5, padding: "2px 8px", borderRadius: 2,
            textTransform: "uppercase", whiteSpace: "nowrap",
          }}>CSA</div>
        )}

        {/* QCR mood dot */}
        {qcr && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: moodColor, border: "1px solid rgba(255,255,255,.5)",
            boxShadow: `0 0 6px ${moodColor}`,
          }} title={qcr.moodRead} />
        )}
      </div>

      {/* Name + role + rapport */}
      <div style={{ textAlign: "center", maxWidth: dim }}>
        <div style={{
          fontFamily: "'Cinzel',serif",
          fontSize: size === "sm" ? 10 : 12,
          fontWeight: 600,
          color: isLive ? "#c8a951" : "#fff",
          letterSpacing: 1,
          transition: "color .3s",
        }}>{agent.name}</div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: size === "sm" ? 9 : 11,
          color: "rgba(255,255,255,.45)", fontStyle: "italic", marginTop: 2,
        }}>{agent.role}</div>
        {qcr && (
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 8,
            letterSpacing: 1.5, textTransform: "uppercase",
            color: ringColor, marginTop: 3,
          }}>{rapportLabel(rapport)}</div>
        )}
      </div>
    </div>
  );
}
