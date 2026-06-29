"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { CliqueAgent, getDefaultTeam } from "@/lib/clique-roster";
import { QCRProfile, getQCRProfile, QCR_SEED } from "@/lib/qcr";
import AgentTile from "./AgentTile";
import CallControls from "./CallControls";
import CameraPanel from "./CameraPanel";
import AccessGrantPanel, { AccessGrants } from "./AccessGrantPanel";

type AgentState = "listening" | "live" | "offline";
type AgentStateMap = Record<string, AgentState>;

const USER_ID = "beryl_user_default";

function buildInitialStates(members: CliqueAgent[]): AgentStateMap {
  const map: AgentStateMap = {};
  members.forEach(a => { map[a.id] = "listening"; });
  return map;
}

function loadQCRProfiles(members: CliqueAgent[]): Record<string, QCRProfile> {
  const profiles: Record<string, QCRProfile> = {};
  members.forEach(a => {
    try { profiles[a.id] = getQCRProfile(USER_ID, a.id); } catch { /* no seed */ }
  });
  return profiles;
}

export default function CliqueRoom() {
  const [members]                  = useState<CliqueAgent[]>(getDefaultTeam);
  const [agentStates, setStates]   = useState<AgentStateMap>(() => buildInitialStates(getDefaultTeam()));
  const [qcrProfiles, setQCR]      = useState<Record<string, QCRProfile>>({});
  const [mic, setMic]              = useState(true);
  const [cam, setCam]              = useState(false);
  const [stream, setStream]        = useState<MediaStream | null>(null);
  const [scribeActive, setScribe]  = useState(true);
  const [notesOpen, setNotesOpen]  = useState(false);
  const [accessOpen, setAccess]    = useState(false);
  const [callMeOpen, setCallMe]    = useState(false);
  const [activeAgent, setActive]   = useState<string | null>(null);
  const [grants, setGrants]        = useState<AccessGrants>({
    email: false, linkedin: false, phone: null, phoneCallEnabled: false,
  });
  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setQCR(loadQCRProfiles(getDefaultTeam()));
  }, []);

  // Mirror camera stream to user tile video element
  useEffect(() => {
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = stream;
      if (stream) userVideoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const wakeAgent = useCallback((id: string) => {
    setStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k] === "live") next[k] = "listening"; });
      next[id] = "live";
      return next;
    });
    setActive(id);
  }, []);

  const returnToListening = useCallback(() => {
    setStates(buildInitialStates(getDefaultTeam()));
    setActive(null);
  }, []);

  const memberCount = members.length;
  const useGrid = memberCount > 6;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", background: "#FDFAF6", position: "relative" }}>
      <style>{`
        @keyframes scribe-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes room-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid rgba(200,169,81,.18)",
        background: "#fff", flexShrink: 0,
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, letterSpacing: 3,
            background: "linear-gradient(110deg,#8B6914 0%,#c8a951 30%,#f5e070 50%,#c8a951 70%,#8B6914 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>BERYL CLIQUE</span>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#aaa", fontStyle: "italic" }}>
            {memberCount} members · {useGrid ? "Grid" : "Radial"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* QCR indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#9c27b0",
              display: "inline-block", boxShadow: "0 0 6px #9c27b0",
            }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>QCR Active</span>
          </div>

          {/* Scribe indicator */}
          {scribeActive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#dc3c3c",
                display: "inline-block", animation: "scribe-blink 1.4s ease-in-out infinite",
                boxShadow: "0 0 6px rgba(220,60,60,.7)",
              }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>Scribe</span>
            </div>
          )}

          {/* Access grant badges */}
          {grants.email && <span title="Email connected" style={{ fontSize: 14 }}>📧</span>}
          {grants.linkedin && <span title="LinkedIn connected" style={{ fontSize: 14 }}>💼</span>}
          {grants.phone && <span title={`Phone: ${grants.phone}`} style={{ fontSize: 14 }}>📱</span>}
        </div>
      </div>

      {/* ── ROOM ── */}
      <div style={{
        flex: 1, padding: "24px 20px 16px",
        display: "flex", flexDirection: "column", gap: 20,
        overflowY: "auto", animation: "room-in .45s ease both",
      }}>
        {useGrid ? (
          <GridLayout
            members={members}
            agentStates={agentStates}
            qcrProfiles={qcrProfiles}
            cam={cam}
            mic={mic}
            stream={stream}
            videoRef={userVideoRef}
            onWake={wakeAgent}
          />
        ) : (
          <RadialLayout
            members={members}
            agentStates={agentStates}
            qcrProfiles={qcrProfiles}
            cam={cam}
            mic={mic}
            stream={stream}
            videoRef={userVideoRef}
            onWake={wakeAgent}
          />
        )}

        {/* Active agent bar */}
        {activeAgent && (
          <div style={{
            textAlign: "center",
            fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
            color: "#888", fontStyle: "italic",
          }}>
            {members.find(a => a.id === activeAgent)?.name} is speaking —
            <button onClick={returnToListening} style={{
              marginLeft: 10, background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
              color: "#c8a951", textTransform: "uppercase", textDecoration: "underline",
            }}>Return to listening</button>
          </div>
        )}

        {/* Camera panel (below grid when cam on) */}
        {cam && (
          <div style={{ maxWidth: 360, margin: "0 auto", width: "100%" }}>
            <CameraPanel active={cam} onStream={setStream} />
          </div>
        )}
      </div>

      {/* ── NOTES PANEL ── */}
      {notesOpen && (
        <aside style={{
          position: "fixed", top: 64, right: accessOpen ? 340 : 0, bottom: 0, width: 320,
          background: "#fff", borderLeft: "1px solid rgba(200,169,81,.25)",
          zIndex: 150, display: "flex", flexDirection: "column",
          boxShadow: "-6px 0 30px rgba(0,0,0,.07)",
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(200,169,81,.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#0D1117" }}>Live Notes · Scribe</span>
            <button onClick={() => setNotesOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#888", fontStyle: "italic", lineHeight: 1.65 }}>
              Cleo is always listening. Notes, decisions, and action items will appear here in real-time.
            </p>
            <div style={{ marginTop: 18, padding: "12px 14px", background: "#FDFAF6", border: "1px solid rgba(200,169,81,.2)", borderRadius: 4 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "#c8a951", textTransform: "uppercase", marginBottom: 8 }}>Action Items</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#aaa", fontStyle: "italic" }}>None yet — start talking.</p>
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#FDFAF6", border: "1px solid rgba(200,169,81,.2)", borderRadius: 4 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "#c8a951", textTransform: "uppercase", marginBottom: 8 }}>Decisions</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#aaa", fontStyle: "italic" }}>None recorded yet.</p>
            </div>
          </div>
        </aside>
      )}

      {/* ── ACCESS PANEL ── */}
      {accessOpen && (
        <AccessGrantPanel
          grants={grants}
          onChange={setGrants}
          onClose={() => setAccess(false)}
        />
      )}

      {/* ── CALL ME MODAL ── */}
      {callMeOpen && (
        <CallMeModal
          hasPhone={!!grants.phone}
          phone={grants.phone}
          onRequestCall={async (agentId) => {
            setCallMe(false);
            // Phase 1: hit /api/clique/call-me
            await fetch("/api/clique/call-me", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ agentId, phone: grants.phone }),
            }).catch(() => {});
          }}
          onClose={() => setCallMe(false)}
          members={members}
        />
      )}

      {/* ── CALL CONTROLS ── */}
      <CallControls
        mic={mic}
        cam={cam}
        onMic={() => setMic(m => !m)}
        onCam={() => setCam(c => !c)}
        onEnd={returnToListening}
        onNotes={() => { setScribe(s => !s); setNotesOpen(o => !o); }}
        onChat={() => {}}
        onAccess={() => setAccess(o => !o)}
        onCallMe={() => setCallMe(o => !o)}
        isScribeActive={scribeActive}
        hasPhone={!!grants.phone}
      />
    </div>
  );
}

/* ── GRID LAYOUT ── */
function GridLayout({ members, agentStates, qcrProfiles, cam, mic, stream, videoRef, onWake }: {
  members: CliqueAgent[];
  agentStates: AgentStateMap;
  qcrProfiles: Record<string, QCRProfile>;
  cam: boolean; mic: boolean;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onWake: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <UserTile cam={cam} mic={mic} stream={stream} videoRef={videoRef} />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(144px, 1fr))",
        gap: 20, width: "100%", maxWidth: 940, justifyItems: "center",
      }}>
        {members.map(a => (
          <AgentTile
            key={a.id} agent={a}
            state={agentStates[a.id] ?? "listening"}
            size="md"
            qcr={qcrProfiles[a.id]}
            onClick={() => onWake(a.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── RADIAL LAYOUT ── */
function RadialLayout({ members, agentStates, qcrProfiles, cam, mic, stream, videoRef, onWake }: {
  members: CliqueAgent[];
  agentStates: AgentStateMap;
  qcrProfiles: Record<string, QCRProfile>;
  cam: boolean; mic: boolean;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onWake: (id: string) => void;
}) {
  const half  = Math.ceil(members.length / 2);
  const left  = members.slice(0, half);
  const right = members.slice(half);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end" }}>
        {left.map(a => <AgentTile key={a.id} agent={a} state={agentStates[a.id] ?? "listening"} qcr={qcrProfiles[a.id]} onClick={() => onWake(a.id)} />)}
      </div>
      <UserTile cam={cam} mic={mic} stream={stream} videoRef={videoRef} size="lg" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
        {right.map(a => <AgentTile key={a.id} agent={a} state={agentStates[a.id] ?? "listening"} qcr={qcrProfiles[a.id]} onClick={() => onWake(a.id)} />)}
      </div>
    </div>
  );
}

/* ── USER TILE ── */
function UserTile({ cam, mic, stream, videoRef, size = "md" }: {
  cam: boolean; mic: boolean;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? 180 : 200;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: dim, height: dim,
        borderRadius: size === "lg" ? "50%" : 8,
        background: "#0f0a05",
        border: "3px solid rgba(200,169,81,.65)",
        boxShadow: "0 0 0 6px rgba(200,169,81,.1), 0 8px 40px rgba(0,0,0,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Live camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            display: cam && stream ? "block" : "none",
          }}
        />
        {/* Placeholder */}
        {(!cam || !stream) && (
          <>
            <span style={{ fontSize: 36, zIndex: 1 }}>👤</span>
            {!cam && (
              <span style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(200,169,81,.45)", zIndex: 1,
              }}>Camera Off</span>
            )}
          </>
        )}
        {/* Muted badge */}
        {!mic && (
          <div style={{
            position: "absolute", bottom: 8, right: 8, zIndex: 2,
            background: "#dc3c3c", borderRadius: "50%",
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
          }}>🔇</div>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 600, color: "#0D1117", letterSpacing: 1 }}>You</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#888", fontStyle: "italic", marginTop: 2 }}>Host</div>
      </div>
    </div>
  );
}

/* ── CALL ME MODAL ── */
function CallMeModal({ hasPhone, phone, onRequestCall, onClose, members }: {
  hasPhone: boolean;
  phone: string | null;
  onRequestCall: (agentId: string) => void;
  onClose: () => void;
  members: CliqueAgent[];
}) {
  const [selected, setSelected] = useState("amanda");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 8, padding: 28,
        width: "100%", maxWidth: 400,
        border: "1px solid rgba(200,169,81,.3)",
        boxShadow: "0 20px 80px rgba(0,0,0,.3)",
      }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#0D1117", marginBottom: 6 }}>Request a Call</div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#666", fontStyle: "italic", lineHeight: 1.6, marginBottom: 20 }}>
          {hasPhone
            ? `Your clique will call ${phone} with an update or to continue this conversation.`
            : "Add your phone number in Access & Integrations first."}
        </p>

        {hasPhone && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#c8a951", marginBottom: 8 }}>Who should call?</div>
              <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid rgba(200,169,81,.3)", borderRadius: 4,
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#0D1117",
                  background: "#FDFAF6",
                }}
              >
                {members.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => onRequestCall(selected)}
              style={{
                width: "100%", padding: "13px",
                fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
                letterSpacing: 2.5, textTransform: "uppercase",
                background: "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
                border: "none", color: "#0a0604", cursor: "pointer", borderRadius: 4,
              }}
            >Call Me Now</button>
          </>
        )}

        {!hasPhone && (
          <button onClick={onClose} style={{
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2,
            textTransform: "uppercase", padding: "10px 20px",
            border: "1px solid rgba(200,169,81,.4)", background: "rgba(200,169,81,.08)",
            color: "#c8a951", cursor: "pointer", borderRadius: 4,
          }}>Go to Access Settings</button>
        )}
      </div>
    </div>
  );
}
