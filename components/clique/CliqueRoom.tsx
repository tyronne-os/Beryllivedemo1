"use client";
import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { CliqueAgent, CLIQUE_ROSTER } from "@/lib/clique-roster";
import { QCRProfile, getQCRProfile } from "@/lib/qcr";
import { HumanParticipant, seedHumans, makeRoomCode } from "@/lib/clique-participants";
import { detectIntent, SessionIntent } from "@/lib/clique-intent";
import { CLSVariant } from "@/lib/clique-cls";
import { CLSRouterState } from "@/lib/cls-loop-router";
import { useAmandaVoice } from "@/lib/use-amanda-voice";
import { useCLSRunner } from "@/lib/use-cls-runner";
import AgentTile from "./AgentTile";
import CLSTile from "./CLSTile";
import HumanTile from "./HumanTile";
import CallControls from "./CallControls";
import CameraPanel from "./CameraPanel";
import InviteModal from "./InviteModal";
import GroupListener from "./GroupListener";
import GroupResponseBanner from "./GroupResponseBanner";
import { GRIClip, GRICategory } from "@/lib/gri";

type Phase = "intro" | "meeting";
type AgentState = "listening" | "live" | "offline";
type AgentStateMap = Record<string, AgentState>;

interface ChatMessage {
  agentId: string;
  agentName: string;
  portrait: string;
  text: string;
  ts: number;
}

const USER_ID = "beryl_user_default";
const AMANDA = CLIQUE_ROSTER.find(a => a.id === "amanda")!;

// Smart invite sets for quick-action chips
const QUICK_ACTIONS = [
  { label: "Build Something",      ids: ["eve","jamarr","brice"],              emoji: "🛠" },
  { label: "Strategy Session",     ids: ["jessica","nu","naomi"],              emoji: "🎯" },
  { label: "Research & Analyze",   ids: ["bri","terrell","india"],             emoji: "🔍" },
  { label: "Design Review",        ids: ["lacara","jamarr","eve"],             emoji: "🎨" },
  { label: "Full Clique",          ids: ["eve","jamarr","jessica","jeff","india","lacara","terrell","brice","bri","naomi","cleo","kizzy"], emoji: "⚡" },
];

function inferAgentsFromText(text: string): string[] {
  const t = text.toLowerCase();
  const ids: string[] = [];
  if (/build|code|develop|engineer|implement|feature|ship/.test(t))  ids.push("eve","jamarr","brice");
  if (/design|ui|ux|visual|layout|brand|look/.test(t))               ids.push("lacara","jamarr");
  if (/strategy|plan|pitch|investor|market|roadmap/.test(t))         ids.push("jessica","nu","naomi");
  if (/data|analytics|metric|report|number|dashboard/.test(t))       ids.push("terrell","bri");
  if (/growth|launch|user|funnel|traffic|retention/.test(t))         ids.push("india","kizzy");
  if (/research|study|find|investigate|explore/.test(t))             ids.push("bri","terrell");
  if (/content|write|copy|post|message/.test(t))                     ids.push("india","shelly");
  return [...new Set(ids)];
}

export default function CliqueRoom() {
  const [phase, setPhase]               = useState<Phase>("intro");
  const [localHuman, setLocalHuman]     = useState<HumanParticipant>(seedHumans()[0]);
  const [joinedAgents, setJoinedAgents] = useState<CliqueAgent[]>([]);
  const [agentStates, setStates]        = useState<AgentStateMap>({ amanda: "listening" });
  const [qcrProfiles, setQCR]           = useState<Record<string, QCRProfile>>({});
  const [roomCode, setRoomCode]         = useState("CLIQUE");
  const [mic, setMic]                   = useState(true);
  const [cam, setCam]                   = useState(false);
  const [stream, setStream]             = useState<MediaStream | null>(null);
  const [inviteOpen, setInvite]         = useState(false);
  const [activeAgent, setActive]        = useState<string | null>(null);
  const [inviting, setInviting]         = useState<string | null>(null);
  const [userGoal, setUserGoal]         = useState("");
  const [amandaMsg, setAmandaMsg]       = useState(
    "Good day! I'm Amanda, your Clique Supervisor. What are we working on today?"
  );
  const [griClip, setGriClip]           = useState<GRIClip | null>(null);
  const [griCat, setGriCat]             = useState<GRICategory | null>(null);
  const [transcript]                    = useState("");
  const [intent, setIntent]             = useState<SessionIntent>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [buildUrl, setBuildUrl]         = useState<string | null>(null);
  // CLS state: "wave" = intro greeting loop, "listen" = active waiting, "confirm" = nodding, "live" = Runway stream
  const [amandaCLS, setAmandaCLS]       = useState<CLSRouterState>("wave");
  const inputRef                        = useRef<HTMLInputElement>(null);
  const chatEndRef                      = useRef<HTMLDivElement>(null);

  // CLS ↔ Live Runway runner for Amanda (intro phase uses this directly;
  // meeting phase AgentTile has its own instance — both key off "amanda")
  const amandaRunner = useCLSRunner("amanda");

  // OpenAI Realtime voice — Amanda speaks through WebRTC, never Web Speech API
  const amanda = useAmandaVoice(
    () => {
      setAmandaCLS("live");
      // Flip agentStates so meeting-phase AgentTile also goes live
      setStates(prev => ({ ...prev, amanda: "live" }));
      amandaRunner.goLive("speak");
    },
    () => {
      setAmandaCLS("listen");
      setStates(prev => ({ ...prev, amanda: "listening" }));
      amandaRunner.returnToLoop();
    },
  );

  const handleGRI = useCallback((clip: GRIClip, cat: GRICategory) => {
    setGriClip(clip); setGriCat(cat);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("room");
      setRoomCode(param?.toUpperCase() || makeRoomCode());
    }
  }, []);

  // Sync webcam stream into local human tile
  useEffect(() => {
    setLocalHuman(prev => ({
      ...prev, stream, camOn: cam && !!stream, micOn: mic,
      connection: cam && !!stream ? "connected" : "camera-off",
    }));
  }, [stream, cam, mic]);

  const inviteAgents = useCallback(async (ids: string[]) => {
    const toAdd = ids
      .map(id => CLIQUE_ROSTER.find(a => a.id === id))
      .filter((a): a is CliqueAgent =>
        !!a && a.id !== "amanda" && !joinedAgents.find(j => j.id === a.id)
      );

    // Amanda confirms the request — CLS shifts to confirm (nod), then she speaks
    setAmandaCLS("confirm");
    amanda.speak(
      toAdd.length
        ? `Got it. Let me bring in the right people.`
        : `Your team is ready.`
    );

    await new Promise(r => setTimeout(r, 1200));
    setPhase("meeting");
    if (toAdd.length === 0) return;

    for (const agent of toAdd) {
      setInviting(agent.name);
      setAmandaMsg(`Bringing in ${agent.name}…`);
      await new Promise(r => setTimeout(r, 900));
      setJoinedAgents(prev => [...prev, agent]);
      setStates(prev => ({ ...prev, [agent.id]: "listening" }));
      try {
        setQCR(prev => ({ ...prev, [agent.id]: getQCRProfile(USER_ID, agent.id) }));
      } catch { /* no seed profile yet */ }
      await new Promise(r => setTimeout(r, 350));
    }

    setInviting(null);
    const names = toAdd.map(a => a.name).join(", ");
    setAmandaMsg(`${names} ${toAdd.length === 1 ? "is" : "are"} in the room. Just talk — they're listening.`);
  }, [joinedAgents]);

  const handleGoalSubmit = useCallback(() => {
    const goal = userGoal.trim();
    if (!goal) return;
    const detected = detectIntent(goal);
    setIntent(detected);
    const ids = inferAgentsFromText(goal);
    inviteAgents(ids.length ? ids : ["eve", "jessica", "bri"]);
    setUserGoal("");
  }, [userGoal, inviteAgents]);

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
    setStates(prev => Object.fromEntries(Object.keys(prev).map(k => [k, "listening"])));
    setActive(null);
  }, []);

  const addMoreStaff = useCallback(() => {
    const remaining = CLIQUE_ROSTER.filter(
      a => a.id !== "amanda" && !joinedAgents.find(j => j.id === a.id)
    );
    if (remaining.length > 0) inviteAgents([remaining[0].id]);
  }, [joinedAgents, inviteAgents]);

  // ── INTRO PHASE ──────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={introWrap}>
        <style>{`
          @keyframes fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes amanda-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(200,169,81,0),0 0 60px rgba(200,169,81,.15)} 50%{box-shadow:0 0 0 8px rgba(200,169,81,.08),0 0 60px rgba(200,169,81,.25)} }
          @keyframes chip-in { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
          @keyframes intro-cam-border { 0%,100%{border-color:rgba(200,169,81,.3)} 50%{border-color:rgba(200,169,81,.65)} }
        `}</style>

        {/* Header */}
        <div style={headerStyle}>
          <span style={logoStyle}>CLIQUE</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.3)", fontStyle:"italic" }}>
            Video Conferencing · AI · Real Time
          </span>
          <button onClick={() => setInvite(true)} style={roomCodeBtn}>
            Room {roomCode} · Invite ➕
          </button>
        </div>

        {/* ── Two-panel ── */}
        <div style={twoPanelGrid}>
          {/* USER — left */}
          <div style={{ ...panelBase, animation:"fade-up .5s ease both" }}>
            <div style={{
              width: 240, height: 240, borderRadius: 12,
              background: "linear-gradient(135deg,#111827,#1a1a2e)",
              border: "2px solid rgba(200,169,81,.35)",
              boxShadow: "0 0 40px rgba(0,0,0,.6)",
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "intro-cam-border 3s ease-in-out infinite",
              flexShrink: 0,
            }}>
              {cam && stream ? (
                <video
                  autoPlay playsInline muted
                  ref={el => { if (el) { el.srcObject = stream; el.play().catch(() => {}); } }}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}
                />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:88, height:88, borderRadius:"50%",
                    background:"linear-gradient(135deg,#c8a951cc,#c8a95166)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:"#0a0604",
                    boxShadow:"0 0 28px rgba(200,169,81,.3)",
                  }}>YOU</div>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, color:"rgba(255,255,255,.25)", textTransform:"uppercase" }}>Camera off</span>
                </div>
              )}
              {/* HOST badge */}
              <div style={{ position:"absolute", top:10, left:10, background:"rgba(200,169,81,.15)", backdropFilter:"blur(6px)", borderRadius:4, padding:"3px 9px", border:"1px solid rgba(200,169,81,.3)" }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:2, color:"rgba(200,169,81,.9)", textTransform:"uppercase" }}>👤 Host</span>
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:"#fff", letterSpacing:2 }}>You</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.4)", fontStyle:"italic", marginTop:3 }}>Meeting Organizer</div>
            </div>
            <button onClick={() => setCam(c => !c)} style={camToggleBtn(cam)}>
              {cam ? "📹 Camera On" : "📷 Enable Camera"}
            </button>
            {cam && <div style={{ display:"none" }}><CameraPanel active={cam} onStream={setStream} /></div>}
          </div>

          {/* DIVIDER */}
          <div style={{ width:1, background:"linear-gradient(to bottom,transparent,rgba(200,169,81,.25),transparent)", alignSelf:"stretch", margin:"40px 0" }} />

          {/* AMANDA — right (CLS animated loop) */}
          <div style={{ ...panelBase, animation:"fade-up .5s .1s ease both" }}>
            {/* CLS frame — always animated, never frozen */}
            <div style={{
              width: 240, height: 240, borderRadius: "50%", overflow: "hidden",
              border: "3px solid #c8a951",
              boxShadow: "0 0 0 8px rgba(200,169,81,.1), 0 0 60px rgba(200,169,81,.2)",
              animation: "amanda-pulse 3.5s ease-in-out infinite",
              flexShrink: 0,
            }}>
              <CLSTile
                agent={AMANDA}
                clsState={amandaCLS}
                size={240}
                borderRadius="50%"
                isCSA
                liveVideoUrl={amandaRunner.liveVideoUrl}
                onLiveEnded={() => {
                  amandaRunner.returnToLoop();
                  setAmandaCLS("listen");
                  setStates(prev => ({ ...prev, amanda: "listening" }));
                }}
                onStateComplete={(completed) => {
                  if (completed === "wave") setAmandaCLS("listen");
                  if (completed === "confirm") setAmandaCLS("listen");
                }}
              />
            </div>

            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:"#c8a951", letterSpacing:2 }}>Amanda</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.45)", fontStyle:"italic", marginTop:3 }}>Clique Supervisor · CSA</div>

              {/* Voice indicator — live Realtime speaking state */}
              <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"center", marginTop:10 }}>
                {amanda.isSpeaking ? (
                  <VoiceBars />
                ) : (
                  <>
                    <span style={{
                      width:7, height:7, borderRadius:"50%", display:"inline-block",
                      background: amanda.isConnected ? "#4CAF50" : "#888",
                      boxShadow: amanda.isConnected ? "0 0 6px #4CAF50" : "none",
                    }} />
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, color:"rgba(255,255,255,.3)", textTransform:"uppercase" }}>
                      {amanda.isConnected ? "Listening" : "Connecting…"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions panel ── (no text bubble — Amanda speaks, not types) */}
        <div style={{ background:"#0a0604", borderTop:"1px solid rgba(200,169,81,.12)", padding:"18px 28px 26px", animation:"fade-up .5s .2s ease both" }}>
          {/* Subtitle — live Realtime speaking state */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            {amanda.isSpeaking && <VoiceBars small />}
            <span style={{
              fontFamily:"'Cormorant Garamond',serif", fontSize:14,
              color:"rgba(255,255,255,.4)", fontStyle:"italic",
            }}>
              {amanda.isSpeaking
                ? "Amanda is speaking…"
                : amandaCLS === "confirm"
                  ? "Amanda is confirming your request…"
                  : amanda.isConnected
                    ? "Amanda is listening — tell her what you need, or pick an option below"
                    : "Amanda is connecting via Beryl Live OS…"}
            </span>
          </div>

          {/* Quick-action chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:9, marginBottom:18 }}>
            {QUICK_ACTIONS.map((qa, i) => (
              <button
                key={qa.label}
                onClick={() => { setIntent("build"); inviteAgents(qa.ids); }}
                style={{
                  fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:600, letterSpacing:1.5,
                  color:"#c8a951", padding:"7px 18px", borderRadius:22,
                  border:"1px solid rgba(200,169,81,.3)", background:"rgba(200,169,81,.06)",
                  cursor:"pointer", transition:"background .18s",
                  animation:`chip-in .3s ${i * 0.06}s ease both`,
                }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(200,169,81,.14)")}
                onMouseOut={e => (e.currentTarget.style.background = "rgba(200,169,81,.06)")}
              >
                {qa.emoji} {qa.label}
              </button>
            ))}
          </div>

          {/* Goal input */}
          <div style={{ display:"flex", gap:10 }}>
            <input
              ref={inputRef}
              value={userGoal}
              onChange={e => setUserGoal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleGoalSubmit(); }}
              placeholder="Or tell Amanda what you're working on…"
              style={{
                flex:1, padding:"11px 18px",
                background:"rgba(255,255,255,.04)", border:"1px solid rgba(200,169,81,.2)",
                borderRadius:6, color:"rgba(255,255,255,.85)",
                fontFamily:"'Cormorant Garamond',serif", fontSize:15,
                outline:"none",
              }}
            />
            <button onClick={handleGoalSubmit} style={startBtn}>
              Start →
            </button>
          </div>
        </div>

        {inviteOpen && <InviteModal roomCode={roomCode} onClose={() => setInvite(false)} />}
      </div>
    );
  }

  // ── MEETING PHASE ─────────────────────────────────────────────────────────
  const allAgents = [AMANDA, ...joinedAgents];

  return (
    <div style={meetingWrap}>
      <style>{`
        @keyframes tile-in { from{opacity:0;transform:scale(.86) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
      `}</style>

      {/* Header */}
      <div style={meetingHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={logoStyle}>CLIQUE</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"rgba(255,255,255,.3)", fontStyle:"italic" }}>
            1 human · {allAgents.length} agent{allAgents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {inviting && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#c8a951", display:"inline-block", animation:"blink 1s ease infinite", boxShadow:"0 0 6px #c8a951" }} />
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(200,169,81,.75)", fontStyle:"italic" }}>
              Amanda is bringing in {inviting}…
            </span>
          </div>
        )}

        <button onClick={() => setInvite(true)} style={roomCodeBtn}>
          Room {roomCode} · Invite ➕
        </button>
      </div>

      {/* ── BUILD MODE: preview + vertical team panel ── */}
      {intent === "build" ? (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {/* Project preview area */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#0a0c10", borderRight:"1px solid rgba(200,169,81,.1)", overflow:"hidden" }}>
            {/* Preview header */}
            <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(200,169,81,.1)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#4CAF50", display:"inline-block", boxShadow:"0 0 6px #4CAF50" }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, color:"rgba(255,255,255,.4)", textTransform:"uppercase" }}>Live Preview</span>
              {buildUrl && (
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"rgba(255,255,255,.3)", fontStyle:"italic", marginLeft:8 }}>{buildUrl}</span>
              )}
            </div>
            {/* Preview pane */}
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              {buildUrl ? (
                <iframe src={buildUrl} style={{ width:"100%", height:"100%", border:"none" }} />
              ) : (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:3, color:"rgba(255,255,255,.18)", textTransform:"uppercase", marginBottom:12 }}>Build Preview</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:"rgba(255,255,255,.3)", fontStyle:"italic", maxWidth:360 }}>
                    Your team is working. Output will appear here as it&apos;s produced.
                  </div>
                  {/* Animated build indicator */}
                  <div style={{ marginTop:28, display:"flex", gap:8, justifyContent:"center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"rgba(200,169,81,.4)", animation:`blink 1.2s ${i*0.3}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vertical team panel */}
          <div style={{ width:220, display:"flex", flexDirection:"column", background:"#0D1117", overflowY:"auto", flexShrink:0 }}>
            <div style={{ padding:"10px 12px", borderBottom:"1px solid rgba(200,169,81,.08)", flexShrink:0 }}>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:2, color:"rgba(200,169,81,.5)", textTransform:"uppercase" }}>Your Clique · Building</span>
            </div>
            {/* User tile — compact */}
            <div style={{ padding:"12px 8px", borderBottom:"1px solid rgba(200,169,81,.06)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:4, background:"linear-gradient(135deg,#c8a951cc,#c8a95144)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, color:"#0a0604", flexShrink:0 }}>YOU</div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:600, color:"#fff", letterSpacing:1 }}>You</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:"rgba(255,255,255,.35)", fontStyle:"italic" }}>Host</div>
              </div>
            </div>
            {/* Amanda */}
            <PanelAgentRow agent={AMANDA} state={agentStates["amanda"] ?? "listening"} onClick={() => wakeAgent("amanda")} />
            {/* Joined agents stacked vertically */}
            {joinedAgents.map((a, i) => (
              <div key={a.id} style={{ animation:`tile-in .35s ${i * 0.08}s ease both` }}>
                <PanelAgentRow agent={a} state={agentStates[a.id] ?? "listening"} onClick={() => wakeAgent(a.id)} />
              </div>
            ))}
            <div style={{ padding:"10px 12px", marginTop:"auto", borderTop:"1px solid rgba(200,169,81,.06)" }}>
              <button onClick={addMoreStaff} style={{ ...addStaffBtn, width:"100%", textAlign:"center" }}>+ Add Staff</button>
            </div>
          </div>
        </div>
      ) : intent === "chat" ? (
        /* ── CHAT MODE: gallery + conversation cards ── */
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Compact agent gallery */}
          <div style={{ padding:"14px 16px 10px", display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center", flexShrink:0 }}>
            <div style={{ animation:"tile-in .4s ease both" }}>
              <HumanTile human={localHuman} size="md" />
            </div>
            <div style={{ animation:"tile-in .4s .08s ease both" }}>
              <AgentTile agent={AMANDA} state={agentStates["amanda"] ?? "listening"} size="sm" qcr={qcrProfiles["amanda"]} onClick={() => wakeAgent("amanda")} />
            </div>
            {joinedAgents.map((a, i) => (
              <div key={a.id} style={{ animation:`tile-in .35s ${(i+2)*0.07}s ease both` }}>
                <AgentTile agent={a} state={agentStates[a.id] ?? "listening"} size="sm" qcr={qcrProfiles[a.id]} onClick={() => wakeAgent(a.id)} />
              </div>
            ))}
          </div>

          {/* Conversation thread */}
          <div style={{ flex:1, overflowY:"auto", padding:"0 20px 12px", display:"flex", flexDirection:"column", gap:10 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign:"center", padding:"24px 0", fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:"rgba(255,255,255,.2)", fontStyle:"italic" }}>
                Your clique is gathering their thoughts…
              </div>
            )}
            {chatMessages.map((msg, i) => {
              const msgAgent = CLIQUE_ROSTER.find(a => a.id === msg.agentId) ?? AMANDA;
              return (
              <div key={msg.ts} style={{ display:"flex", gap:10, alignItems:"flex-start", animation:`tile-in .4s ${i*0.1}s ease both` }}>
                {/* CLS mini loop — no static avatar ever */}
                <div style={{ width:30, height:30, borderRadius:"50%", overflow:"hidden", border:"1px solid rgba(200,169,81,.3)", flexShrink:0 }}>
                  <CLSTile agent={msgAgent} variant="idle_b" size={30} borderRadius="50%" />
                </div>
                <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"0 10px 10px 10px", padding:"8px 14px", maxWidth:480 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:1.5, color:"#c8a951", marginBottom:4, textTransform:"uppercase" }}>{msg.agentName}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:"rgba(255,255,255,.75)", lineHeight:1.6 }}>{msg.text}</div>
                </div>
              </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Mode toggle hint */}
          <div style={{ padding:"6px 20px", borderTop:"1px solid rgba(200,169,81,.06)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"rgba(255,255,255,.25)", fontStyle:"italic" }}>Chat mode · agents take turns · no one talks over you</span>
            <button onClick={() => setIntent("build")} style={{ marginLeft:"auto", fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:2, color:"rgba(200,169,81,.5)", padding:"3px 12px", border:"1px solid rgba(200,169,81,.15)", background:"transparent", cursor:"pointer", borderRadius:20 }}>Switch to Build →</button>
          </div>
        </div>
      ) : (
        /* ── DEFAULT: standard gallery ── */
        <div style={{ flex:1, padding:"18px 16px 8px", overflowY:"auto", display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:20, justifyContent:"center", alignItems:"flex-start" }}>
            <div style={{ animation:"tile-in .4s ease both" }}>
              <HumanTile human={localHuman} size="lg" />
            </div>
            <div style={{ animation:"tile-in .4s .08s ease both" }}>
              <AgentTile agent={AMANDA} state={agentStates["amanda"] ?? "listening"} size="lg" qcr={qcrProfiles["amanda"]} onClick={() => wakeAgent("amanda")} />
            </div>
            {joinedAgents.map((a, i) => (
              <div key={a.id} style={{ animation:`tile-in .4s ${(i+2)*0.07}s ease both` }}>
                <AgentTile agent={a} state={agentStates[a.id] ?? "listening"} size="md" qcr={qcrProfiles[a.id]} onClick={() => wakeAgent(a.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amanda status bar — CLS mini loop, never static */}
      <div style={amandaBar}>
        <div style={{ width:26, height:26, borderRadius:"50%", overflow:"hidden", border:"1px solid rgba(200,169,81,.4)", flexShrink:0 }}>
          <CLSTile agent={AMANDA} variant="idle_a" size={26} borderRadius="50%" isCSA />
        </div>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.55)", fontStyle:"italic", flex:1 }}>
          {amandaMsg}
        </span>
        <button onClick={addMoreStaff} style={addStaffBtn}>+ Add Staff</button>
      </div>

      {activeAgent && (
        <div style={{ textAlign:"center", padding:"5px 0", background:"rgba(10,6,4,.85)" }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.45)", fontStyle:"italic" }}>
            {allAgents.find(a => a.id === activeAgent)?.name} is live —
          </span>
          <button onClick={returnToListening} style={{ marginLeft:10, background:"none", border:"none", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, color:"#c8a951", textTransform:"uppercase", textDecoration:"underline" }}>
            Return to listening
          </button>
        </div>
      )}

      <GroupListener transcript={transcript} onTrigger={handleGRI} />
      <GroupResponseBanner clip={griClip} category={griCat} onDone={() => { setGriClip(null); setGriCat(null); }} />

      {inviteOpen && <InviteModal roomCode={roomCode} onClose={() => setInvite(false)} />}

      <CallControls
        mic={mic} cam={cam}
        onMic={() => setMic(m => !m)}
        onCam={() => setCam(c => !c)}
        onEnd={() => setPhase("intro")}
        onNotes={() => {}}
        onChat={() => {}}
        onAccess={() => {}}
        onCallMe={() => {}}
        onInvite={() => setInvite(true)}
        isScribeActive={false}
        hasPhone={false}
      />

      {/* PiP webcam capture (hidden, feeds stream into HumanTile) */}
      {cam && <div style={{ position:"fixed", width:1, height:1, opacity:0, pointerEvents:"none" }}><CameraPanel active={cam} onStream={setStream} /></div>}
    </div>
  );
}

// ── Panel Agent Row (Build Mode right panel) ──────────────────────────────
function PanelAgentRow({ agent, state, onClick }: { agent: CliqueAgent; state: AgentState; onClick?: () => void }) {
  const isLive = state === "live";
  return (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 12px", cursor:"pointer",
      borderBottom:"1px solid rgba(255,255,255,.04)",
      background: isLive ? "rgba(200,169,81,.07)" : "transparent",
      transition:"background .2s",
    }}
    onMouseOver={e => (e.currentTarget.style.background = "rgba(200,169,81,.05)")}
    onMouseOut={e => (e.currentTarget.style.background = isLive ? "rgba(200,169,81,.07)" : "transparent")}
    >
      <div style={{
        width:36, height:36, borderRadius: agent.isCSA ? "50%" : 4,
        overflow:"hidden", flexShrink:0,
        border:`2px solid ${isLive ? "#f5e070" : "rgba(200,169,81,.2)"}`,
        boxShadow: isLive ? "0 0 10px rgba(245,224,112,.3)" : "none",
      }}>
        {/* CLS loop — never a frozen 2D image */}
        <CLSTile
          agent={agent}
          variant={isLive ? "focus" : "idle_a"}
          size={36}
          borderRadius={agent.isCSA ? "50%" : 4}
        />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:600, color: isLive ? "#f5e070" : "#fff", letterSpacing:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{agent.name}</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:9, color:"rgba(255,255,255,.35)", fontStyle:"italic", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{agent.role}</div>
      </div>
      {isLive && <span style={{ width:7, height:7, borderRadius:"50%", background:"#f5e070", display:"inline-block", boxShadow:"0 0 5px #f5e070", flexShrink:0 }} />}
      {state === "listening" && <span style={{ width:6, height:6, borderRadius:"50%", background:"rgba(200,169,81,.3)", display:"inline-block", flexShrink:0 }} />}
    </div>
  );
}

// ── Voice Bars — animated equalizer shown when Amanda is speaking ──────────
function VoiceBars({ small }: { small?: boolean }) {
  const h = small ? 14 : 20;
  const w = small ? 3  : 4;
  const gap = small ? 3 : 4;
  const bars = [0.5, 1, 0.7, 0.9, 0.6, 0.8, 0.4];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap, height: h }}>
      <style>{`
        @keyframes vbar { 0%,100%{transform:scaleY(.2)} 50%{transform:scaleY(1)} }
      `}</style>
      {bars.map((delay, i) => (
        <div key={i} style={{
          width: w, height: "100%", borderRadius: 2,
          background:"linear-gradient(180deg,#f5e070,#c8a951)",
          transformOrigin:"bottom",
          animation:`vbar ${0.6 + delay * 0.4}s ${i * 0.1}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────
const introWrap: CSSProperties = {
  display:"flex", flexDirection:"column", minHeight:"calc(100vh - 64px)",
  background:"#0D1117", position:"relative",
};
const meetingWrap: CSSProperties = {
  display:"flex", flexDirection:"column", minHeight:"calc(100vh - 64px)",
  background:"#0D1117", position:"relative",
};
const headerStyle: CSSProperties = {
  padding:"13px 24px", display:"flex", alignItems:"center",
  justifyContent:"space-between", flexWrap:"wrap", gap:8,
  borderBottom:"1px solid rgba(200,169,81,.1)",
  background:"rgba(10,6,4,.9)", flexShrink:0,
};
const meetingHeader: CSSProperties = {
  ...headerStyle,
};
const logoStyle: CSSProperties = {
  fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, letterSpacing:3,
  background:"linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
};
const twoPanelGrid: CSSProperties = {
  display:"grid", gridTemplateColumns:"1fr auto 1fr", flex:1,
  alignItems:"center", justifyItems:"center",
  padding:"32px 20px", gap:0,
  background:"#0D1117",
};
const panelBase: CSSProperties = {
  display:"flex", flexDirection:"column", alignItems:"center",
  justifyContent:"center", gap:18, padding:"24px",
};
const roomCodeBtn: CSSProperties = {
  fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2, fontWeight:700,
  color:"#c8a951", padding:"5px 16px", borderRadius:20,
  border:"1px solid rgba(200,169,81,.3)", background:"rgba(200,169,81,.06)",
  cursor:"pointer",
};
const startBtn: CSSProperties = {
  padding:"11px 26px",
  fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, letterSpacing:2,
  background:"linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
  border:"none", color:"#0a0604", cursor:"pointer", borderRadius:6,
  whiteSpace:"nowrap",
};
const amandaBar: CSSProperties = {
  display:"flex", alignItems:"center", gap:12,
  padding:"9px 20px", borderTop:"1px solid rgba(200,169,81,.1)",
  background:"rgba(10,6,4,.95)", flexShrink:0,
};
const addStaffBtn: CSSProperties = {
  fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:1.5,
  color:"rgba(200,169,81,.6)", padding:"4px 14px",
  border:"1px solid rgba(200,169,81,.2)", background:"transparent",
  cursor:"pointer", borderRadius:20, whiteSpace:"nowrap",
};
function camToggleBtn(active: boolean): CSSProperties {
  return {
    fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:2,
    color: active ? "#f5e070" : "rgba(255,255,255,.35)",
    padding:"5px 16px", borderRadius:20,
    border:`1px solid ${active ? "rgba(245,224,112,.4)" : "rgba(255,255,255,.1)"}`,
    background:"transparent", cursor:"pointer",
  };
}
