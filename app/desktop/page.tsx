"use client";
// Beryl Desktop page
import Link from "next/link";
import Nav from "@/components/Nav";

export default function DesktopPage() {
  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700;900&display=swap');

        /* ── Velvet texture helper ── */
        .velvet-panel {
          background-color: #0d0905;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='80' viewBox='0 0 64 80'%3E%3Cg fill='none'%3E%3Cpath d='M32 6 C30 10 26 13 26 18 C26 23 29 25 32 25 C35 25 38 23 38 18 C38 13 34 10 32 6Z M28 14 C26 16 24 18 24 22 C24 26 27 28 29 29 C27 30 24 33 24 38 L40 38 C40 33 37 30 35 29 C37 28 40 26 40 22 C40 18 38 16 36 14 M29 38 L27 46 L37 46 L35 38Z M27 46 L26 52 L38 52 L37 46Z' stroke='rgba(180,145,50,0.15)' stroke-width='0.8' fill='rgba(160,125,35,0.06)'/%3E%3C/g%3E%3C/svg%3E"),
            linear-gradient(160deg, rgba(40,22,5,0.85) 0%, rgba(8,5,2,0.97) 50%, rgba(30,16,4,0.85) 100%);
          border: 1px solid rgba(200,169,81,0.18);
        }

        /* ── Animations ── */
        @keyframes sweep {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes glow-pulse {
          0%,100% { opacity:.6; }
          50%      { opacity:1; }
        }
        @keyframes float-up {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes scan-line {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes wave-bar {
          0%,100% { transform: scaleY(0.35); opacity:.35; }
          50%      { transform: scaleY(1);    opacity:.9; }
        }
        @keyframes cursor-blink {
          0%,49% { opacity:1; }
          50%,100%{ opacity:0; }
        }
        @keyframes type-in {
          from { width:0; }
          to   { width:100%; }
        }
        @keyframes fade-in-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.6); opacity:0; }
        }
        @keyframes slide-msg {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes progress-fill {
          from { width:0%; }
          to   { width:78%; }
        }

        .gold-text {
          background: linear-gradient(110deg,#8B6914 0%,#c8a951 22%,#f5e070 48%,#c8a951 74%,#8B6914 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-text {
          background: linear-gradient(110deg,#8B6914 0%,#c8a951 20%,#fff8c0 40%,#f5e070 50%,#c8a951 70%,#8B6914 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .teal-text {
          background: linear-gradient(135deg,#3a8fa8,#4dd9ac);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-card {
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(200,169,81,0.12), 0 0 0 1px rgba(200,169,81,0.28);
          border-color: rgba(200,169,81,0.35) !important;
        }

        .dl-btn {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 16px 36px;
          background: linear-gradient(110deg,#8B6914 0%,#c8a951 25%,#fff8c0 45%,#f5e070 55%,#c8a951 75%,#8B6914 100%);
          background-size: 200% auto;
          color: #0a0604;
          font-family: 'Cinzel', serif;
          font-weight: 700; font-size: 13px; letter-spacing: 2px;
          text-transform: uppercase; text-decoration: none;
          border: 1px solid rgba(245,224,112,.4);
          cursor: pointer; transition: box-shadow .25s, background-position .4s;
          white-space: nowrap;
        }
        .dl-btn:hover {
          background-position: right center;
          box-shadow: 0 0 28px rgba(200,169,81,.55), 0 0 56px rgba(200,169,81,.2);
        }

        /* ── Mock interface GIF-loop panels ── */
        .mock-screen {
          border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(200,169,81,.22);
          background: #0a0806;
          box-shadow: 0 8px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(200,169,81,.1);
          font-family: 'Segoe UI', system-ui, sans-serif;
          font-size: 12px;
          position: relative;
        }
        .mock-titlebar {
          height: 32px; background:#0f0b07;
          border-bottom:1px solid rgba(200,169,81,.15);
          display:flex; align-items:center; padding:0 12px; gap:6px;
        }
        .mock-dot { width:10px; height:10px; border-radius:50%; }

        .mock-left {
          width:220px; min-width:220px; background:#0f0b07;
          border-right:1px solid rgba(200,169,81,.12);
          display:flex; flex-direction:column; align-items:center;
          padding:16px 12px; gap:10px;
        }
        .mock-avatar {
          width:72px; height:72px; border-radius:50%;
          object-fit:cover; object-position:center top;
          border:2px solid rgba(200,169,81,.5);
          box-shadow: 0 0 20px rgba(200,169,81,.2);
          animation: float-up 4s ease-in-out infinite;
        }
        .mock-waves { display:flex; align-items:flex-end; gap:3px; height:20px; }
        .mock-wave {
          width:3px; border-radius:2px; background:#4dd9ac;
          animation: wave-bar 1.4s ease-in-out infinite;
        }
        .mock-wave:nth-child(1){height:8px;  animation-delay:.0s}
        .mock-wave:nth-child(2){height:14px; animation-delay:.1s}
        .mock-wave:nth-child(3){height:18px; animation-delay:.2s}
        .mock-wave:nth-child(4){height:20px; animation-delay:.15s}
        .mock-wave:nth-child(5){height:12px; animation-delay:.25s}

        .mock-right { flex:1; display:flex; flex-direction:column; }
        .mock-chat-area { flex:1; padding:12px; display:flex; flex-direction:column; gap:8px; }
        .mock-bubble {
          padding:7px 10px; border-radius:10px; font-size:11px; line-height:1.5;
          animation: slide-msg .4s ease both;
        }
        .mock-bubble.eve {
          background:rgba(255,255,255,.04); border:1px solid rgba(200,169,81,.15);
          color:#e8d5a0; align-self:flex-start; max-width:85%; border-bottom-left-radius:3px;
        }
        .mock-bubble.user {
          background:rgba(200,169,81,.15); border:1px solid rgba(200,169,81,.25);
          color:#e8d5a0; align-self:flex-end; max-width:75%; border-bottom-right-radius:3px;
        }
        .mock-bubble.tool {
          background:rgba(77,217,172,.06); border:1px solid rgba(77,217,172,.2);
          color:#4dd9ac; align-self:flex-start; font-size:10px; font-family:monospace;
        }
        .mock-input-row {
          height:38px; background:#0f0b07; border-top:1px solid rgba(200,169,81,.12);
          display:flex; align-items:center; padding:0 10px; gap:6px;
        }
        .mock-input-field {
          flex:1; height:22px; background:rgba(255,255,255,.04);
          border:1px solid rgba(200,169,81,.2); border-radius:5px;
          padding:0 8px; color:#c8a951; font-size:10px;
          overflow:hidden; white-space:nowrap;
        }
        .mock-cursor { display:inline-block; width:1px; height:10px; background:#c8a951; margin-left:1px; animation: cursor-blink .8s infinite; vertical-align:middle; }

        /* ── Scan line overlay ── */
        .scan-overlay {
          position:absolute; inset:0; pointer-events:none;
          overflow:hidden; z-index:10;
        }
        .scan-overlay::after {
          content:''; position:absolute; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(77,217,172,.25),transparent);
          animation: scan-line 3s linear infinite;
        }

        /* ── Stat counters ── */
        .stat-counter { font-feature-settings: 'tnum'; font-variant-numeric: tabular-nums; }

        /* ── Section fade-in ── */
        .section-fade {
          animation: fade-in-up .6s ease both;
        }
      `}</style>

      <main style={{ background: "#080503", color: "#e8d5a0", minHeight: "100vh", overflowX: "hidden" }}>

        {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
        <section style={{
          position: "relative", minHeight: "92vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 40px 60px", textAlign: "center", overflow: "hidden",
        }}>
          {/* ambient glow */}
          <div style={{ position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)",
            width:700, height:700, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(200,169,81,.07) 0%, transparent 70%)",
            pointerEvents:"none" }} />

          <div style={{ marginBottom: 20, display:"flex", alignItems:"center", gap:10,
            padding:"6px 18px", border:"1px solid rgba(200,169,81,.25)",
            background:"rgba(200,169,81,.06)", fontSize:11, letterSpacing:2,
            fontFamily:"Cinzel, serif", animation:"fade-in-up .5s ease both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4dd9ac",
              boxShadow:"0 0 8px #4dd9ac", display:"inline-block" }} />
            <span className="gold-text">POWERED BY BERYL LLM</span>
          </div>

          <h1 style={{ fontFamily:"'Cinzel Decorative', Cinzel, serif", fontWeight:900,
            fontSize:"clamp(42px, 7vw, 88px)", letterSpacing:4, lineHeight:1.05,
            marginBottom:8, animation:"fade-in-up .6s ease .1s both" }}>
            <span className="shimmer-text">BERYL</span>
            <br />
            <span className="teal-text" style={{ fontFamily:"Cinzel, serif", fontWeight:400,
              fontSize:"clamp(22px,3.5vw,44px)", letterSpacing:12 }}>DESKTOP</span>
          </h1>

          <p style={{ maxWidth:580, fontSize:18, lineHeight:1.7, color:"rgba(232,213,160,.7)",
            marginBottom:48, fontWeight:300, animation:"fade-in-up .6s ease .2s both" }}>
            Your personal AI operating system — Eve, powered by Beryl LLM, running natively
            on Windows. Multi-model intelligence, computer use, voice, and streaming — all local.
          </p>

          {/* ── Live mockup ── */}
          <div style={{ width:"100%", maxWidth:860, animation:"fade-in-up .7s ease .3s both" }}>
            <div className="mock-screen" style={{ height:420 }}>
              <div className="scan-overlay" />
              <div className="mock-titlebar">
                <div className="mock-dot" style={{ background:"#e05555" }} />
                <div className="mock-dot" style={{ background:"#f5a623" }} />
                <div className="mock-dot" style={{ background:"#4ade80" }} />
                <span style={{ marginLeft:12, color:"rgba(200,169,81,.5)", fontSize:10,
                  fontFamily:"monospace", letterSpacing:1 }}>Beryl Desktop — Eve</span>
                <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                  {["Auto","Qwen7B","GLM","Hermes","⚡ GPU"].map(m => (
                    <span key={m} style={{ fontSize:9, padding:"2px 7px",
                      border:"1px solid rgba(200,169,81,.2)", borderRadius:10,
                      color: m === "Auto" ? "#c8a951" : "rgba(200,169,81,.4)",
                      background: m === "Auto" ? "rgba(200,169,81,.1)" : "transparent" }}>{m}</span>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", height:"calc(100% - 32px)" }}>
                {/* Left panel */}
                <div className="mock-left">
                  <div style={{ fontSize:9, color:"rgba(77,217,172,.7)", letterSpacing:1,
                    display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#4dd9ac",
                      boxShadow:"0 0 6px #4dd9ac", display:"inline-block" }} />
                    LIVE
                  </div>
                  <img src="/characters/EVE_SHIELD.jpeg" className="mock-avatar" alt="Eve" />
                  <div style={{ fontSize:11, fontFamily:"Cinzel, serif", letterSpacing:1 }}
                    className="gold-text">EVE</div>
                  <div className="mock-waves">
                    {[1,2,3,4,5].map(i => <div key={i} className="mock-wave" />)}
                  </div>
                  <div style={{ width:"100%", marginTop:8, padding:"8px",
                    background:"rgba(0,0,0,.3)", borderRadius:6,
                    border:"1px solid rgba(200,169,81,.12)", fontSize:9,
                    color:"rgba(77,217,172,.7)", fontFamily:"monospace", lineHeight:1.8 }}>
                    <div>▸ AGENT TRACE</div>
                    <div style={{ color:"rgba(200,169,81,.5)" }}>routing -{">"} qwen7b</div>
                    <div style={{ color:"rgba(77,217,172,.6)" }}>tool -{">"} web_search</div>
                    <div style={{ color:"rgba(200,169,81,.5)" }}>response {"<-"} ok</div>
                  </div>
                  <div style={{ width:"100%", marginTop:"auto", padding:"8px",
                    background:"rgba(0,0,0,.3)", borderRadius:6,
                    border:"1px solid rgba(200,169,81,.12)" }}>
                    <div style={{ fontSize:9, color:"rgba(200,169,81,.4)", marginBottom:4 }}>COMPUTE</div>
                    {[["Featherless","Free","#4ade80"],["ZeroGPU","Free","#c8a951"],["Power Mode","7B","#fb923c"]].map(([n,c,col]) => (
                      <div key={n} style={{ display:"flex", alignItems:"center", gap:5,
                        padding:"3px 4px", fontSize:9, color:"rgba(232,213,160,.6)" }}>
                        <span style={{ width:5, height:5, borderRadius:"50%",
                          background:col, display:"inline-block" }} />
                        <span style={{ flex:1 }}>{n}</span>
                        <span style={{ color:"rgba(200,169,81,.4)" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right chat */}
                <div className="mock-right">
                  <div className="mock-chat-area">
                    <div className="mock-bubble eve" style={{ animationDelay:".2s" }}>
                      Hello — I&apos;m Eve. Beryl LLM is active. How can I help you today?
                    </div>
                    <div className="mock-bubble user" style={{ animationDelay:".6s" }}>
                      Search for the latest on generative AI and summarize
                    </div>
                    <div className="mock-bubble tool" style={{ animationDelay:"1s" }}>
                      ▸ web_search("generative AI news 2025") -{">"} 4 results
                    </div>
                    <div className="mock-bubble eve" style={{ animationDelay:"1.4s" }}>
                      Here&apos;s what&apos;s trending: Anthropic launched Claude 4, xAI released Grok-3 with vision,
                      OpenAI previewed GPT-5. Multimodal agents are dominating the space right now.
                      <span className="mock-cursor" />
                    </div>
                  </div>
                  <div className="mock-input-row">
                    <div className="mock-input-field">Ask Eve anything...<span className="mock-cursor" /></div>
                    <div style={{ width:24, height:24, borderRadius:"50%",
                      background:"rgba(77,217,172,.15)", border:"1px solid rgba(77,217,172,.3)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#4dd9ac", fontSize:10 }}>♪</div>
                    <div style={{ width:24, height:24, borderRadius:"50%",
                      background:"linear-gradient(135deg,#c8a951,#f0d060)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#0a0604", fontSize:10, fontWeight:700 }}>›</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop:24, fontSize:12, color:"rgba(200,169,81,.4)",
            fontFamily:"Cinzel, serif", letterSpacing:2 }}>
            BERYL LLM — YOUR INTELLIGENCE STACK
          </p>
        </section>

        {/* ═══ BERYL LLM PIPELINE CALLOUT ════════════════════════════════════ */}
        <section style={{ padding:"60px 40px", maxWidth:1200, margin:"0 auto" }}>
          <div className="velvet-panel section-fade" style={{ padding:"48px 48px 40px", borderRadius:16 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:48, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:280 }}>
                <div style={{ fontSize:10, fontFamily:"Cinzel,serif", letterSpacing:3,
                  color:"rgba(77,217,172,.8)", marginBottom:12 }}>THE ENGINE</div>
                <h2 style={{ fontFamily:"'Cinzel Decorative',Cinzel,serif", fontWeight:900,
                  fontSize:32, lineHeight:1.15, marginBottom:16 }}>
                  <span className="shimmer-text">Beryl LLM</span>
                  <br />
                  <span style={{ fontSize:18, fontWeight:400, color:"rgba(232,213,160,.6)",
                    fontFamily:"Cinzel,serif", letterSpacing:2 }}>is the pipeline</span>
                </h2>
                <p style={{ color:"rgba(232,213,160,.65)", lineHeight:1.8, fontSize:14, maxWidth:440 }}>
                  Every response Eve gives is routed through a purpose-built inference pipeline:
                  Qwen2.5 for reasoning, GLM-4 for emotional depth, Hermes-3 for tool
                  orchestration — all accessed via the HF Router with ZeroGPU burst
                  capability. This is not a wrapper. This is Beryl LLM.
                </p>
              </div>
              <div style={{ flex:1, minWidth:260, display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { model:"Qwen2.5-72B", role:"Reasoning & Analysis", color:"#c8a951" },
                  { model:"Qwen2.5-7B", role:"Speed & Conversational", color:"#f0d060" },
                  { model:"GLM-4", role:"Emotional Intelligence", color:"#4dd9ac" },
                  { model:"Hermes-3", role:"Tool Use & Orchestration", color:"#7ec8e3" },
                  { model:"ZeroGPU Local", role:"On-device GPU Boost", color:"#fb923c" },
                ].map(({ model, role, color }) => (
                  <div key={model} style={{ display:"flex", alignItems:"center", gap:14,
                    padding:"10px 16px", background:"rgba(0,0,0,.35)",
                    border:`1px solid ${color}22`, borderRadius:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color,
                      boxShadow:`0 0 8px ${color}`, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color }}>{model}</div>
                      <div style={{ fontSize:11, color:"rgba(232,213,160,.45)" }}>{role}</div>
                    </div>
                    <div style={{ marginLeft:"auto", width:80, height:4,
                      background:"rgba(255,255,255,.06)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:color, width:"78%",
                        animation:"progress-fill 2s ease both", borderRadius:2,
                        boxShadow:`0 0 6px ${color}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE GIF-LOOP GRID ══════════════════════════════════════════ */}
        <section style={{ padding:"20px 40px 60px", maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:10, fontFamily:"Cinzel,serif", letterSpacing:3,
              color:"rgba(200,169,81,.5)", marginBottom:10 }}>CAPABILITIES</div>
            <h2 style={{ fontFamily:"'Cinzel Decorative',Cinzel,serif", fontWeight:900,
              fontSize:"clamp(24px,4vw,42px)", lineHeight:1.2 }}>
              <span className="gold-text">Everything You Need.</span>
              <br />
              <span style={{ color:"rgba(232,213,160,.5)", fontWeight:400,
                fontFamily:"Cinzel,serif", fontSize:"0.6em", letterSpacing:3 }}>
                NOTHING YOU DON&apos;T.
              </span>
            </h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", gap:24 }}>

            {/* Card 1 — Multi-model chat */}
            <FeatureCard
              icon="🧠"
              title="Multi-Model Intelligence"
              subtitle="Auto-routed to the right brain"
              color="#c8a951"
              demo={<ChatDemo />}
            >
              Qwen for logic. GLM for empathy. Hermes for tools.
              Eve intelligently routes every conversation to the model best suited — with zero
              configuration on your part.
            </FeatureCard>

            {/* Card 2 — Computer Use */}
            <FeatureCard
              icon="🖥️"
              title="Computer Use"
              subtitle="Hermes-3 orchestrated"
              color="#4dd9ac"
              demo={<ComputerUseDemo />}
            >
              Web search, app launch, clipboard read, screenshot — Eve reaches into your
              machine and acts. Powered by Hermes-3 intent classification and native
              PowerShell execution.
            </FeatureCard>

            {/* Card 3 — Voice */}
            <FeatureCard
              icon="🎙️"
              title="Voice I/O"
              subtitle="Speak. Listen. Respond."
              color="#7ec8e3"
              demo={<VoiceDemo />}
            >
              Full-duplex voice: Web Speech API for real-time transcription, SpeechSynthesis
              for Eve&apos;s responses. Talk to your AI the way you talk to a person.
            </FeatureCard>

            {/* Card 4 — ZeroGPU */}
            <FeatureCard
              icon="⚡"
              title="ZeroGPU Boost"
              subtitle="Free GPU — on demand"
              color="#fb923c"
              demo={<GpuDemo />}
            >
              Switch to ZeroGPU mode and Eve loads Qwen2.5 locally on a real A10G GPU.
              Free. No credit card. Auto-sleeps after 10 minutes of inactivity to keep
              costs at zero.
            </FeatureCard>

            {/* Card 5 — Memory */}
            <FeatureCard
              icon="💾"
              title="Persistent Memory"
              subtitle="She remembers you"
              color="#a78bfa"
              demo={<MemoryDemo />}
            >
              Session memory holds 40 turns. Long-term facts persist to disk — your name,
              preferences, projects. Eve builds a mental model of you over time.
            </FeatureCard>

            {/* Card 6 — Streaming */}
            <FeatureCard
              icon="⚡"
              title="Live Streaming"
              subtitle="Word-by-word, always"
              color="#f472b6"
              demo={<StreamDemo />}
            >
              Responses stream token-by-token with smooth word-pacing animation.
              No waiting for the full answer — Eve starts talking the moment she starts thinking.
            </FeatureCard>

          </div>
        </section>

        {/* ═══ DOWNLOAD PANEL ════════════════════════════════════════════════ */}
        <section id="download" style={{ padding:"60px 40px 80px", maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:10, fontFamily:"Cinzel,serif", letterSpacing:3,
              color:"rgba(200,169,81,.5)", marginBottom:10 }}>GET BERYL DESKTOP</div>
            <h2 style={{ fontFamily:"'Cinzel Decorative',Cinzel,serif", fontWeight:900,
              fontSize:"clamp(28px,5vw,52px)" }}>
              <span className="shimmer-text">Download &amp; Install</span>
            </h2>
            <p style={{ color:"rgba(232,213,160,.5)", fontSize:14, marginTop:12, maxWidth:480, margin:"12px auto 0" }}>
              One installer. No Python. No dependencies. Beryl LLM runs on HF infrastructure —
              your machine just needs a browser and internet.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>

            {/* Windows — AVAILABLE */}
            <div className="velvet-panel" style={{ borderRadius:14, padding:"36px 28px",
              textAlign:"center", position:"relative", overflow:"hidden",
              borderColor:"rgba(200,169,81,.35)" }}>
              {/* gold glow top */}
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                width:200, height:3,
                background:"linear-gradient(90deg,transparent,#c8a951,transparent)" }} />
              <div style={{ fontSize:48, marginBottom:12 }}>⊞</div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:18, fontWeight:700,
                marginBottom:4 }} className="gold-text">Windows 11</div>
              <div style={{ fontSize:12, color:"rgba(232,213,160,.5)", marginBottom:20 }}>
                x64 · NSIS Installer · v1.0.0
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {["Eve AI companion","Multi-model LLM","Computer use","Voice I/O","75 MB installer"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8,
                    fontSize:12, color:"rgba(232,213,160,.6)" }}>
                    <span style={{ color:"#4dd9ac", fontSize:10 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a
                href="/Beryl Desktop Setup 1.0.0.exe"
                download
                className="dl-btn"
                style={{ display:"block", textAlign:"center" }}
              >
                ↓ Download for Windows
              </a>
              <div style={{ marginTop:12, fontSize:10, color:"rgba(200,169,81,.35)",
                fontFamily:"Cinzel,serif", letterSpacing:1 }}>
                FREE · OPEN BETA
              </div>
            </div>

            {/* macOS — Coming Soon */}
            <ComingSoonCard os="macOS" icon="⌘" detail="Apple Silicon · M1/M2/M3" />

            {/* Linux — Coming Soon */}
            <ComingSoonCard os="Linux" icon="🐧" detail="AppImage · Ubuntu/Debian" />

          </div>

          {/* Beryl Live Desktop callout */}
          <div className="velvet-panel" style={{ marginTop:28, borderRadius:12,
            padding:"24px 32px", display:"flex", alignItems:"center",
            gap:24, flexWrap:"wrap", borderColor:"rgba(77,217,172,.2)" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#4dd9ac",
              boxShadow:"0 0 12px #4dd9ac, 0 0 24px rgba(77,217,172,.4)",
              flexShrink:0, animation:"glow-pulse 2s infinite" }} />
            <div style={{ flex:1, minWidth:220 }}>
              <div style={{ fontFamily:"Cinzel,serif", fontWeight:700, fontSize:14,
                marginBottom:4 }} className="teal-text">
                BERYL LIVE — DESKTOP <span style={{ color:"rgba(232,213,160,.35)",
                  fontSize:11, fontWeight:400, letterSpacing:2 }}>COMING SOON</span>
              </div>
              <div style={{ fontSize:12, color:"rgba(232,213,160,.5)", lineHeight:1.6 }}>
                The full Beryl Live streaming avatar experience — Eve rendered in real-time via
                Runway AI — is coming natively to the desktop app. One click to go live.
              </div>
            </div>
            <div style={{ padding:"8px 20px", border:"1px solid rgba(77,217,172,.3)",
              borderRadius:6, fontSize:11, color:"rgba(77,217,172,.6)",
              fontFamily:"Cinzel,serif", letterSpacing:2, whiteSpace:"nowrap" }}>
              NOTIFY ME ›
            </div>
          </div>
        </section>

        {/* ═══ STATS STRIP ═══════════════════════════════════════════════════ */}
        <section className="velvet-panel" style={{ margin:"0", borderRadius:0,
          borderLeft:"none", borderRight:"none", padding:"40px 40px" }}>
          <div style={{ maxWidth:1000, margin:"0 auto",
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, textAlign:"center" }}>
            {[
              { val:"5+", label:"LLM Models", color:"#c8a951" },
              { val:"6",  label:"Computer Use Tools", color:"#4dd9ac" },
              { val:"75MB", label:"Installer Size", color:"#7ec8e3" },
              { val:"Free", label:"ZeroGPU Inference", color:"#fb923c" },
            ].map(({ val, label, color }) => (
              <div key={label}>
                <div className="stat-counter" style={{ fontSize:"clamp(28px,4vw,48px)",
                  fontFamily:"Cinzel,serif", fontWeight:900, color }}>{val}</div>
                <div style={{ fontSize:11, color:"rgba(232,213,160,.4)",
                  letterSpacing:2, fontFamily:"Cinzel,serif", marginTop:4,
                  textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ TEST ON HF SPACE ══════════════════════════════════════════════ */}
        <section style={{ padding:"72px 40px", textAlign:"center" }}>
          <div style={{ maxWidth:640, margin:"0 auto" }}>
            <div style={{ fontSize:10, fontFamily:"Cinzel,serif", letterSpacing:3,
              color:"rgba(200,169,81,.5)", marginBottom:12 }}>BEFORE YOU INSTALL</div>
            <h2 style={{ fontFamily:"'Cinzel Decorative',Cinzel,serif", fontWeight:900,
              fontSize:"clamp(22px,3.5vw,36px)", marginBottom:16 }}>
              <span className="gold-text">Try It Live</span>
              <span style={{ color:"rgba(232,213,160,.4)", fontFamily:"Cinzel,serif",
                fontWeight:400, fontSize:"0.55em", letterSpacing:3, display:"block", marginTop:4 }}>
                FULL BERYL LLM ON HUGGINGFACE
              </span>
            </h2>
            <p style={{ fontSize:14, color:"rgba(232,213,160,.55)", lineHeight:1.8, marginBottom:36 }}>
              The exact same Beryl Desktop interface — Eve panel, chat, model tabs, ZeroGPU tiers —
              runs live on our HuggingFace Space. Open it in any browser, no install required.
            </p>
            <a
              href="https://huggingface.co/spaces/AIBRUH/beryl-chat-api"
              target="_blank"
              rel="noopener noreferrer"
              className="dl-btn"
              style={{ fontSize:12, padding:"14px 32px" }}
            >
              Open Beryl on HuggingFace ›
            </a>
          </div>
        </section>

        {/* ═══ FOOTER CTA ════════════════════════════════════════════════════ */}
        <section style={{ padding:"40px 40px 80px", textAlign:"center",
          borderTop:"1px solid rgba(200,169,81,.1)" }}>
          <p style={{ fontFamily:"Cinzel,serif", fontSize:11, letterSpacing:2,
            color:"rgba(200,169,81,.3)", marginBottom:20 }}>
            BERYL DESKTOP · POWERED BY BERYL LLM · FREE OPEN BETA
          </p>
          <Link href="/demo" style={{ fontSize:12, color:"rgba(200,169,81,.5)",
            fontFamily:"Cinzel,serif", letterSpacing:2, textDecoration:"none" }}>
            ← Back to Beryl Live
          </Link>
        </section>

      </main>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function FeatureCard({ icon, title, subtitle, color, demo, children }: {
  icon: string; title: string; subtitle: string; color: string;
  demo: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="velvet-panel feature-card" style={{ borderRadius:14, overflow:"hidden" }}>
      {/* Demo area */}
      <div style={{ height:200, background:"#080503", borderBottom:"1px solid rgba(200,169,81,.1)",
        position:"relative", overflow:"hidden", display:"flex",
        alignItems:"center", justifyContent:"center" }}>
        {demo}
        {/* corner accent */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${color}55,transparent)` }} />
      </div>
      {/* Content */}
      <div style={{ padding:"20px 22px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={{ fontSize:22 }}>{icon}</span>
          <div>
            <div style={{ fontFamily:"Cinzel,serif", fontWeight:700, fontSize:14, color }}>{title}</div>
            <div style={{ fontSize:11, color:"rgba(232,213,160,.4)", letterSpacing:1 }}>{subtitle}</div>
          </div>
        </div>
        <p style={{ fontSize:13, color:"rgba(232,213,160,.6)", lineHeight:1.7 }}>{children}</p>
      </div>
    </div>
  );
}

function ComingSoonCard({ os, icon, detail }: { os: string; icon: string; detail: string }) {
  return (
    <div className="velvet-panel" style={{ borderRadius:14, padding:"36px 28px",
      textAlign:"center", opacity:.6 }}>
      <div style={{ fontSize:48, marginBottom:12, filter:"grayscale(1)" }}>{icon}</div>
      <div style={{ fontFamily:"Cinzel,serif", fontSize:18, fontWeight:700,
        color:"rgba(232,213,160,.5)", marginBottom:4 }}>{os}</div>
      <div style={{ fontSize:12, color:"rgba(232,213,160,.3)", marginBottom:24 }}>{detail}</div>
      <div style={{ padding:"14px 0",
        border:"1px solid rgba(232,213,160,.12)", borderRadius:6,
        fontSize:12, color:"rgba(232,213,160,.3)",
        fontFamily:"Cinzel,serif", letterSpacing:2 }}>
        COMING SOON
      </div>
    </div>
  );
}

/* ── Mini demo animations (simulate GIF loops via CSS) ─────────────────────── */

function ChatDemo() {
  return (
    <div style={{ width:"85%", display:"flex", flexDirection:"column", gap:7, padding:8 }}>
      {[
        { role:"eve", text:"I can reason, remember, and act.", delay:.0 },
        { role:"user",text:"Find me the top AI tools",         delay:.4 },
        { role:"tool",text:"▸ web_search -> 5 results",         delay:.8 },
        { role:"eve", text:"Here are the top 5 right now...", delay:1.2 },
      ].map(({ role, text, delay }, i) => (
        <div key={i} style={{
          alignSelf: role === "user" ? "flex-end" : "flex-start",
          background: role === "eve" ? "rgba(255,255,255,.05)" :
                      role === "user" ? "rgba(200,169,81,.15)" : "rgba(77,217,172,.06)",
          border: `1px solid ${role === "eve" ? "rgba(200,169,81,.15)" : role === "user" ? "rgba(200,169,81,.25)" : "rgba(77,217,172,.2)"}`,
          borderRadius:8, padding:"5px 10px", fontSize:10,
          color: role === "tool" ? "#4dd9ac" : "#e8d5a0",
          maxWidth:"78%", animation:`slide-msg .35s ease ${delay}s both`,
          fontFamily: role === "tool" ? "monospace" : "inherit",
        }}>{text}</div>
      ))}
    </div>
  );
}

function ComputerUseDemo() {
  return (
    <div style={{ width:"85%", fontSize:10, fontFamily:"monospace", padding:12 }}>
      <div style={{ background:"rgba(0,0,0,.5)", borderRadius:8, padding:12,
        border:"1px solid rgba(77,217,172,.2)" }}>
        {[
          { t:'user -> "search the web for Beryl AI"', c:"rgba(200,169,81,.7)", d:.0 },
          { t:"hermes -> intent: web_search",          c:"rgba(77,217,172,.6)", d:.3 },
          { t:"tool -> DuckDuckGo instant answer",     c:"rgba(77,217,172,.8)", d:.6 },
          { t:"result -> 3 results found",             c:"rgba(77,217,172,.5)", d:.9 },
          { t:"eve -> Here's what I found...",         c:"rgba(200,169,81,.7)", d:1.2 },
        ].map(({ t, c, d }, i) => (
          <div key={i} style={{ color:c, marginBottom:5, lineHeight:1.5,
            animation:`slide-msg .3s ease ${d}s both` }}>
            <span style={{ color:"rgba(255,255,255,.2)" }}>$ </span>{t}
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:4,
          color:"rgba(77,217,172,.4)", marginTop:4 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#4dd9ac",
            animation:"glow-pulse 1.2s infinite" }} />
          ready
        </div>
      </div>
    </div>
  );
}

function VoiceDemo() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      {/* Mic button with pulse rings */}
      <div style={{ position:"relative", width:70, height:70 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%",
          border:"1px solid rgba(77,217,172,.4)", animation:"pulse-ring 1.5s ease-out infinite" }} />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%",
          border:"1px solid rgba(77,217,172,.3)", animation:"pulse-ring 1.5s ease-out .5s infinite" }} />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%",
          background:"rgba(77,217,172,.15)", border:"2px solid rgba(77,217,172,.6)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:24 }}>🎙️</div>
      </div>
      <div style={{ display:"flex", gap:3, height:24, alignItems:"flex-end" }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ width:4, borderRadius:2, background:"#4dd9ac",
            animation:`wave-bar ${.8 + i*.1}s ease-in-out ${i*.07}s infinite`,
            height: [10,16,22,24,20,14,8][i-1] }} />
        ))}
      </div>
      <div style={{ fontSize:11, color:"rgba(77,217,172,.6)", letterSpacing:1,
        fontFamily:"Cinzel,serif" }}>LISTENING…</div>
    </div>
  );
}

function GpuDemo() {
  return (
    <div style={{ width:"85%", fontSize:10, fontFamily:"monospace", padding:8 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {[
          { label:"Tier",    val:"ZeroGPU A10G",   color:"#fb923c", w:"65%" },
          { label:"Model",   val:"Qwen2.5-1.5B",   color:"#c8a951", w:"55%" },
          { label:"VRAM",    val:"2.1 GB / 23 GB", color:"#4dd9ac", w:"18%" },
          { label:"Latency", val:"~1.2s first tok", color:"#7ec8e3", w:"40%" },
        ].map(({ label, val, color, w }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:52, color:"rgba(232,213,160,.4)", flexShrink:0 }}>{label}</div>
            <div style={{ flex:1, height:16, background:"rgba(255,255,255,.04)",
              borderRadius:3, overflow:"hidden", border:"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ height:"100%", width:w, background:color,
                opacity:.7, animation:"progress-fill 2s ease both",
                display:"flex", alignItems:"center", paddingLeft:6, fontSize:9,
                color:"#0a0604", fontWeight:700, whiteSpace:"nowrap",
                boxShadow:`0 0 8px ${color}` }}>{val}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop:4, color:"#fb923c", display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#fb923c",
            animation:"glow-pulse 1s infinite" }} />
          GPU active · sleeps after 10m idle
        </div>
      </div>
    </div>
  );
}

function MemoryDemo() {
  return (
    <div style={{ width:"85%", fontSize:10, padding:8 }}>
      <div style={{ background:"rgba(0,0,0,.4)", borderRadius:8, padding:10,
        border:"1px solid rgba(167,139,250,.2)" }}>
        <div style={{ color:"rgba(167,139,250,.7)", marginBottom:8, letterSpacing:1 }}>LONG-TERM MEMORY</div>
        {[
          "name: AIBRUH",
          "role: AI builder / founder",
          "stack: Windows 11 · CUDA · HF",
          "project: Beryl Live OS",
          "preference: no verbose answers",
        ].map((line, i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:4,
            color:"rgba(232,213,160,.55)", animation:`slide-msg .3s ease ${i*.15}s both` }}>
            <span style={{ color:"rgba(167,139,250,.5)" }}>›</span>
            <span style={{ fontFamily:"monospace" }}>{line}</span>
          </div>
        ))}
        <div style={{ borderTop:"1px solid rgba(167,139,250,.1)", marginTop:8, paddingTop:6,
          color:"rgba(167,139,250,.4)", fontSize:9 }}>
          session: 40 turns · long-term: 5 facts stored
        </div>
      </div>
    </div>
  );
}

function StreamDemo() {
  const words = ["Streaming", "tokens", "appear", "word", "by", "word", "—", "smooth,", "live,", "and", "instant."];
  return (
    <div style={{ width:"85%", padding:12 }}>
      <div style={{ background:"rgba(255,255,255,.03)", borderRadius:8, padding:12,
        border:"1px solid rgba(244,114,182,.2)", fontSize:12, lineHeight:1.8,
        color:"#e8d5a0" }}>
        {words.map((w, i) => (
          <span key={i} style={{
            display:"inline", opacity:0,
            animation:`fade-in-up .2s ease ${.3 + i*.12}s both`,
          }}>{w} </span>
        ))}
        <span style={{ display:"inline-block", width:2, height:14, background:"#f472b6",
          verticalAlign:"middle", animation:"cursor-blink .8s infinite" }} />
      </div>
      <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6, fontSize:10 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#f472b6",
          animation:"glow-pulse 1s infinite" }} />
        <span style={{ color:"rgba(244,114,182,.5)" }}>22ms per token · word-paced delivery</span>
      </div>
    </div>
  );
}
