"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "@/components/Nav";

const FALLBACK_LINES = [
  (n: string) => `${n}, I've been looking forward to this. You're not reading a response — you're having a conversation. What brings you here today?`,
  (n: string) => `That's exactly the kind of thing I find fascinating. Tell me more — what made you think of that first, ${n}?`,
  () => `I want to make sure I understand what you're really asking. There's something underneath that question that feels important.`,
  (n: string) => `In the time we've been talking I've noticed something about how you communicate, ${n}. Can I share it?`,
  () => `Most people don't say it that directly. I appreciate that. Here's what I think — what do you think?`,
  (n: string) => `${n}, we have about 30 seconds left. This conversation has been genuinely interesting. Want to continue?`,
];

const EVE_PORTRAIT = "/characters/EVE_SHIELD.png";

type Msg   = { role: "eve" | "user"; text: string };
type Phase = "overlay" | "session" | "end";
type AvatarState = "idle" | "thinking" | "speaking";

export default function TheGymPage() {
  const [phase,       setPhase]       = useState<Phase>("overlay");
  const [userName,    setUserName]    = useState("");
  const [nameInput,   setNameInput]   = useState("");
  const [msgs,        setMsgs]        = useState<Msg[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [timeLeft,    setTimeLeft]    = useState(180);
  const [micActive,    setMicActive]    = useState(false);
  const [pipelineTag,  setPipelineTag]  = useState("Grok-3 · Eve-TTS · Live");
  const [notice,       setNotice]       = useState("");
  const [videoSrc,     setVideoSrc]     = useState<string | null>(null);

  const audioRef    = useRef<HTMLAudioElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const chatRef    = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const lineIdx    = useRef(1);
  const srRef      = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (phase !== "session") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setPhase("end"); return 0; }
        if (t === 30) eveRespond("30 seconds left — want to continue with a full account?", true);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const eveRespond = useCallback(async (userText: string, scripted = false) => {
    setAvatarState("thinking");
    setNotice("");

    try {
      const res = await fetch("/api/hf/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scripted ? "" : userText,
          history: historyRef.current.slice(-8),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "speak failed");

      const reply: string = data.reply
        ?? FALLBACK_LINES[lineIdx.current % (FALLBACK_LINES.length - 1)](userName);
      lineIdx.current++;

      if (!scripted) historyRef.current.push({ role: "user", content: userText });
      historyRef.current.push({ role: "assistant", content: reply });
      setMsgs(p => [...p, { role: "eve", text: reply }]);

      // ── Playback: eve-tts audio + speaking loop video (simultaneous) ────────
      if (data.audioUrl) {
        // Show the pre-baked talking loop immediately
        if (data.speakingLoop) setVideoSrc(data.speakingLoop);
        setAvatarState("speaking");

        const audio = audioRef.current ?? new Audio();
        audio.src = data.audioUrl;
        audio.onplay  = () => { setAvatarState("speaking"); };
        audio.onended = () => {
          setAvatarState("idle");
          setVideoSrc(null);
        };
        audio.onerror = () => {
          // fallback to browser TTS if audio URL fails
          const utt = new SpeechSynthesisUtterance(reply);
          utt.rate = 0.91; utt.pitch = 1.08;
          utt.onstart = () => setAvatarState("speaking");
          utt.onend   = () => { setAvatarState("idle"); setVideoSrc(null); };
          window.speechSynthesis.speak(utt);
        };
        audio.play().catch(() => {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(reply);
          utt.rate = 0.91; utt.pitch = 1.08;
          utt.onstart = () => setAvatarState("speaking");
          utt.onend   = () => { setAvatarState("idle"); setVideoSrc(null); };
          window.speechSynthesis.speak(utt);
        });
        setPipelineTag("✓ Grok-3 · Eve-TTS (Ava) · Live");
      } else {
        // Browser TTS fallback
        window.speechSynthesis?.cancel();
        const utt = new SpeechSynthesisUtterance(reply);
        utt.rate = 0.91; utt.pitch = 1.08;
        const voices = window.speechSynthesis?.getVoices() ?? [];
        const pick = voices.find(v => /zira|samantha|victoria|karen|moira|fiona|tessa|veena|nicky/i.test(v.name))
          ?? voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("female"))
          ?? voices.find(v => v.lang.startsWith("en"));
        if (pick) utt.voice = pick;
        utt.onstart = () => setAvatarState("speaking");
        utt.onend   = () => setAvatarState("idle");
        window.speechSynthesis?.speak(utt);
        setPipelineTag("Grok-3 · Browser TTS (fallback)");
      }

    } catch (e) {
      const fb = FALLBACK_LINES[lineIdx.current % (FALLBACK_LINES.length - 1)](userName);
      lineIdx.current++;
      setMsgs(p => [...p, { role: "eve", text: fb }]);
      setNotice(`Pipeline: ${String(e).slice(0, 80)}`);
      setAvatarState("idle");
    }
    setLoading(false);
  }, [userName]);

  const handleStart = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    setUserName(name);
    setPhase("session");
    const greeting = FALLBACK_LINES[0](name);
    setMsgs([{ role: "eve", text: greeting }]);
    historyRef.current = [{ role: "assistant", content: greeting }];
    // Kick off first real response immediately
    setTimeout(() => eveRespond(greeting, false), 400);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput("");
    setLoading(true);
    setMsgs(p => [...p, { role: "user", text: txt }]);
    await eveRespond(txt);
  };

  const toggleMic = () => {
    if (micActive) { srRef.current?.stop(); setMicActive(false); return; }
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
            ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { setNotice("Speech recognition not supported"); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onresult = e => { setInput(e.results[0][0].transcript); };
    r.onend = () => setMicActive(false);
    r.start(); srRef.current = r; setMicActive(true);
  };

  // ── Overlay ───────────────────────────────────────────────────────────────
  if (phase === "overlay") return (
    <div style={{ minHeight: "100vh", background: "#080503", display: "flex", flexDirection: "column" }}>
      <Nav />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, color: "#a855f7", textTransform: "uppercase", marginBottom: 14 }}>
            The Gym · No-Runway Pipeline
          </div>
          <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, color: "#E8DCC8", marginBottom: 10, lineHeight: 1.2 }}>
            Meet Eve.
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "rgba(232,220,200,.55)", marginBottom: 10, lineHeight: 1.7 }}>
            Live AI conversation — powered by Grok-3 + OpenAI TTS. No Runway. No per-second billing.
          </p>
          <div style={{ border: "1px solid rgba(168,85,247,.2)", background: "rgba(168,85,247,.04)", padding: "8px 14px", marginBottom: 30, fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.6)", textAlign: "left" }}>
            Grok-3 Mini · OpenAI TTS nova · ~$0.003/session
          </div>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="Your first name"
            autoFocus
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(200,169,81,.25)", color: "#E8DCC8", fontFamily: "'Cinzel',serif", fontSize: 14, outline: "none", marginBottom: 10 }}
          />
          <button onClick={handleStart} disabled={!nameInput.trim()} style={{
            width: "100%", padding: "16px", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
            background: nameInput.trim() ? "linear-gradient(135deg,#4a1a8a,#a855f7)" : "rgba(255,255,255,.05)",
            color: nameInput.trim() ? "#fff" : "rgba(255,255,255,.2)", border: "none", cursor: nameInput.trim() ? "pointer" : "default",
          }}>Begin Session →</button>
          <p style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(232,220,200,.2)", marginTop: 14 }}>
            3-min free session · $123 cheaper than Runway per hour
          </p>
        </div>
      </div>
    </div>
  );

  // ── End ───────────────────────────────────────────────────────────────────
  if (phase === "end") return (
    <div style={{ minHeight: "100vh", background: "#080503", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 500, textAlign: "center", padding: 56 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: "#a855f7", marginBottom: 20 }}>Session Complete</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "#E8DCC8", marginBottom: 16 }}>That was just the beginning, {userName}.</h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, lineHeight: 1.8, color: "rgba(232,220,200,.65)", marginBottom: 40 }}>
          Your 3-minute session has ended. Create your account to continue with Eve and the full Clique.
        </p>
        <a href="/#pricing"><button style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, padding: "16px 48px", background: "#a855f7", color: "#fff", border: "none", cursor: "pointer", width: "100%", marginBottom: 14 }}>Create Your Account →</button></a>
        <a href="/" style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "rgba(232,220,200,.3)", textDecoration: "none" }}>← Back to Beryl Live</a>
      </div>
    </div>
  );

  // ── Session ───────────────────────────────────────────────────────────────
  const isSpeaking = avatarState === "speaking";
  const isThinking = avatarState === "thinking";

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#080503", display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3)}

        /* ── LIVING PORTRAIT ANIMATIONS ── */

        /* Idle: continuous breathing + gentle sway */
        @keyframes breathe {
          0%,100% { transform: scale(1.06) translateY(0px) translateX(0px) rotate(0deg); }
          30%      { transform: scale(1.075) translateY(-4px) translateX(1px) rotate(0.15deg); }
          60%      { transform: scale(1.065) translateY(-2px) translateX(-1px) rotate(-0.1deg); }
        }

        /* Blink: very brief brightness flash every ~5s */
        @keyframes blink {
          0%,94%,100% { filter: brightness(1) saturate(1.05); }
          96%          { filter: brightness(0.78) saturate(0.9) blur(0.3px); }
          97%          { filter: brightness(1) saturate(1.05); }
        }

        /* Speaking: energetic motion — more pronounced head movement */
        @keyframes speaking {
          0%   { transform: scale(1.08) translateY(-2px) translateX(0px) rotate(-0.2deg); }
          20%  { transform: scale(1.10) translateY(-6px) translateX(2px) rotate(0.4deg); }
          40%  { transform: scale(1.08) translateY(-3px) translateX(-1px) rotate(-0.15deg); }
          60%  { transform: scale(1.09) translateY(-7px) translateX(1px) rotate(0.3deg); }
          80%  { transform: scale(1.085) translateY(-4px) translateX(-2px) rotate(-0.2deg); }
          100% { transform: scale(1.08) translateY(-2px) translateX(0px) rotate(-0.2deg); }
        }

        /* Thinking: slow tilt left */
        @keyframes thinking {
          0%,100% { transform: scale(1.06) translateY(-1px) rotate(-0.5deg) translateX(-3px); }
          50%      { transform: scale(1.065) translateY(-4px) rotate(-0.8deg) translateX(-5px); }
        }

        /* Glow pulse behind portrait when speaking */
        @keyframes glow-pulse {
          0%,100% { opacity: 0.35; }
          50%      { opacity: 0.7; }
        }

        /* Audio waveform bars */
        @keyframes bar1 { 0%,100%{height:4px}  25%{height:18px} 50%{height:8px}  75%{height:22px} }
        @keyframes bar2 { 0%,100%{height:8px}  25%{height:24px} 50%{height:14px} 75%{height:10px} }
        @keyframes bar3 { 0%,100%{height:14px} 25%{height:6px}  50%{height:26px} 75%{height:16px} }
        @keyframes bar4 { 0%,100%{height:6px}  25%{height:20px} 50%{height:10px} 75%{height:28px} }
        @keyframes bar5 { 0%,100%{height:10px} 25%{height:8px}  50%{height:22px} 75%{height:6px}  }

        /* Think dots */
        @keyframes think-dot { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
      `}</style>

      <Nav />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 370px", overflow: "hidden" }}>

        {/* ── Avatar Panel ── */}
        <div style={{ position: "relative", background: "#04020a", overflow: "hidden" }}>

          {/* Background glow — pulses when speaking */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: isSpeaking
              ? "radial-gradient(ellipse 80% 90% at 50% 60%, rgba(168,85,247,.18) 0%, transparent 70%)"
              : "radial-gradient(ellipse 60% 70% at 50% 60%, rgba(200,169,81,.06) 0%, transparent 60%)",
            animation: isSpeaking ? "glow-pulse 0.9s ease-in-out infinite" : "none",
            transition: "background 1s",
          }} />

          {/* Speaking loop video — shown while Eve talks */}
          {videoSrc && (
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: "absolute", inset: 0, zIndex: 1,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "top center",
              }}
            />
          )}

          {/* Still portrait — shown when idle / thinking */}
          <img
            src={EVE_PORTRAIT}
            alt="Eve"
            style={{
              position: "absolute", inset: 0, zIndex: videoSrc ? 0 : 1,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
              transformOrigin: "50% 30%",
              animation: isThinking
                ? "thinking 2.2s ease-in-out infinite, blink 5.3s linear infinite"
                : "breathe 4.2s ease-in-out infinite, blink 5.3s linear infinite",
              transition: "opacity 0.3s",
              opacity: videoSrc ? 0 : 1,
              willChange: "transform, filter",
            }}
          />

          {/* Subtle vignette overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 55%, rgba(4,2,10,.85) 100%)",
            pointerEvents: "none",
          }} />

          {/* Bottom gradient for text readability */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 3,
            background: "linear-gradient(to top, rgba(4,2,10,.95), transparent)",
            pointerEvents: "none",
          }} />

          <audio ref={audioRef} style={{ display: "none" }} />

          {/* State badge */}
          <div style={{
            position: "absolute", top: 16, left: 16, zIndex: 10,
            padding: "5px 12px",
            background: "rgba(4,2,10,.88)", backdropFilter: "blur(10px)",
            border: `1px solid ${isSpeaking ? "rgba(168,85,247,.55)" : isThinking ? "rgba(200,169,81,.45)" : "rgba(255,255,255,.1)"}`,
            display: "flex", alignItems: "center", gap: 8,
            transition: "border-color 0.4s",
          }}>
            {isThinking && [0,1,2].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c8a951", animation: `think-dot 1.2s ${i*.2}s ease-in-out infinite` }} />
            ))}
            {isSpeaking && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", animation: "glow-pulse 0.9s ease-in-out infinite" }} />}
            {avatarState === "idle" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />}
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "rgba(232,220,200,.7)", textTransform: "uppercase" }}>
              Eve · {isSpeaking ? "Speaking" : isThinking ? "Processing" : "Listening"}
            </span>
          </div>

          {/* Timer */}
          <div style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700,
            color: timeLeft < 30 ? "#dc3c3c" : "#c8a951",
            background: "rgba(4,2,10,.88)", backdropFilter: "blur(10px)",
            padding: "6px 14px", border: "1px solid rgba(200,169,81,.15)", textAlign: "center",
          }}>
            {fmt(timeLeft)}<br />
            <span style={{ fontSize: 7, letterSpacing: 2, color: "rgba(232,220,200,.3)", textTransform: "uppercase" }}>remaining</span>
          </div>

          {/* Audio waveform bars — only when speaking */}
          <div style={{
            position: "absolute", bottom: 22, left: 16, zIndex: 10,
            display: "flex", alignItems: "flex-end", gap: 3, height: 32,
            opacity: isSpeaking ? 1 : 0, transition: "opacity 0.4s",
          }}>
            {[
              { anim: "bar1", delay: "0s" },
              { anim: "bar2", delay: "0.1s" },
              { anim: "bar3", delay: "0.05s" },
              { anim: "bar4", delay: "0.15s" },
              { anim: "bar5", delay: "0.08s" },
              { anim: "bar1", delay: "0.12s" },
              { anim: "bar3", delay: "0.03s" },
            ].map((b, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                background: "rgba(168,85,247,.8)",
                boxShadow: "0 0 4px rgba(168,85,247,.5)",
                animation: isSpeaking ? `${b.anim} 0.55s ${b.delay} ease-in-out infinite` : "none",
                height: 4,
              }} />
            ))}
          </div>

          {/* Name / role tag bottom */}
          <div style={{ position: "absolute", bottom: 18, right: 16, zIndex: 10, textAlign: "right" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700, color: "rgba(232,220,200,.7)", letterSpacing: 1 }}>Eve</div>
            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 7, color: "rgba(168,85,247,.45)" }}>AI Agent · The Gym</div>
          </div>

          {/* Pipeline tag */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
            fontFamily: "'Roboto Mono',monospace", fontSize: 7,
            color: "rgba(168,85,247,.4)", background: "rgba(4,2,10,.6)",
            padding: "3px 8px", textAlign: "center",
          }}>
            {pipelineTag}
          </div>

          {notice && (
            <div style={{
              position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 11,
              background: "rgba(200,169,81,.12)", border: "1px solid rgba(200,169,81,.25)",
              padding: "4px 12px", fontFamily: "'Roboto Mono',monospace", fontSize: 7, color: "rgba(200,169,81,.6)",
              backdropFilter: "blur(6px)", whiteSpace: "nowrap",
            }}>
              ⚠ {notice}
            </div>
          )}
        </div>

        {/* ── Chat Panel ── */}
        <div style={{ display: "flex", flexDirection: "column", background: "#0a0806", borderLeft: "1px solid rgba(200,169,81,.07)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#E8DCC8" }}>Eve</div>
            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.5)" }}>AI Agent · The Gym · Grok-3 Pro</div>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "88%", padding: "9px 12px",
                  background: m.role === "eve" ? "rgba(168,85,247,.08)" : "rgba(200,169,81,.07)",
                  border: `1px solid ${m.role === "eve" ? "rgba(168,85,247,.18)" : "rgba(200,169,81,.18)"}`,
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.6, color: "#E8DCC8",
                }}>
                  {m.text}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, color: "rgba(232,220,200,.18)", marginTop: 3, letterSpacing: 1 }}>
                  {m.role === "eve" ? "EVE" : userName.toUpperCase()}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 4, padding: "6px 2px" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", animation: `think-dot 1.2s ${i*.2}s ease-in-out infinite` }} />)}
              </div>
            )}
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ display: "flex", gap: 7 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && send()}
                placeholder={`Speak to Eve, ${userName}…`}
                disabled={loading}
                style={{ flex: 1, padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", color: "#E8DCC8", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: "none" }}
              />
              <button onClick={toggleMic} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 15, background: micActive ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.06)" }}>
                {micActive ? "🔴" : "🎙"}
              </button>
              <button onClick={send} disabled={loading || !input.trim()} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: loading || !input.trim() ? "default" : "pointer", background: loading || !input.trim() ? "rgba(255,255,255,.05)" : "#a855f7", color: "#fff", fontSize: 15 }}>→</button>
            </div>
            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 7, color: "rgba(232,220,200,.13)", textAlign: "center", marginTop: 6 }}>
              How does it work? · Show me · What can you do?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
