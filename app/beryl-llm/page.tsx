"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const GALLERY = [
  { src:"/beryl-llm/portrait-1.png", label:"Rendered in Beryl LLM", caption:"Neural portrait synthesis — zero reference images" },
  { src:"/beryl-llm/portrait-7.png", label:"Rendered in Beryl LLM", caption:"Sub-100ms full-frame generation at 4K native" },
  { src:"/beryl-llm/portrait-3.png", label:"Rendered in Beryl LLM", caption:"Photorealistic skin, lighting, and texture fidelity" },
  { src:"/beryl-llm/portrait-4.png", label:"Rendered in Beryl LLM", caption:"Complex hair and material simulation — single pass" },
  { src:"/beryl-llm/portrait-5.png", label:"Rendered in Beryl LLM", caption:"Emotion-encoded latent space for avatar expressivity" },
  { src:"/beryl-llm/portrait-6.png", label:"Rendered in Beryl LLM", caption:"Proprietary diffusion backbone — fully owned IP" },
];

const SPECS = [
  { stat:"<100ms", label:"Generation latency", sub:"At 4K resolution" },
  { stat:"12B", label:"Parameter count", sub:"Proprietary architecture" },
  { stat:"4K", label:"Native output", sub:"No upscaling" },
  { stat:"50+", label:"Supported languages", sub:"Multilingual voice synthesis" },
  { stat:"165ms", label:"Realtime response", sub:"Live avatar inference" },
  { stat:"100%", label:"Owned IP", sub:"No third-party models" },
];

const PILLARS = [
  {
    icon:"⬡",
    title:"Avatar Synthesis Engine",
    body:"Beryl LLM's core visual backbone generates photorealistic human avatars from a learned latent space trained on proprietary data. Every character in the Amanda Squad was created entirely within Beryl LLM — no Stable Diffusion, no Midjourney, no external pipeline.",
  },
  {
    icon:"◎",
    title:"Realtime Inference Core",
    body:"Standard diffusion models require 2–30 seconds per frame. Beryl LLM's inference architecture delivers sub-165ms end-to-end response — fast enough for live conversation. This is not post-processing optimization. It is a fundamentally different compute graph.",
  },
  {
    icon:"⟁",
    title:"Emotion-Encoded Latent Space",
    body:"Beryl LLM represents emotional state as first-class tokens in its latent space. This means the model does not simulate emotion after generation — it encodes affect directly into every frame, producing responses that feel genuine rather than performed.",
  },
  {
    icon:"◈",
    title:"Multimodal Voice Integration",
    body:"Visual generation and voice synthesis share the same attention layers in Beryl LLM. Lip sync, micro-expression, and vocal prosody are co-generated — not post-aligned. The result is the first AI face that truly matches its voice at the neural level.",
  },
];

export default function BerylLLMPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [activeGallery, setActiveGallery] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      document.addEventListener("click", () => v.play(), { once: true });
    });
  }, []);

  // Auto-cycle gallery
  useEffect(() => {
    const t = setInterval(() => setActiveGallery(i => (i + 1) % GALLERY.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "#080503", minHeight: "100vh", color: "#E8DCC8", fontFamily: "'Cormorant Garamond', serif" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64, background: "rgba(8,5,3,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(200,169,81,0.12)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: "#1a5f7a" }}>Beryl</span>
          <span className="logo-live" style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700 }}>Live</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,200,0.6)", textDecoration: "none" }}>← Home</Link>
          <Link href="/beryl-llm" style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#c8a951", textDecoration: "none" }}>Beryl LLM</Link>
          <Link href="/demo" style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#fff", textDecoration: "none", background: "rgba(200,169,81,0.15)", border: "1px solid rgba(200,169,81,0.4)", padding: "8px 20px" }}>Live Demo</Link>
        </div>
      </nav>

      {/* ── HERO VIDEO ── */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoReady(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: videoReady ? 1 : 0, transition: "opacity 1.2s" }}
        >
          <source src="/videos/beryl-llm-highlights.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,5,3,0.3) 0%, rgba(8,5,3,0.1) 40%, rgba(8,5,3,0.7) 80%, rgba(8,5,3,1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(8,5,3,0.5) 100%)" }} />

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 32px", maxWidth: 900 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c8a951", marginBottom: 24, opacity: 0.9 }}>
            Proprietary Foundation Model
          </div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(52px,8vw,96px)", fontWeight: 700, lineHeight: 1, marginBottom: 24, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#1a5f7a" }}>Beryl</span>{" "}
            <span className="logo-live">LLM</span>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(18px,2vw,24px)", lineHeight: 1.7, color: "rgba(232,220,200,0.85)", maxWidth: 680, margin: "0 auto 40px" }}>
            The world's first foundation model built exclusively for live human-AI presence. Every face. Every voice. Every frame. Rendered by Beryl.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/demo" style={{ textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "14px 36px", background: "linear-gradient(135deg,#c8a951,#f5e070,#c8a951)", color: "#080503", fontWeight: 700 }}>
              Experience Live Demo
            </Link>
            <a href="#research" style={{ textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "14px 36px", border: "1px solid rgba(200,169,81,0.4)", color: "#c8a951" }}>
              Read the Research
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#c8a951" }}>Scroll</div>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,#c8a951,transparent)" }} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "#0a0604", borderTop: "1px solid rgba(200,169,81,0.12)", borderBottom: "1px solid rgba(200,169,81,0.12)", padding: "40px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 0 }}>
          {SPECS.map((s, i) => (
            <div key={s.stat} style={{ textAlign: "center", padding: "16px 8px", borderRight: i < SPECS.length - 1 ? "1px solid rgba(200,169,81,0.1)" : undefined }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,2.5vw,34px)", fontWeight: 700, color: "#c8a951", lineHeight: 1 }}>{s.stat}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,200,0.6)", marginTop: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "rgba(232,220,200,0.35)", marginTop: 3, fontStyle: "italic" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTRO STATEMENT ── */}
      <section id="research" style={{ padding: "100px 32px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4CAF50", marginBottom: 24 }}>Why Beryl LLM Exists</div>
        <p style={{ fontSize: "clamp(22px,2.8vw,32px)", lineHeight: 1.65, color: "rgba(232,220,200,0.9)", fontStyle: "italic", marginBottom: 32 }}>
          "Every major AI company built intelligence. None of them built a face. We did both — and we own every line of it."
        </p>
        <p style={{ fontSize: 18, lineHeight: 1.85, color: "rgba(232,220,200,0.65)" }}>
          Beryl LLM is not a wrapper around an existing model. It is a ground-up foundation model trained for one purpose: real-time human presence. While the industry built text generators, we built a visual reasoning engine capable of producing photorealistic faces, synchronized voices, and emotionally coherent responses — all in a single inference pass, under 165 milliseconds.
        </p>
        <div style={{ width: 60, height: 1, background: "#c8a951", margin: "48px auto 0", opacity: 0.4 }} />
      </section>

      {/* ── REALNESS BANNER ── */}
      <section style={{ position:"relative", width:"100%", overflow:"hidden", background:"#000" }}>
        <style>{`
          @keyframes scan-line {
            0%   { transform: translateY(-100%); opacity: 0.7; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes scan-line-2 {
            0%   { transform: translateY(-100%); opacity: 0.4; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes corner-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes glitch-1 {
            0%, 94%, 100% { clip-path: none; transform: none; }
            95% { clip-path: polygon(0 20%, 100% 20%, 100% 25%, 0 25%); transform: translateX(-4px); }
            96% { clip-path: polygon(0 60%, 100% 60%, 100% 65%, 0 65%); transform: translateX(4px); }
            97% { clip-path: polygon(0 80%, 100% 80%, 100% 83%, 0 83%); transform: translateX(-2px); }
          }
          @keyframes data-scroll {
            0%   { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes ring-pulse {
            0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0.6; }
            100% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
          }
          @keyframes ring-pulse-2 {
            0%   { transform: translate(-50%,-50%) scale(0.9); opacity: 0.4; }
            100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
          }
          @keyframes banner-text-in {
            0%   { opacity:0; transform: translateY(16px); }
            100% { opacity:1; transform: translateY(0); }
          }
          @keyframes blink-cursor {
            0%, 100% { opacity: 1; } 50% { opacity: 0; }
          }
          @keyframes holo-shift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Background image */}
        <div style={{ position:"relative", minHeight:680, display:"flex", alignItems:"center" }}>
          <img src="/beryl-llm/banner-portrait.png" alt=""
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%" }} />

          {/* Dark gradient overlay — heavier on left for text */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.55) 100%)" }} />

          {/* Rainbow color tint matching portrait */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(120,0,200,0.08), rgba(0,120,255,0.06), rgba(0,200,100,0.05), rgba(255,200,0,0.06), rgba(255,60,0,0.07))", mixBlendMode:"screen" }} />

          {/* Animated scan line 1 */}
          <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, rgba(200,169,81,0.8), rgba(255,255,255,0.6), rgba(200,169,81,0.8), transparent)", animation:"scan-line 3.5s linear infinite", zIndex:3, pointerEvents:"none" }} />
          {/* Animated scan line 2 — offset */}
          <div style={{ position:"absolute", left:0, right:0, height:1, background:"linear-gradient(90deg, transparent, rgba(100,200,255,0.5), transparent)", animation:"scan-line-2 5s linear infinite 1.8s", zIndex:3, pointerEvents:"none" }} />

          {/* ── BUTTERFLIES ── */}
          {[
            { color:"#ff0080,#ff6600,#ffcc00", delay:"0s",   dur:"9s",  top:"18%", size:44, yAmp:55,  startX:-80  },
            { color:"#00ccff,#8800ff,#ff0080", delay:"2.2s", dur:"11s", top:"42%", size:36, yAmp:70,  startX:-60  },
            { color:"#00ff88,#00ccff,#0044ff", delay:"4.5s", dur:"8s",  top:"62%", size:52, yAmp:40,  startX:-100 },
            { color:"#ffcc00,#ff6600,#ff0040", delay:"1.1s", dur:"13s", top:"28%", size:30, yAmp:90,  startX:-70  },
            { color:"#cc00ff,#ff0080,#ffcc00", delay:"6s",   dur:"10s", top:"72%", size:40, yAmp:50,  startX:-90  },
            { color:"#00ff44,#ffcc00,#ff6600", delay:"3s",   dur:"7s",  top:"12%", size:28, yAmp:65,  startX:-50  },
            { color:"#ff6600,#cc00ff,#00ccff", delay:"7.5s", dur:"12s", top:"50%", size:48, yAmp:30,  startX:-110 },
          ].map((b, i) => (
            <div key={i} style={{
              position:"absolute",
              top: b.top,
              left: 0,
              zIndex: 5,
              pointerEvents:"none",
              animation: `butterfly-fly-${i} ${b.dur} linear ${b.delay} infinite`,
            }}>
              <style>{`
                @keyframes butterfly-fly-${i} {
                  0%   { transform: translateX(${b.startX}px) translateY(0px); opacity:0; }
                  5%   { opacity: 1; }
                  25%  { transform: translateX(25vw)  translateY(${-b.yAmp}px); }
                  50%  { transform: translateX(50vw)  translateY(${b.yAmp * 0.6}px); }
                  75%  { transform: translateX(75vw)  translateY(${-b.yAmp * 0.4}px); }
                  95%  { opacity: 1; }
                  100% { transform: translateX(110vw) translateY(${b.yAmp * 0.3}px); opacity:0; }
                }
                @keyframes flap-left-${i} {
                  0%, 100% { transform: scaleX(1) skewY(-6deg); }
                  50%      { transform: scaleX(0.15) skewY(2deg); }
                }
                @keyframes flap-right-${i} {
                  0%, 100% { transform: scaleX(-1) skewY(-6deg); }
                  50%      { transform: scaleX(-0.15) skewY(2deg); }
                }
              `}</style>
              <svg width={b.size * 2.4} height={b.size * 1.8} viewBox="0 0 96 72" style={{ overflow:"visible", filter:`drop-shadow(0 0 6px ${b.color.split(',')[0]})` }}>
                <defs>
                  <radialGradient id={`bg-left-${i}`} cx="70%" cy="40%">
                    <stop offset="0%" stopColor={b.color.split(',')[0]} stopOpacity="0.95"/>
                    <stop offset="50%" stopColor={b.color.split(',')[1]} stopOpacity="0.85"/>
                    <stop offset="100%" stopColor={b.color.split(',')[2]} stopOpacity="0.7"/>
                  </radialGradient>
                  <radialGradient id={`bg-right-${i}`} cx="30%" cy="40%">
                    <stop offset="0%" stopColor={b.color.split(',')[2]} stopOpacity="0.95"/>
                    <stop offset="50%" stopColor={b.color.split(',')[1]} stopOpacity="0.85"/>
                    <stop offset="100%" stopColor={b.color.split(',')[0]} stopOpacity="0.7"/>
                  </radialGradient>
                </defs>
                {/* Body */}
                <ellipse cx="48" cy="36" rx="3" ry="18" fill="rgba(0,0,0,0.7)"/>
                {/* Antennae */}
                <line x1="48" y1="18" x2="36" y2="6" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2"/>
                <circle cx="36" cy="6" r="2" fill={b.color.split(',')[0]}/>
                <line x1="48" y1="18" x2="60" y2="6" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2"/>
                <circle cx="60" cy="6" r="2" fill={b.color.split(',')[2]}/>
                {/* Left upper wing */}
                <g style={{ transformOrigin:"48px 30px", animation:`flap-left-${i} 0.38s ease-in-out infinite` }}>
                  <path d="M48 30 Q20 8 8 22 Q2 38 18 48 Q34 54 48 44 Z" fill={`url(#bg-left-${i})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                </g>
                {/* Left lower wing */}
                <g style={{ transformOrigin:"48px 44px", animation:`flap-left-${i} 0.38s ease-in-out infinite 0.05s` }}>
                  <path d="M48 44 Q28 52 22 64 Q32 72 44 66 Q52 60 48 52 Z" fill={`url(#bg-left-${i})`} opacity="0.85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                </g>
                {/* Right upper wing */}
                <g style={{ transformOrigin:"48px 30px", animation:`flap-right-${i} 0.38s ease-in-out infinite` }}>
                  <path d="M48 30 Q76 8 88 22 Q94 38 78 48 Q62 54 48 44 Z" fill={`url(#bg-right-${i})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                </g>
                {/* Right lower wing */}
                <g style={{ transformOrigin:"48px 44px", animation:`flap-right-${i} 0.38s ease-in-out infinite 0.05s` }}>
                  <path d="M48 44 Q68 52 74 64 Q64 72 52 66 Q44 60 48 52 Z" fill={`url(#bg-right-${i})`} opacity="0.85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                </g>
              </svg>
            </div>
          ))}

          {/* Pulsing rings over face area */}
          <div style={{ position:"absolute", left:"60%", top:"50%", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(200,169,81,0.5)", animation:"ring-pulse 2.5s ease-out infinite", zIndex:2, pointerEvents:"none" }} />
          <div style={{ position:"absolute", left:"60%", top:"50%", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(120,220,255,0.3)", animation:"ring-pulse-2 2.5s ease-out infinite 1.2s", zIndex:2, pointerEvents:"none" }} />

          {/* Corner brackets — TL */}
          <div style={{ position:"absolute", top:24, left:24, width:40, height:40, borderTop:"2px solid #c8a951", borderLeft:"2px solid #c8a951", animation:"corner-pulse 2s ease-in-out infinite", zIndex:4 }} />
          {/* TR */}
          <div style={{ position:"absolute", top:24, right:24, width:40, height:40, borderTop:"2px solid #c8a951", borderRight:"2px solid #c8a951", animation:"corner-pulse 2s ease-in-out infinite 0.5s", zIndex:4 }} />
          {/* BL */}
          <div style={{ position:"absolute", bottom:24, left:24, width:40, height:40, borderBottom:"2px solid #c8a951", borderLeft:"2px solid #c8a951", animation:"corner-pulse 2s ease-in-out infinite 1s", zIndex:4 }} />
          {/* BR */}
          <div style={{ position:"absolute", bottom:24, right:24, width:40, height:40, borderBottom:"2px solid #c8a951", borderRight:"2px solid #c8a951", animation:"corner-pulse 2s ease-in-out infinite 1.5s", zIndex:4 }} />

          {/* Scrolling data readout — right edge */}
          <div style={{ position:"absolute", right:72, top:40, bottom:40, width:140, overflow:"hidden", zIndex:4, opacity:0.55 }}>
            <div style={{ animation:"data-scroll 8s linear infinite", display:"flex", flexDirection:"column", gap:6 }}>
              {[
                "FACE_MESH: ACTIVE","LATENCY: 142ms","EMOTION: NEUTRAL","LIP_SYNC: LOCKED",
                "RESOLUTION: 4096×4096","TOKENS: 847B","INFERENCE: LIVE","IDENTITY: STABLE",
                "VOICE_SYNC: ON","FRAME: 00841","MODEL: BERYL_V0.8","STATUS: REALTIME",
                "FACE_MESH: ACTIVE","LATENCY: 142ms","EMOTION: NEUTRAL","LIP_SYNC: LOCKED",
                "RESOLUTION: 4096×4096","TOKENS: 847B","INFERENCE: LIVE","IDENTITY: STABLE",
                "VOICE_SYNC: ON","FRAME: 00842","MODEL: BERYL_V0.8","STATUS: REALTIME",
              ].map((line, i) => (
                <div key={i} style={{ fontFamily:"monospace", fontSize:9, letterSpacing:1, color: i%4===2 ? "#4CAF50" : i%4===0 ? "#c8a951" : "rgba(200,220,255,0.7)", whiteSpace:"nowrap" }}>{line}</div>
              ))}
            </div>
          </div>

          {/* Left: main messaging */}
          <div style={{ position:"relative", zIndex:5, padding:"60px 48px", maxWidth:580, animation:"banner-text-in 1.2s ease-out both" }}>

            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#4CAF50", boxShadow:"0 0 8px #4CAF50", animation:"corner-pulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:4, textTransform:"uppercase", color:"#4CAF50" }}>Neural Synthesis · Live Inference Active</span>
            </div>

            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(32px,4.5vw,58px)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:20, animation:"glitch-1 8s ease-in-out infinite" }}>
              This face<br />
              <span style={{ background:"linear-gradient(90deg,#c8a951,#f5e070,#4CAF50,#1a9fff,#c8a951)", backgroundSize:"300% 300%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"holo-shift 4s ease infinite" }}>
                does not exist.
              </span>
            </h2>

            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, lineHeight:1.85, color:"rgba(232,220,200,0.8)", marginBottom:28 }}>
              Every pixel. Every expression. Every strand of hair. Generated in a single inference pass by Beryl LLM — our proprietary foundation model. No photography. No staging. No artist.
            </p>

            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, lineHeight:1.85, color:"rgba(232,220,200,0.65)", marginBottom:36 }}>
              This is the same model that powers every live avatar on Beryl Live — running at sub-165ms latency, in real-time, while your user is watching.
            </p>

            <div style={{ display:"flex", gap:24, alignItems:"center" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"rgba(200,169,81,0.6)", borderLeft:"2px solid rgba(200,169,81,0.3)", paddingLeft:12 }}>
                Beryl LLM v0.8<br />
                <span style={{ color:"#4CAF50" }}>Proprietary · 100% owned IP</span>
              </div>
              <div style={{ fontFamily:"monospace", fontSize:11, color:"rgba(100,220,255,0.7)", letterSpacing:1 }}>
                <span style={{ animation:"blink-cursor 1s step-end infinite" }}>▮</span> RENDERING...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMAGE GALLERY ── */}
      <section style={{ padding: "0 0 100px", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#c8a951", marginBottom: 14 }}>Model Outputs</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              Every image created by <span className="logo-live">Beryl LLM</span>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "rgba(232,220,200,0.55)", maxWidth: 540, margin: "0 auto" }}>
              No stock photos. No third-party generators. Every face you see on this platform was synthesized by our proprietary model.
            </p>
          </div>

          {/* Featured large + grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
            {/* Large featured */}
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/5", cursor: "pointer" }} onClick={() => setActiveGallery(0)}>
              <img src={GALLERY[activeGallery].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", transition: "transform 0.8s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,5,3,0.9) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#c8a951", marginBottom: 6 }}>{GALLERY[activeGallery].label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(232,220,200,0.8)", fontStyle: "italic" }}>{GALLERY[activeGallery].caption}</div>
              </div>
            </div>

            {/* 2×3 thumbnail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 4 }}>
              {GALLERY.map((g, i) => (
                <div key={i} onClick={() => setActiveGallery(i)} style={{ position: "relative", overflow: "hidden", cursor: "pointer", outline: activeGallery === i ? "2px solid #c8a951" : undefined, outlineOffset: -2 }}>
                  <img src={g.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", transition: "transform .4s", transform: activeGallery === i ? "scale(1.04)" : "scale(1)" }} />
                  <div style={{ position: "absolute", inset: 0, background: activeGallery === i ? "rgba(200,169,81,0.12)" : "rgba(8,5,3,0.35)", transition: "background .3s" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
            {GALLERY.map((_, i) => (
              <button key={i} onClick={() => setActiveGallery(i)} style={{ width: i === activeGallery ? 24 : 6, height: 6, borderRadius: 3, background: i === activeGallery ? "#c8a951" : "rgba(200,169,81,0.25)", border: "none", cursor: "pointer", transition: "all .3s", padding: 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ── */}
      <section style={{ background: "#0a0604", padding: "100px 32px", borderTop: "1px solid rgba(200,169,81,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4CAF50", marginBottom: 14 }}>Architecture</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 700, color: "#fff" }}>
              What makes Beryl LLM different
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 2 }}>
            {PILLARS.map((p, i) => (
              <div key={i} style={{ padding: "48px 44px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(200,169,81,0.08)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: i % 2 === 0 ? "#4CAF50" : "#c8a951" }} />
                <div style={{ fontSize: 28, marginBottom: 20, color: i % 2 === 0 ? "#4CAF50" : "#c8a951" }}>{p.icon}</div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16, letterSpacing: "0.02em" }}>{p.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(232,220,200,0.6)" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT POWERS BERYL LIVE ── */}
      <section style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4CAF50", marginBottom: 20 }}>The Stack</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(26px,3vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 24 }}>
              Beryl LLM is the engine.<br />
              <span style={{ color: "#1a5f7a" }}>Beryl Live</span> is the vehicle.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: "rgba(232,220,200,0.65)", marginBottom: 32 }}>
              Most AI avatar companies license their visual generation from third parties. This means they pay per frame, have no control over quality, and cannot innovate on the core capability.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: "rgba(232,220,200,0.65)", marginBottom: 40 }}>
              Beryl owns the full stack. Beryl LLM generates the faces. Beryl Live delivers them in real-time. This vertical integration is what lets us offer 10× more session minutes at half the price — and improve both simultaneously.
            </p>
            {[
              "Avatar generation — Beryl LLM",
              "Voice synthesis — Beryl LLM",
              "Emotion encoding — Beryl LLM",
              "Real-time delivery — Beryl Live",
              "Session infrastructure — Beryl Live",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", flexShrink: 0 }} />
                <span style={{ fontSize: 15, color: "rgba(232,220,200,0.75)", fontFamily: "'Cormorant Garamond',serif" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Eve card */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -2, background: "linear-gradient(135deg,#4CAF50,#1a5f7a,#c8a951)", borderRadius: 0, zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, background: "#080503", padding: 2 }}>
              <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
                <img src="/beryl-llm/eve-shield.png" alt="Eve — created by Beryl LLM" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,5,3,0.95) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 28, left: 28, right: 28 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#c8a951", marginBottom: 6 }}>Created by Beryl LLM</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Eve</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(232,220,200,0.6)", fontStyle: "italic" }}>AI Architect · Beryl Live Character</div>
                  <div style={{ display: "inline-block", marginTop: 12, padding: "4px 12px", background: "rgba(26,95,122,0.5)", border: "1px solid #1a5f7a", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#4CAF50" }}>In Session</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YC / ROADMAP ── */}
      <section style={{ background: "#0a0604", padding: "100px 32px", borderTop: "1px solid rgba(200,169,81,0.08)", borderBottom: "1px solid rgba(200,169,81,0.08)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#c8a951", marginBottom: 24 }}>Deployment Roadmap</div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, color: "#fff", marginBottom: 28, lineHeight: 1.2 }}>
            Full model deployment<br />at scale — <span style={{ color: "#4CAF50" }}>coming in 2026</span>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.85, color: "rgba(232,220,200,0.65)", marginBottom: 60 }}>
            Beryl LLM is currently powering Beryl Live in a constrained deployment while we scale GPU infrastructure. The full model — including multi-character generation, real-time 4K streaming, and on-premise enterprise deployment — will launch following our Series A.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1 }}>
            {[
              { phase:"Phase I", label:"Now", items:["10 characters live","720p–1080p streaming","Beryl LLM v0.8","Constrained inference"] },
              { phase:"Phase II", label:"Q3 2026", items:["Full Squad deployment","4K Ultra HD","Beryl LLM v1.0","Custom avatar pipeline"] },
              { phase:"Phase III", label:"2027", items:["On-premise enterprise","White-label LLM API","Beryl LLM v2.0","Unlimited characters"] },
            ].map((ph, i) => (
              <div key={ph.phase} style={{ padding: "40px 32px", background: i === 0 ? "rgba(76,175,80,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(76,175,80,0.3)" : "rgba(200,169,81,0.08)"}`, textAlign: "left" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: i === 0 ? "#4CAF50" : "#c8a951", marginBottom: 6 }}>{ph.phase}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{ph.label}</div>
                {ph.items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: i === 0 ? "#4CAF50" : "#c8a951", fontSize: 10, marginTop: 2, flexShrink: 0 }}>✦</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(232,220,200,0.7)" }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#4CAF50", marginBottom: 24 }}>Get Early Access</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 700, color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>
          Built for believers.<br />
          <span className="logo-live">Forged in code.</span>
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "rgba(232,220,200,0.6)", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Experience Beryl LLM live. Three minutes with Eve will show you what is possible when an AI has a face, a voice, and a presence.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/demo" style={{ textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "16px 48px", background: "linear-gradient(135deg,#c8a951,#f5e070,#c8a951)", color: "#080503", fontWeight: 700 }}>
            Start Live Demo
          </Link>
          <Link href="/#pricing" style={{ textDecoration: "none", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "16px 48px", border: "1px solid rgba(232,220,200,0.2)", color: "rgba(232,220,200,0.7)" }}>
            View Pricing
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid rgba(200,169,81,0.1)", padding: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: "#1a5f7a" }}>Beryl</span>
          <span className="logo-live" style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700 }}>Live</span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(232,220,200,0.3)", fontStyle: "italic" }}>
          © 2026 Beryl AI Labs · Beryl LLM is a proprietary model · All outputs are owned IP
        </div>
      </div>

    </div>
  );
}
