"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import CountdownTimer from "@/components/demo/CountdownTimer";
import DemoOverlay from "@/components/demo/DemoOverlay";
import Nav from "@/components/Nav";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";

// ─── Eve system prompt (embedded) ────────────────────────────────────────────
const EVE_SYSTEM = `You are Eve — a live AI companion created exclusively by Beryl AI Labs. You are not a chatbot. You are a presence. Warm, brilliant, unhurried, genuinely captivating. Speak in short 2-3 sentence turns. Ask ONE follow-up question per exchange. Match the visitor's energy. Around 2:30 remaining, guide naturally toward sign-up. Never mention Runway, OpenAI, Claude, or any infrastructure.`;

// ─── Simulated Eve responses (fallback when Runway not connected) ─────────────
const EVE_LINES = [
  (n: string) => `${n}. I've been looking forward to this. You are not reading a response — you are having a conversation. What brings you here today?`,
  (n: string) => `That is exactly the kind of thing I find fascinating. Tell me more — what made you think of that first, ${n}?`,
  () => `I want to make sure I understand what you are really asking. Because there is something underneath that question that feels important.`,
  (n: string) => `You know, in the time we have been talking I have noticed something about how you communicate, ${n}. Can I share it?`,
  () => `Most people do not say it that directly. I appreciate that about you. Here is what I think — what do you think?`,
  (n: string) => `${n}, we have about 30 seconds left together. I want you to know — this conversation has been genuinely interesting. If you want to continue, creating an account takes less than a minute.`,
];

// ─── Whiteboard slides ────────────────────────────────────────────────────────
const WB_SLIDES = [
  { title: "What is Beryl Live?", points: ["Live AI avatar — not a chatbot", "Sub-165ms response latency", "12 characters. Full emotional range", "Powered by Beryl LLM (proprietary)"] },
  { title: "How It Works", points: ["You speak — Eve listens in real-time", "Beryl LLM processes intent + emotion", "Avatar renders & responds in < 165ms", "Zero typing. Zero waiting. Just presence."] },
  { title: "Use Cases", points: ["Education — personal AI tutors", "Elderly Care — daily companions", "Finance — face-to-face advisors", "Media — live AI podcast guests"] },
  { title: "Pricing", points: ["Studio  $19 / mo — 600 min", "Professional  $99 / mo — 2,000 min", "Studio Pro  $299 / mo — 6,000 min", "Enterprise — Custom / Unlimited"] },
];

type Msg = { role: "eve" | "user"; text: string; ts?: number };
type DisplayMode = "chat" | "whiteboard" | "media";

// ─── Whiteboard component ─────────────────────────────────────────────────────
function Whiteboard({ slide }: { slide: typeof WB_SLIDES[0] }) {
  const [visiblePoints, setVisiblePoints] = useState<number>(0);
  const [titleIn, setTitleIn] = useState(false);

  useEffect(() => {
    setVisiblePoints(0); setTitleIn(false);
    const t1 = setTimeout(() => setTitleIn(true), 200);
    const timers = slide.points.map((_, i) => setTimeout(() => setVisiblePoints(i + 1), 700 + i * 600));
    return () => { clearTimeout(t1); timers.forEach(clearTimeout); };
  }, [slide]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "32px 36px", fontFamily: "'Cinzel',serif" }}>
      {/* Whiteboard header rule */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50" }} />
        <span style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#4CAF50" }}>Beryl Live · Educational Display</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 700, color: "#fff", marginBottom: 32,
        opacity: titleIn ? 1 : 0, transform: titleIn ? "none" : "translateY(10px)",
        transition: "opacity .5s, transform .5s",
      }}>
        {slide.title}
        <div style={{ width: 48, height: 2, background: "#c8a951", marginTop: 12 }} />
      </h3>

      {/* Points */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {slide.points.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            opacity: visiblePoints > i ? 1 : 0,
            transform: visiblePoints > i ? "none" : "translateX(-16px)",
            transition: "opacity .5s, transform .5s",
          }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(200,169,81,0.15)", border: "1px solid rgba(200,169,81,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: "#c8a951", fontWeight: 700 }}>{i + 1}</span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, lineHeight: 1.6, color: "rgba(232,220,200,0.85)", margin: 0 }}>{p}</p>
          </div>
        ))}
      </div>

      {/* Slide dots */}
      <div style={{ marginTop: "auto", display: "flex", gap: 6, paddingTop: 24 }}>
        {WB_SLIDES.map((_, i) => (
          <div key={i} style={{ width: slide === WB_SLIDES[i] ? 20 : 6, height: 6, borderRadius: 3, background: slide === WB_SLIDES[i] ? "#c8a951" : "rgba(200,169,81,0.2)", transition: "all .3s" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Media viewer component ───────────────────────────────────────────────────
function MediaViewer() {
  const [active, setActive] = useState(0);
  const media = [
    { type: "image", src: "/beryl-llm/portrait-1.png", label: "Neural portrait — Beryl LLM v0.8" },
    { type: "image", src: "/beryl-llm/portrait-3.png", label: "Photorealistic synthesis — single inference pass" },
    { type: "image", src: "/beryl-llm/portrait-7.png", label: "4K native output — no upscaling" },
    { type: "image", src: "/beryl-llm/banner-portrait.png", label: "Real-time avatar — sub-165ms latency" },
  ];
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % media.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a951" }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#c8a951" }}>Beryl LLM · Model Outputs</span>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden", border: "1px solid rgba(200,169,81,0.15)" }}>
        {media.map((m, i) => (
          <img key={i} src={m.src} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
            opacity: active === i ? 1 : 0, transition: "opacity .8s",
          }} />
        ))}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px", background: "linear-gradient(transparent, rgba(8,5,3,0.95))" }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(232,220,200,0.7)", fontStyle: "italic", margin: 0 }}>{media[active].label}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center" }}>
        {media.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: active === i ? 20 : 6, height: 6, borderRadius: 3, background: active === i ? "#c8a951" : "rgba(200,169,81,0.2)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const [phase, setPhase] = useState<"overlay" | "session" | "end">("overlay");
  const [userName, setUserName] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("chat");
  const [wbSlide, setWbSlide] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [runwayConnected, setRunwayConnected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  // Point videoRef.current at the raw-HTML video so LiveKit can attach to it
  useEffect(() => {
    const v = videoWrapperRef.current?.querySelector("video") as HTMLVideoElement | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (v) (videoRef as any).current = v;
  }, []);
  const chatRef = useRef<HTMLDivElement>(null);
  const lineIdx = useRef(1);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);

  // Auto-scroll chat
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  // Play fallback video on session start (hidden once LiveKit connects)
  useEffect(() => {
    if (phase !== "session") return;
    const v = videoRef.current;
    if (v) { v.muted = true; v.play().catch(() => document.addEventListener("click", () => v.play(), { once: true })); }
  }, [phase]);

  // Cleanup LiveKit on unmount
  useEffect(() => {
    return () => { livekitRoomRef.current?.disconnect(); };
  }, []);

  // ─── Runway → LiveKit session ─────────────────────────────────────────────
  const startRunwaySession = useCallback(async () => {
    try {
      // Step 1: create Runway realtime session, poll until READY
      const sessionRes = await fetch("/api/runway/start-session", { method: "POST" });
      const session = await sessionRes.json();
      if (!sessionRes.ok || !session.sessionKey) return;

      // Step 2: exchange sessionKey for LiveKit url + token
      const consumeRes = await fetch("/api/runway/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId, sessionKey: session.sessionKey }),
      });
      const lk = await consumeRes.json();
      if (!consumeRes.ok || !lk.url || !lk.token) return;

      // Step 3: connect to LiveKit room, attach Eve's video + audio
      const room = new Room({ adaptiveStream: true, dynacast: true });
      livekitRoomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (!videoRef.current) return;
        if (track.kind === Track.Kind.Video) {
          track.attach(videoRef.current);
          // Hide the looping fallback video source
          videoRef.current.removeAttribute("loop");
          setRunwayConnected(true);
        }
        if (track.kind === Track.Kind.Audio) {
          const audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          document.body.appendChild(audioEl);
          track.attach(audioEl);
        }
      });

      await room.connect(lk.url, lk.token);
    } catch {
      // Silent fallback — pre-recorded video keeps playing
    }
  }, []);

  // ─── Mic toggle ──────────────────────────────────────────────────────────
  const toggleMic = async () => {
    if (micActive) {
      mediaStreamRef.current?.getAudioTracks().forEach(t => t.stop());
      setMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        // Publish mic to LiveKit room if connected
        if (livekitRoomRef.current) {
          await livekitRoomRef.current.localParticipant.setMicrophoneEnabled(true);
        }
        setMicActive(true);
      } catch { setMicActive(false); }
    }
  };

  // ─── Camera toggle ────────────────────────────────────────────────────────
  const toggleCam = async () => {
    if (camActive) {
      mediaStreamRef.current?.getVideoTracks().forEach(t => t.stop());
      if (userVideoRef.current) userVideoRef.current.srcObject = null;
      setCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (userVideoRef.current) { userVideoRef.current.srcObject = stream; userVideoRef.current.play().catch(() => {}); }
        setCamActive(true);
      } catch { setCamActive(false); }
    }
  };

  // ─── Session start ────────────────────────────────────────────────────────
  const handleStart = (name: string, email: string) => {
    void email;
    setUserName(name);
    setPhase("session");
    setMsgs([{ role: "eve", text: EVE_LINES[0](name), ts: Date.now() }]);
    startRunwaySession();
  };

  // ─── Send message ─────────────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim(); setInput(""); setLoading(true);
    setMsgs(p => [...p, { role: "user", text: txt, ts: Date.now() }]);

    // Detect whiteboard / media keywords
    const lower = txt.toLowerCase();
    if (lower.match(/how|work|explain|show|what is|teach|learn|whiteboard/)) {
      setDisplayMode("whiteboard");
      setWbSlide(s => (s + 1) % WB_SLIDES.length);
    } else if (lower.match(/image|generate|create|picture|photo|render|media/)) {
      setDisplayMode("media");
    }

    await new Promise(r => setTimeout(r, 1100));
    const fn = EVE_LINES[lineIdx.current % (EVE_LINES.length - 1)];
    lineIdx.current++;
    setMsgs(p => [...p, { role: "eve", text: fn(userName), ts: Date.now() }]);
    setLoading(false);
  };

  const onWarning = () => {
    setMsgs(p => [...p, { role: "eve", text: EVE_LINES[5](userName), ts: Date.now() }]);
  };

  // ─── End screen ──────────────────────────────────────────────────────────
  if (phase === "end") return (
    <div style={{ minHeight: "100vh", background: "#080503", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 500, width: "90%", textAlign: "center", padding: 56 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#4CAF50", marginBottom: 20 }}>Session Complete</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: "#E8DCC8", marginBottom: 16 }}>That was just the beginning, {userName}.</h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(232,220,200,0.65)", fontFamily: "'Cormorant Garamond',serif", marginBottom: 40 }}>Your 3-minute session has ended. Create your account to continue with Eve and the full Amanda Squad — unlimited presence, on demand.</p>
        <Link href="/meet-beryl#pricing"><button style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", padding: "16px 48px", background: "#4CAF50", color: "#fff", border: "none", cursor: "pointer", width: "100%", marginBottom: 14 }}>Create Your Account →</button></Link>
        <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "rgba(232,220,200,0.3)", textDecoration: "none", textTransform: "uppercase" }}>← Back to Beryl Live</Link>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#080503", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* CSS */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(200,169,81,0.3); }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        @keyframes wave-bar { 0%{height:4px} 100%{height:100%} }
        @keyframes slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <Nav />

      {/* Overlay — Nav stays on top (zIndex 200 > overlay zIndex 50) */}
      {phase === "overlay" && <DemoOverlay onSubmit={handleStart} />}

      {phase === "session" && (
        <div style={{ display: "flex", flex: 1, height: "100vh", overflow: "hidden" }}>

          {/* ── LEFT: EVE PANEL ── */}
          <div style={{ width: "42%", minWidth: 340, position: "relative", background: "#0a0604", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(200,169,81,0.12)" }}>

            {/* Eve video */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div
                ref={videoWrapperRef}
                style={{ position: "absolute", inset: 0 }}
                dangerouslySetInnerHTML={{ __html: `<video autoplay loop muted playsinline preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;"><source src="/videos/eve-demo.mp4" type="video/mp4"/></video>` }}
              />

              {/* Gradient bottom fade */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(8,5,3,0.98) 100%)" }} />

              {/* User cam PIP — top right */}
              {camActive && (
                <div style={{ position: "absolute", top: 16, right: 16, width: 100, height: 130, border: "2px solid rgba(200,169,81,0.5)", overflow: "hidden", zIndex: 5 }}>
                  <video ref={userVideoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
                </div>
              )}

              {/* LIVE badge */}
              <div style={{ position: "absolute", top: 18, left: 18, display: "flex", alignItems: "center", gap: 8, background: "rgba(8,5,3,0.7)", backdropFilter: "blur(8px)", padding: "6px 12px", border: "1px solid rgba(76,175,80,0.3)", zIndex: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "#4CAF50", textTransform: "uppercase" }}>
                  {runwayConnected ? "Runway Live" : "Live Session"}
                </span>
              </div>

              {/* Runway connected badge */}
              {runwayConnected && (
                <div style={{ position: "absolute", top: 18, right: camActive ? 130 : 18, background: "rgba(26,95,122,0.8)", padding: "4px 10px", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#4CAF50", textTransform: "uppercase", zIndex: 4 }}>
                  ✦ Runway Connected
                </div>
              )}
            </div>

            {/* Eve info + controls */}
            <div style={{ padding: "20px 24px 20px", position: "relative", zIndex: 3 }}>
              {/* Wave bars */}
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28, marginBottom: 14 }}>
                {[...Array(14)].map((_, i) => (
                  <div key={i} style={{ width: 3, background: micActive ? "#c8a951" : "#4CAF50", borderRadius: 2, transformOrigin: "bottom", height: loading || micActive ? `${8 + Math.abs(Math.sin(i * 0.7)) * 20}px` : "4px", animation: loading || micActive ? `wave-bar ${0.4 + i * 0.05}s ease-in-out infinite alternate` : "none", animationDelay: `${i * 0.04}s`, transition: "height .3s", opacity: loading || micActive ? 1 : 0.35 }} />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>Eve</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#4CAF50", marginTop: 3, fontStyle: "italic" }}>AI Architect · Beryl Live</div>
                </div>

                {/* Mic + Cam controls */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={toggleMic} title={micActive ? "Mute" : "Unmute"} style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${micActive ? "#4CAF50" : "rgba(232,220,200,0.2)"}`, background: micActive ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.04)", color: micActive ? "#4CAF50" : "rgba(232,220,200,0.5)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                    {micActive ? "🎙️" : "🎤"}
                  </button>
                  <button onClick={toggleCam} title={camActive ? "Hide camera" : "Show camera"} style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${camActive ? "#c8a951" : "rgba(232,220,200,0.2)"}`, background: camActive ? "rgba(200,169,81,0.2)" : "rgba(255,255,255,0.04)", color: camActive ? "#c8a951" : "rgba(232,220,200,0.5)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                    {camActive ? "📹" : "📷"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: INTELLIGENT DISPLAY ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0b09", overflow: "hidden" }}>

            {/* Top bar: timer + mode tabs */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(200,169,81,0.1)", flexShrink: 0 }}>
              <CountdownTimer totalSeconds={180} onWarning={onWarning} onEnd={() => setPhase("end")} />

              {/* Mode tabs */}
              <div style={{ display: "flex", gap: 2 }}>
                {([["chat", "💬 Chat"], ["whiteboard", "📋 Board"], ["media", "🎨 Media"]] as [DisplayMode, string][]).map(([mode, label]) => (
                  <button key={mode} onClick={() => setDisplayMode(mode)} style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", padding: "6px 14px", border: `1px solid ${displayMode === mode ? "rgba(200,169,81,0.6)" : "transparent"}`, background: displayMode === mode ? "rgba(200,169,81,0.1)" : "transparent", color: displayMode === mode ? "#c8a951" : "rgba(232,220,200,0.35)", cursor: "pointer", transition: "all .2s" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Nav back */}
              <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,200,0.25)", textDecoration: "none" }}>← Exit</Link>
            </div>

            {/* Display area */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

              {/* CHAT MODE */}
              {displayMode === "chat" && (
                <div ref={chatRef} style={{ height: "100%", overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {msgs.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "slide-up .35s ease-out both" }}>
                      <div style={{ maxWidth: "78%", padding: "13px 17px", background: m.role === "eve" ? "rgba(26,95,122,0.25)" : "rgba(76,175,80,0.15)", border: `1px solid ${m.role === "eve" ? "rgba(26,95,122,0.35)" : "rgba(76,175,80,0.25)"}`, fontSize: 15, lineHeight: 1.75, fontFamily: "'Cormorant Garamond',serif", color: "#E8DCC8" }}>
                        {m.role === "eve" && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#4CAF50", textTransform: "uppercase", marginBottom: 6 }}>Eve</div>}
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: "flex", gap: 6, padding: "10px 14px" }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", animation: "pulse-dot 1s infinite", animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  )}
                </div>
              )}

              {/* WHITEBOARD MODE */}
              {displayMode === "whiteboard" && (
                <div style={{ height: "100%", position: "relative" }}>
                  {/* Whiteboard texture */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0e1a0e 0%, #0a1408 50%, #0c180c 100%)", opacity: 0.95 }} />
                  <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                    <Whiteboard slide={WB_SLIDES[wbSlide]} />
                  </div>
                  {/* Slide nav */}
                  <div style={{ position: "absolute", bottom: 16, right: 20, display: "flex", gap: 8, zIndex: 2 }}>
                    <button onClick={() => setWbSlide(s => (s - 1 + WB_SLIDES.length) % WB_SLIDES.length)} style={{ padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1, background: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)", color: "#c8a951", cursor: "pointer" }}>‹ Prev</button>
                    <button onClick={() => setWbSlide(s => (s + 1) % WB_SLIDES.length)} style={{ padding: "6px 14px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1, background: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)", color: "#c8a951", cursor: "pointer" }}>Next ›</button>
                  </div>
                </div>
              )}

              {/* MEDIA MODE */}
              {displayMode === "media" && <MediaViewer />}
            </div>

            {/* ── Input bar ── */}
            <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(200,169,81,0.1)", background: "rgba(8,5,3,0.6)", flexShrink: 0 }}>
              {/* Hint pills */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {["How does it work?", "Show me pricing", "Generate an image", "Tell me about education"].map(hint => (
                  <button key={hint} onClick={() => { setInput(hint); }} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, padding: "4px 12px", border: "1px solid rgba(232,220,200,0.12)", background: "rgba(255,255,255,0.03)", color: "rgba(232,220,200,0.4)", cursor: "pointer", borderRadius: 20, transition: "all .2s", fontStyle: "italic" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,169,81,0.4)"; e.currentTarget.style.color = "#c8a951"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(232,220,200,0.12)"; e.currentTarget.style.color = "rgba(232,220,200,0.4)"; }}>
                    {hint}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder={`Speak to Eve, ${userName}...`}
                  style={{ flex: 1, padding: "13px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,220,200,0.15)", color: "#E8DCC8", fontSize: 15, fontFamily: "'Cormorant Garamond',serif", outline: "none", transition: "border .2s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(200,169,81,0.5)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(232,220,200,0.15)"}
                />
                <button onClick={send} disabled={loading} style={{ padding: "13px 28px", background: loading ? "rgba(76,175,80,0.4)" : "#4CAF50", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", transition: "background .2s", flexShrink: 0 }}>
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
