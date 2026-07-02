"use client";
/**
 * CliquePanel — the permanent right rail.
 *
 * Amanda, India, Jeff, and Nu live here for the entire studio session —
 * intro and meeting phases alike. Full-bleed portrait cards stacked
 * vertically, roll-in stagger on mount, flex-expand on hover, and a
 * visual state machine per card (listening pulse / live gold glow +
 * voice bars / dormant dim / offline grayscale).
 *
 * Amanda's card hosts her CLS loop (never a frozen image); the other
 * three swap portrait → CLSTile when they go live.
 */
import { type CSSProperties } from "react";
import { CliqueAgent, getV1Team } from "@/lib/clique-roster";
import { CLSRouterState } from "@/lib/cls-loop-router";
import CLSTile from "./CLSTile";

type PanelState = "listening" | "live" | "offline" | "silent-listening" | "available";

interface Props {
  /** Live agent state map from CliqueRoom — ids not present render as "available" */
  agentStates: Record<string, string>;
  /** Click a portrait → wake (meeting) or invite (intro) */
  onWake: (id: string) => void;
  /** Amanda's CLS loop state — drives her always-animated card */
  amandaCLS: CLSRouterState;
  amandaLiveUrl?: string | null;
  onAmandaLiveEnded?: () => void;
  onAmandaStateComplete?: (s: CLSRouterState) => void;
  amandaSpeaking?: boolean;
  amandaConnected?: boolean;
}

const PANEL_W = 300;
const TEAM = getV1Team(); // amanda, india, jeff, nu — fixed order

const STATE_LABEL: Record<PanelState, string> = {
  live: "Live",
  listening: "Listening",
  "silent-listening": "In the room",
  available: "On call",
  offline: "Offline",
};

export default function CliquePanel({
  agentStates, onWake, amandaCLS, amandaLiveUrl,
  onAmandaLiveEnded, onAmandaStateComplete,
  amandaSpeaking, amandaConnected,
}: Props) {
  return (
    <aside className="cp-panel">
      <style>{`
        @keyframes cp-roll-in {
          from { opacity: 0; transform: translateX(40px) scale(.96); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0) scale(1);      filter: blur(0); }
        }
        @keyframes cp-dot-pulse {
          0%,100% { opacity: 1; box-shadow: 0 0 4px rgba(200,169,81,.5); }
          50%     { opacity: .35; box-shadow: 0 0 1px rgba(200,169,81,.2); }
        }
        @keyframes cp-vbar { from { transform: scaleY(.2); } to { transform: scaleY(1); } }
        @keyframes cp-live-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .cp-panel {
          position: fixed; top: 64px; right: 0; bottom: 0;
          width: ${PANEL_W}px; z-index: 100;
          background: #0D1117;
          border-left: 1px solid rgba(200,169,81,.12);
          display: flex; flex-direction: column;
        }
        .cp-header {
          height: 36px; flex-shrink: 0;
          display: flex; align-items: center; padding: 0 14px;
          border-bottom: 1px solid rgba(200,169,81,.1);
        }
        .cp-card {
          flex: 1; min-height: 0; position: relative; overflow: hidden;
          cursor: pointer; border-bottom: 1px solid rgba(200,169,81,.07);
          transition: flex .3s cubic-bezier(.4,0,.2,1);
          animation: cp-roll-in .5s cubic-bezier(.2,.8,.3,1) both;
        }
        .cp-card:hover { flex: 1.5; }
        .cp-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          transition: filter .25s ease;
        }
        .cp-img-listening        { filter: brightness(.7)  saturate(.85); }
        .cp-img-live             { filter: brightness(.95) saturate(1.15); }
        .cp-img-silent-listening { filter: brightness(.55) saturate(.7); }
        .cp-img-available        { filter: brightness(.55) saturate(.7); }
        .cp-img-offline          { filter: brightness(.35) saturate(.3) grayscale(.5); }
        .cp-card:hover .cp-img   { filter: brightness(.88) saturate(1); }
        /* main content clears the fixed panel */
        .cq-wrap { padding-right: ${PANEL_W}px; }
        @media (max-width: 768px) {
          .cp-panel {
            top: auto; bottom: 0; left: 0; right: 0; width: 100%; height: 118px;
            flex-direction: row;
            border-left: none; border-top: 1px solid rgba(200,169,81,.15);
          }
          .cp-header { display: none; }
          .cp-card { border-bottom: none; border-right: 1px solid rgba(200,169,81,.07); }
          .cq-wrap { padding-right: 0; padding-bottom: 118px; }
        }
      `}</style>

      <div className="cp-header">
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "rgba(200,169,81,.5)", textTransform: "uppercase" }}>
          Your Clique · Always Here
        </span>
      </div>

      {TEAM.map((agent, i) => {
        const st = (agentStates[agent.id] ?? "available") as PanelState;
        const isAmanda = agent.id === "amanda";
        const isLive = st === "live" || (isAmanda && !!amandaSpeaking);
        return (
          <PortraitCard
            key={agent.id}
            agent={agent}
            state={st}
            isLive={isLive}
            delay={i * 0.08}
            onClick={() => onWake(agent.id)}
            statusOverride={
              isAmanda
                ? amandaSpeaking
                  ? "Speaking…"
                  : amandaConnected === false
                    ? "Connecting…"
                    : undefined
                : undefined
            }
          >
            {isAmanda ? (
              // Amanda is never a frozen image — CLS loop runs continuously
              <div style={{ position: "absolute", inset: 0 }}>
                <CLSTile
                  agent={agent}
                  clsState={amandaCLS}
                  size="100%"
                  borderRadius={0}
                  isCSA
                  liveVideoUrl={amandaLiveUrl}
                  onLiveEnded={onAmandaLiveEnded}
                  onStateComplete={onAmandaStateComplete}
                />
              </div>
            ) : st === "live" ? (
              // Live non-CSA agent — portrait hands off to the CLS loop
              <div style={{ position: "absolute", inset: 0 }}>
                <CLSTile agent={agent} clsState="live" size="100%" borderRadius={0} />
              </div>
            ) : (
              <img src={agent.portrait} alt={agent.name} className={`cp-img cp-img-${st}`} />
            )}
          </PortraitCard>
        );
      })}
    </aside>
  );
}

// ── Single portrait card ────────────────────────────────────────────────────
function PortraitCard({ agent, state, isLive, delay, onClick, statusOverride, children }: {
  agent: CliqueAgent;
  state: PanelState;
  isLive: boolean;
  delay: number;
  onClick: () => void;
  statusOverride?: string;
  children: React.ReactNode;
}) {
  const nameColor =
    isLive ? "#f5e070"
    : state === "listening" ? "#e0d0b0"
    : state === "offline" ? "rgba(255,255,255,.25)"
    : "rgba(255,255,255,.55)";

  return (
    <div
      className="cp-card"
      onClick={onClick}
      style={{
        animationDelay: `${delay}s`,
        borderLeft: isLive ? "2px solid #c8a951" : "2px solid transparent",
        boxShadow: isLive ? "inset 4px 0 24px rgba(200,169,81,.15)" : "none",
      }}
    >
      {children}

      {/* Gradient overlay — gold-washed when live */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: isLive
          ? "linear-gradient(to top, rgba(200,169,81,.22) 0%, rgba(0,0,0,.1) 55%, transparent 100%)"
          : "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.35) 45%, transparent 100%)",
      }} />

      {/* Gold shimmer sweep across live portrait */}
      {isLive && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "40%",
            background: "linear-gradient(100deg, transparent, rgba(245,224,112,.08), transparent)",
            animation: "cp-live-sweep 2.8s ease-in-out infinite",
          }} />
        </div>
      )}

      {/* Info block */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase", color: nameColor,
          }}>{agent.name}</span>
          {isLive && (
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 7, fontWeight: 700, letterSpacing: 1.5,
              color: "#0a0604", background: "linear-gradient(110deg,#c8a951,#f5e070)",
              padding: "2px 7px", borderRadius: 3, textTransform: "uppercase",
            }}>Live</span>
          )}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 11, fontStyle: "italic",
          color: "rgba(255,255,255,.4)", marginTop: 2,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {!isLive && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0,
              background: state === "listening" ? "rgba(200,169,81,.75)"
                : state === "offline" ? "rgba(255,255,255,.15)"
                : "rgba(200,169,81,.3)",
              animation: state === "listening" ? "cp-dot-pulse 3s ease-in-out infinite" : "none",
            }} />
          )}
          <span>{agent.role} · {statusOverride ?? STATE_LABEL[state]}</span>
        </div>
        {isLive && <PanelVoiceBars />}
      </div>
    </div>
  );
}

// ── Voice bars — shown on live cards ────────────────────────────────────────
function PanelVoiceBars() {
  const bars = [0.5, 1, 0.7, 0.9, 0.6];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12, marginTop: 5 }}>
      {bars.map((d, i) => (
        <div key={i} style={{
          width: 3, height: "100%", borderRadius: 1,
          background: "linear-gradient(180deg,#f5e070,#c8a951)",
          transformOrigin: "bottom",
          animation: `cp-vbar ${0.5 + d * 0.35}s ${i * 0.09}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}
