"use client";
import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { CliqueAgent, getDefaultTeam } from "@/lib/clique-roster";
import { QCRProfile, getQCRProfile } from "@/lib/qcr";
import {
  HumanParticipant, seedHumans, makeRoomCode,
} from "@/lib/clique-participants";
import AgentTile from "./AgentTile";
import HumanTile from "./HumanTile";
import CallControls from "./CallControls";
import CameraPanel from "./CameraPanel";
import AccessGrantPanel, { AccessGrants } from "./AccessGrantPanel";
import InviteModal from "./InviteModal";
import GroupListener from "./GroupListener";
import GroupResponseBanner from "./GroupResponseBanner";
import { GRIClip, GRICategory } from "@/lib/gri";

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
  const [humans, setHumans]        = useState<HumanParticipant[]>(seedHumans);
  const [roomCode, setRoomCode]    = useState("CLIQUE");
  const [mic, setMic]              = useState(true);
  const [cam, setCam]              = useState(false);
  const [stream, setStream]        = useState<MediaStream | null>(null);
  const [scribeActive, setScribe]  = useState(true);
  const [notesOpen, setNotesOpen]  = useState(false);
  const [accessOpen, setAccess]    = useState(false);
  const [callMeOpen, setCallMe]    = useState(false);
  const [inviteOpen, setInvite]    = useState(false);
  const [activeAgent, setActive]   = useState<string | null>(null);
  const [grants, setGrants]        = useState<AccessGrants>({
    email: false, linkedin: false, phone: null, phoneCallEnabled: false,
  });
  const [griClip, setGriClip]      = useState<GRIClip | null>(null);
  const [griCat, setGriCat]        = useState<GRICategory | null>(null);
  const [transcript]               = useState("");

  const handleGRI = useCallback((clip: GRIClip, category: GRICategory) => {
    setGriClip(clip);
    setGriCat(category);
  }, []);

  useEffect(() => {
    setQCR(loadQCRProfiles(getDefaultTeam()));
    // Room code from ?room= or a fresh one
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("room");
      setRoomCode(param?.toUpperCase() || makeRoomCode());
    }
  }, []);

  // Bind local webcam stream + mic/cam state into the local human participant
  useEffect(() => {
    setHumans(prev => prev.map(h =>
      h.isLocal
        ? { ...h, stream, camOn: cam && !!stream, micOn: mic,
            connection: cam && stream ? "connected" : "camera-off" }
        : h
    ));
  }, [stream, cam, mic]);

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

  const humanCount = humans.length;
  const totalCount = humanCount + members.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", background: "#FDFAF6", position: "relative" }}>
      <style>{`
        @keyframes scribe-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes room-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes live-pip { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid rgba(200,169,81,.18)",
        background: "#fff", flexShrink: 0,
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, letterSpacing: 3,
            background: "linear-gradient(110deg,#8B6914 0%,#c8a951 30%,#f5e070 50%,#c8a951 70%,#8B6914 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>CLIQUE</span>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#999", fontStyle: "italic" }}>
            Video Conferencing with AI · Real Time
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* Participant count */}
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#aaa", fontStyle: "italic" }}>
            👤 {humanCount} human{humanCount === 1 ? "" : "s"} · ✦ {members.length} agents
          </span>

          {/* Room code */}
          <button onClick={() => setInvite(true)} title="Invite people" style={{
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, fontWeight: 700,
            textTransform: "uppercase", color: "#8B6914", cursor: "pointer",
            padding: "5px 12px", borderRadius: 20,
            border: "1px solid rgba(200,169,81,.4)", background: "rgba(200,169,81,.07)",
          }}>Room {roomCode} · Invite ➕</button>

          {/* QCR indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#9c27b0", display: "inline-block", boxShadow: "0 0 6px #9c27b0" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>QCR</span>
          </div>

          {/* Scribe indicator */}
          {scribeActive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc3c3c", display: "inline-block", animation: "scribe-blink 1.4s ease-in-out infinite", boxShadow: "0 0 6px rgba(220,60,60,.7)" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>Scribe</span>
            </div>
          )}

          {grants.email && <span title="Email connected" style={{ fontSize: 14 }}>📧</span>}
          {grants.linkedin && <span title="LinkedIn connected" style={{ fontSize: 14 }}>💼</span>}
          {grants.phone && <span title={`Phone: ${grants.phone}`} style={{ fontSize: 14 }}>📱</span>}
        </div>
      </div>

      {/* ── ROOM — unified gallery of humans + agents ── */}
      <div style={{
        flex: 1, padding: "26px 20px 16px",
        display: "flex", flexDirection: "column", gap: 26,
        overflowY: "auto", animation: "room-in .45s ease both",
      }}>
        {/* PEOPLE row */}
        <section>
          <div style={{ ...sectionLabel, color: "#1a5f7a" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a5f7a", display: "inline-block" }} />
            In the Room · People
          </div>
          <div style={galleryRow}>
            {humans.map(h => (
              <HumanTile key={h.id} human={h} size={h.isLocal ? "lg" : "md"} />
            ))}
          </div>
        </section>

        {/* AGENTS row */}
        <section>
          <div style={{ ...sectionLabel, color: "#c8a951" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a951", display: "inline-block" }} />
            In the Room · Your Clique
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(144px, 1fr))",
            gap: 20, width: "100%", maxWidth: 1040, margin: "0 auto", justifyItems: "center",
          }}>
            {members.map(a => (
              <AgentTile
                key={a.id} agent={a}
                state={agentStates[a.id] ?? "listening"}
                size="md"
                qcr={qcrProfiles[a.id]}
                onClick={() => wakeAgent(a.id)}
              />
            ))}
          </div>
        </section>

        {/* Active agent bar */}
        {activeAgent && (
          <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#888", fontStyle: "italic" }}>
            {members.find(a => a.id === activeAgent)?.name} is live —
            <button onClick={returnToListening} style={{
              marginLeft: 10, background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
              color: "#c8a951", textTransform: "uppercase", textDecoration: "underline",
            }}>Return to listening</button>
          </div>
        )}

        {/* Camera panel (controls the local webcam feed) */}
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
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#0D1117" }}>Live Notes · Cleo</span>
            <button onClick={() => setNotesOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#888", fontStyle: "italic", lineHeight: 1.65 }}>
              Cleo is always listening — to humans and agents alike. Notes, decisions, and action items appear here in real-time.
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
        <AccessGrantPanel grants={grants} onChange={setGrants} onClose={() => setAccess(false)} />
      )}

      {/* ── INVITE MODAL ── */}
      {inviteOpen && <InviteModal roomCode={roomCode} onClose={() => setInvite(false)} />}

      {/* ── GROUP RESPONSE INTELLIGENCE ── */}
      <GroupListener transcript={transcript} onTrigger={handleGRI} />
      <GroupResponseBanner
        clip={griClip}
        category={griCat}
        onDone={() => { setGriClip(null); setGriCat(null); }}
      />

      {/* ── CALL ME MODAL ── */}
      {callMeOpen && (
        <CallMeModal
          hasPhone={!!grants.phone}
          phone={grants.phone}
          onRequestCall={async (agentId) => {
            setCallMe(false);
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
        onInvite={() => setInvite(true)}
        isScribeActive={scribeActive}
        hasPhone={!!grants.phone}
      />
    </div>
  );
}

const sectionLabel: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600,
  letterSpacing: 2.5, textTransform: "uppercase",
  marginBottom: 16, justifyContent: "center",
};

const galleryRow: CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: 20,
  justifyContent: "center", alignItems: "flex-end",
};

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
