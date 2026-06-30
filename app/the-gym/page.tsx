"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "@/components/Nav";

const EVE_WAVE_VIDEO = "/eve_wave_greeting.mp4";
const EVE_TALK_VIDEO = "/eve_talking_loop.mp4";

type Msg = { role: "eve" | "user"; text: string };
type AvatarState = "idle" | "thinking" | "speaking";
type Viseme = { word: string; offsetMs: number; durationMs: number };

function wordToViseme(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w || /^[mbp]/.test(w)) return "rest";
  if (/^[fv]/.test(w)) return "fv";
  const v = w.match(/[aeiou]/)?.[0];
  if (!v) return "mid";
  return v === "a" ? "aa" : v === "o" || v === "u" ? "ou" : v === "e" || v === "i" ? "ee" : "mid";
}

export default function TheGymPage() {
  const [msgs,        setMsgs]        = useState<Msg[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [micActive,   setMicActive]   = useState(false);
  const [pipelineTag, setPipelineTag] = useState("Grok-3 · Eve-TTS · Live");
  const [notice,      setNotice]      = useState("");
  // videoSrc drives which video plays — wave for opener, talk loop for replies, null = idle loop
  const [videoSrc,    setVideoSrc]    = useState<string>(EVE_WAVE_VIDEO);

  const audioRef   = useRef<HTMLAudioElement>(null);
  const chatRef    = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const visemesRef = useRef<Viseme[]>([]);
  const rafRef     = useRef<number | null>(null);
  const didGreet   = useRef(false);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const startVisemeLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused || audio.ended) { rafRef.current = null; return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopVisemeLoop = useCallback(() => {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const eveRespond = useCallback(async (userText: string, scripted = false) => {
    setAvatarState("thinking");
    setNotice("");
    try {
      const res = await fetch("/api/hf/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, history: historyRef.current.slice(-8) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "speak failed");

      const reply: string = data.reply ?? "I'm right here with you, TJ. What's on your mind?";
      if (!scripted) historyRef.current.push({ role: "user", content: userText });
      historyRef.current.push({ role: "assistant", content: reply });
      setMsgs(p => [...p, { role: "eve", text: reply }]);

      if (data.audioUrl) {
        visemesRef.current = data.visemes ?? [];
        // Opener keeps the wave video; every other turn switches to talk loop
        if (userText !== "__OPEN__") setVideoSrc(EVE_TALK_VIDEO);
        setAvatarState("speaking");

        const audio = audioRef.current ?? new Audio();
        audio.src = data.audioUrl;
        audio.onplay  = () => { setAvatarState("speaking"); startVisemeLoop(); };
        audio.onended = () => {
          stopVisemeLoop();
          setAvatarState("idle");
          // After speaking, keep the talk loop running so she stays alive
          setVideoSrc(EVE_TALK_VIDEO);
        };
        audio.onerror = () => {
          stopVisemeLoop(); setAvatarState("idle"); setVideoSrc(EVE_TALK_VIDEO);
          const utt = new SpeechSynthesisUtterance(reply);
          utt.onend = () => setAvatarState("idle");
          window.speechSynthesis.speak(utt);
        };
        audio.play().catch(() => {
          stopVisemeLoop(); setAvatarState("idle"); setVideoSrc(EVE_TALK_VIDEO);
          const utt = new SpeechSynthesisUtterance(reply);
          utt.onend = () => setAvatarState("idle");
          window.speechSynthesis.speak(utt);
        });
        setPipelineTag("✓ Grok-3 · Eve-TTS (Ava) · Live");
      } else {
        setVideoSrc(EVE_TALK_VIDEO);
        const utt = new SpeechSynthesisUtterance(reply);
        utt.onstart = () => setAvatarState("speaking");
        utt.onend   = () => { setAvatarState("idle"); stopVisemeLoop(); };
        window.speechSynthesis?.speak(utt);
        setPipelineTag("Grok-3 · Browser TTS");
      }
    } catch (e) {
      setNotice(`${String(e).slice(0, 80)}`);
      setAvatarState("idle");
      setVideoSrc(EVE_TALK_VIDEO);
    }
    setLoading(false);
  }, [startVisemeLoop, stopVisemeLoop]);

  // On mount — play wave video immediately, then Eve greets TJ
  useEffect(() => {
    if (didGreet.current) return;
    didGreet.current = true;
    setVideoSrc(EVE_WAVE_VIDEO);
    setTimeout(() => eveRespond("__OPEN__", true), 900);
  }, [eveRespond]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput("");
    setLoading(true);
    setMsgs(p => [...p, { role: "user", text: txt }]);
    await eveRespond(txt);
  };

  const toggleMic = () => {
    if (micActive) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (srRef as any).current?.stop(); setMicActive(false); return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setNotice("Speech recognition not supported"); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.onend = () => setMicActive(false);
    r.start();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (srRef as any).current = r;
    setMicActive(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srRef = useRef<any>(null);

  const isSpeaking = avatarState === "speaking";
  const isThinking = avatarState === "thinking";

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#080503", display: "flex", flexDirection: "column" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3)}
        @keyframes glow-pulse{0%,100%{opacity:0.35}50%{opacity:0.7}}
        @keyframes bar1{0%,100%{height:4px}25%{height:18px}50%{height:8px}75%{height:22px}}
        @keyframes bar2{0%,100%{height:8px}25%{height:24px}50%{height:14px}75%{height:10px}}
        @keyframes bar3{0%,100%{height:14px}25%{height:6px}50%{height:26px}75%{height:16px}}
        @keyframes bar4{0%,100%{height:6px}25%{height:20px}50%{height:10px}75%{height:28px}}
        @keyframes bar5{0%,100%{height:10px}25%{height:8px}50%{height:22px}75%{height:6px}}
        @keyframes think-dot{0%,80%,100%{transform:scale(0);opacity:0}40%{transform:scale(1);opacity:1}}
      `}</style>

      <Nav />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 370px", overflow: "hidden" }}>

        {/* ── Avatar Panel ── */}
        <div style={{ position: "relative", background: "#04020a", overflow: "hidden" }}>

          {/* Glow */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: isSpeaking
              ? "radial-gradient(ellipse 80% 90% at 50% 60%, rgba(168,85,247,.18) 0%, transparent 70%)"
              : "radial-gradient(ellipse 60% 70% at 50% 60%, rgba(200,169,81,.06) 0%, transparent 60%)",
            animation: isSpeaking ? "glow-pulse 0.9s ease-in-out infinite" : "none",
            transition: "background 1s",
          }} />

          {/* Live video — always playing: wave on open, talk loop otherwise */}
          <video
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

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 55%, rgba(4,2,10,.85) 100%)",
            pointerEvents: "none",
          }} />

          {/* Bottom gradient */}
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

          {/* Audio waveform */}
          <div style={{
            position: "absolute", bottom: 22, left: 16, zIndex: 10,
            display: "flex", alignItems: "flex-end", gap: 3, height: 32,
            opacity: isSpeaking ? 1 : 0, transition: "opacity 0.4s",
          }}>
            {[
              { a: "bar1", d: "0s" }, { a: "bar2", d: "0.1s" }, { a: "bar3", d: "0.05s" },
              { a: "bar4", d: "0.15s" }, { a: "bar5", d: "0.08s" }, { a: "bar1", d: "0.12s" }, { a: "bar3", d: "0.03s" },
            ].map((b, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2, background: "rgba(168,85,247,.8)",
                boxShadow: "0 0 4px rgba(168,85,247,.5)",
                animation: isSpeaking ? `${b.a} 0.55s ${b.d} ease-in-out infinite` : "none", height: 4,
              }} />
            ))}
          </div>

          {/* Name tag */}
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
            <div style={{ fontFamily: "'Roboto Mono',monospace", fontSize: 8, color: "rgba(168,85,247,.5)" }}>AI Agent · The Gym · Grok-3</div>
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
                  {m.role === "eve" ? "EVE" : "TJ"}
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
                placeholder="Speak to Eve, TJ…"
                disabled={loading}
                style={{ flex: 1, padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", color: "#E8DCC8", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, outline: "none" }}
              />
              <button onClick={toggleMic} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 15, background: micActive ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.06)" }}>
                {micActive ? "🔴" : "🎙"}
              </button>
              <button onClick={send} disabled={loading || !input.trim()} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: loading || !input.trim() ? "default" : "pointer", background: loading || !input.trim() ? "rgba(255,255,255,.05)" : "#a855f7", color: "#fff", fontSize: 15 }}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
