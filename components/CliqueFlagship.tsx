"use client";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import CliqueRoster from "./CliqueRoster";

/* ══════════════════════════════════════════════════════════════════════════
   THE CLIQUE — FLAGSHIP LANDING PAGE
   Video chat with your AI agents. The end of coding agents.
   Theme: "Why code when you can host a live meeting with your AI agents?"
══════════════════════════════════════════════════════════════════════════ */

const FLAG_KF = `
@keyframes cf-shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
@keyframes cf-fade-up { from{opacity:0;transform:translateY(34px)} to{opacity:1;transform:translateY(0)} }
@keyframes cf-live { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }
@keyframes cf-scroll-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
.cf-gold {
  background:linear-gradient(110deg,#6b4f0a,#c8a951 18%,#fff8c0 38%,#f5e070 50%,#fff8c0 62%,#c8a951 82%,#6b4f0a);
  background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; animation:cf-shimmer 4s linear infinite;
}
.cf-fade { animation:cf-fade-up .9s ease both; }
.cf-fade-2 { animation:cf-fade-up .9s .18s ease both; }
.cf-fade-3 { animation:cf-fade-up .9s .36s ease both; }
.cf-btn-primary {
  display:inline-block; padding:16px 46px;
  font-family:'Cinzel',serif; font-size:12px; font-weight:700; letter-spacing:3px;
  text-transform:uppercase; text-decoration:none; color:#0a0604;
  background:linear-gradient(110deg,#8B6914,#c8a951,#fff8c0,#f5e070,#c8a951,#8B6914);
  background-size:200% auto; border:1px solid rgba(245,224,112,.4);
  box-shadow:0 0 24px rgba(200,169,81,.25); transition:box-shadow .3s, transform .2s;
}
.cf-btn-primary:hover { box-shadow:0 0 40px rgba(200,169,81,.55); transform:translateY(-2px); }
.cf-btn-ghost {
  display:inline-block; padding:16px 42px;
  font-family:'Cinzel',serif; font-size:12px; font-weight:700; letter-spacing:3px;
  text-transform:uppercase; text-decoration:none; color:rgba(200,169,81,.85);
  border:1px solid rgba(200,169,81,.35); background:rgba(200,169,81,.04); transition:all .25s;
}
.cf-btn-ghost:hover { border-color:rgba(200,169,81,.75); background:rgba(200,169,81,.1); color:#f5e070; }
.cf-chip { transition:transform .25s, border-color .25s, background .25s; }
.cf-chip:hover { transform:translateY(-3px); border-color:rgba(200,169,81,.6) !important; }
@media(max-width:860px){
  .cf-hero-title { font-size:40px !important; }
  .cf-split { grid-template-columns:1fr !important; }
  .cf-h2 { font-size:34px !important; }
  .cf-pad { padding:72px 28px !important; }
}
`;

/* ─── HERO — VIDEO ─────────────────────────────────────────────────────────── */
function VideoHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const tryPlay = () => {
    const v = ref.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Autoplay was blocked — retry once on first user interaction.
        const retry = () => { v.play().catch(() => {}); document.removeEventListener("pointerdown", retry); };
        document.addEventListener("pointerdown", retry, { once: true });
      });
    }
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (v.readyState >= 2) tryPlay();
  }, []);

  return (
    <section style={{
      position: "relative", minHeight: "94vh", background: "#030201",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <video
        ref={ref}
        autoPlay loop muted playsInline preload="auto"
        poster="/images/clique-still-wide.png"
        onLoadedData={() => setLoaded(true)}
        onCanPlay={tryPlay}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 1s ease" }}
      >
        <source src="/videos/clique-hero.mp4" type="video/mp4" />
      </video>

      {/* Cinematic overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(3,2,1,.6) 0%,rgba(3,2,1,.28) 42%,rgba(3,2,1,.82) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%,transparent 30%,rgba(3,2,1,.55) 100%)" }} />

      {/* Center lockup */}
      <div className="cf-pad" style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 40px", maxWidth: 960 }}>
        <div className="cf-fade" style={{
          display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 28,
          padding: "7px 20px", border: "1px solid rgba(200,169,81,.35)",
          background: "rgba(6,4,10,.45)", borderRadius: 22, backdropFilter: "blur(6px)",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc3c3c", animation: "cf-live 1.3s ease-in-out infinite", boxShadow: "0 0 8px #dc3c3c" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", color: "#f5e070" }}>
            Beryl Live Human Operating System · The Clique
          </span>
        </div>

        <h1 className="cf-hero-title cf-fade-2" style={{
          fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 60, fontWeight: 900,
          lineHeight: 1.12, color: "#fff", marginBottom: 24,
          textShadow: "0 4px 40px rgba(0,0,0,.9)",
        }}>
          Why code, when you can host a<br />
          <span className="cf-gold">live meeting</span> with your AI agents?
        </h1>

        <p className="cf-fade-3" style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontStyle: "italic",
          color: "rgba(253,250,246,.82)", lineHeight: 1.65, maxWidth: 680, margin: "0 auto 40px",
          textShadow: "0 2px 20px rgba(0,0,0,.9)",
        }}>
          The world's first video chat with a room full of AI agents. No prompts.
          No config files. Just open the room and start talking.
        </p>

        <div className="cf-fade-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/demo" className="cf-btn-primary">Start a Live Session ›</Link>
          <a href="#roster" className="cf-btn-ghost">Meet the Clique ↓</a>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "cf-scroll-bob 2s ease-in-out infinite" }}>
        <div style={{ width: 1, height: 44, background: "linear-gradient(#c8a951,transparent)" }} />
      </div>
    </section>
  );
}

/* ─── OLD WAY BANNER — CODING IS THE OLD WAY ────────────────────────────────── */
const OLDWAY_KF = `
@keyframes ow-fade-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes ow-flicker { 0%,100%{opacity:1} 45%{opacity:1} 46%{opacity:.55} 47%{opacity:1} 72%{opacity:1} 73%{opacity:.6} 74%{opacity:1} }
@keyframes ow-pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
@media(max-width:900px){
  .ow-split { grid-template-columns:1fr !important; }
  .ow-title { font-size:34px !important; }
}
`;

function OldWayBanner() {
  return (
    <section className="cf-pad" style={{
      position: "relative", overflow: "hidden",
      background: "linear-gradient(160deg,#050505 0%,#0a0a0a 55%,#050505 100%)",
      padding: "100px 60px",
    }}>
      <style>{OLDWAY_KF}</style>

      {/* Cold red warning glow, opposite of the gold/green Clique palette */}
      <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(150,20,20,.12) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="ow-split" style={{
        position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1.05fr 1fr",
        gap: 60, alignItems: "center", maxWidth: 1200, margin: "0 auto",
      }}>
        {/* GIF — the old way */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -2, borderRadius: 14, background: "linear-gradient(135deg,rgba(150,20,20,.4),rgba(80,80,80,.2),transparent)", filter: "blur(2px)" }} />
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(120,30,30,.4)", boxShadow: "0 30px 80px rgba(0,0,0,.7)", filter: "grayscale(.25) contrast(1.05)" }}>
            <video
              autoPlay loop muted playsInline preload="auto"
              aria-label="A lone engineer writing code alone at night — the old way of building AI agents"
              style={{ width: "100%", display: "block" }}
              onCanPlay={(e) => {
                const v = e.currentTarget;
                const p = v.play();
                if (p && typeof p.catch === "function") {
                  p.catch(() => {
                    const retry = () => { v.play().catch(() => {}); document.removeEventListener("pointerdown", retry); };
                    document.addEventListener("pointerdown", retry, { once: true });
                  });
                }
              }}
            >
              <source src="/videos/old-way-coding.mp4" type="video/mp4" />
            </video>
            {/* Dead signal tag */}
            <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 6, background: "rgba(10,4,4,.75)", border: "1px solid rgba(150,30,30,.5)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#8a1e1e", animation: "ow-pulse 2.2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#c97a7a", textTransform: "uppercase" }}>No Team · No Voice · Alone</span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="ow-fade" style={{ animation: "ow-fade-up .9s ease both" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", color: "#9a4a4a", marginBottom: 20 }}>
            This Was Everyone's Reality
          </div>
          <h2 className="ow-title" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 46, fontWeight: 900, lineHeight: 1.16, color: "#e8e4de", marginBottom: 22 }}>
            <span style={{ animation: "ow-flicker 6s ease-in-out infinite" }}>One man.</span><br />
            One terminal.<br />
            <span style={{ color: "#a83232" }}>A thousand lines of code nobody sees.</span>
          </h2>

          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(230,225,220,.55)", lineHeight: 1.8, margin: "0 0 26px" }}>
            This is what building an AI team used to look like — alone in the dark,
            staring at a wall of syntax, hoping the agent you can't see is doing what
            you think it's doing. No face. No voice. No room. Just you and the code.
          </p>

          <div style={{
            display: "inline-block", padding: "14px 28px",
            border: "1px solid rgba(150,30,30,.4)", background: "rgba(120,20,20,.08)",
            fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", color: "#c97a7a",
          }}>
            The old way ends here. →
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── INTRO BANNER — THE END OF CODING AGENTS ──────────────────────────────── */
function IntroBanner() {
  return (
    <section className="cf-pad" style={{
      position: "relative", background: "linear-gradient(160deg,#060409 0%,#0a0712 50%,#060409 100%)",
      padding: "110px 60px", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-10%", right: "-8%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle,rgba(76,175,80,.07) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="cf-split" style={{
        position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1.15fr",
        gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto",
      }}>
        {/* Copy */}
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", color: "#4CAF50", marginBottom: 20 }}>
            A New Category of Software
          </div>
          <h2 className="cf-h2" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 46, fontWeight: 900, lineHeight: 1.15, color: "#fff", marginBottom: 22 }}>
            The end of coding<br />AI agents.<br />
            <span className="cf-gold">Now you speak to them.</span>
          </h2>

          <div style={{
            display: "inline-block", margin: "8px 0 26px", padding: "12px 26px",
            border: "1px solid rgba(200,169,81,.4)", background: "rgba(200,169,81,.06)",
            fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", color: "#f5e070",
          }}>
            ✦ The first agent video chat
          </div>

          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(253,250,246,.62)", lineHeight: 1.8, margin: 0 }}>
            For years, wiring agents together meant hundreds of lines of Python, brittle
            pipelines, and prompts that reset the moment you walked away. Beryl Clique
            replaces all of it with a room — where your agents have faces, voices, and
            memory, and answer the moment you say their name.
          </p>
        </div>

        {/* Cleo — cutout portrait, background removed */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          {/* Ambient glow behind her */}
          <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(200,169,81,.22) 0%,transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <img
            src="/images/cleo-cutout.png"
            alt="Cleo — engineer of The Clique"
            style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 460, display: "block", filter: "drop-shadow(0 30px 60px rgba(0,0,0,.65))" }}
          />
          {/* Name tag */}
          <div style={{ position: "absolute", zIndex: 3, bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 7, background: "rgba(6,4,10,.72)", border: "1px solid rgba(200,169,81,.4)", borderRadius: 20, padding: "6px 16px", backdropFilter: "blur(6px)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", animation: "cf-live 1.3s ease-in-out infinite", boxShadow: "0 0 6px #4CAF50" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "#f5e070", textTransform: "uppercase" }}>Cleo</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── GREEN BANNER — BUILD / CREATE / DEPLOY ───────────────────────────────── */
function FleurGreenBanner() {
  const pillars = [
    { icon: "⚒", title: "Build", body: "Spin up a working agent team in minutes — no SDK, no orchestration code, no glue scripts." },
    { icon: "✦", title: "Create", body: "Design their roles, voices, and personalities in a live room you can see and hear." },
    { icon: "◈", title: "Deploy", body: "Ship them to your device, site, or channels the moment the meeting ends. One click." },
  ];

  /* Staggered fleur-de-lis field */
  const rows = Array.from({ length: 7 });
  const cols = Array.from({ length: 11 });

  return (
    <section className="cf-pad" style={{
      position: "relative", overflow: "hidden", padding: "120px 60px",
      background: "linear-gradient(135deg,#062416 0%,#0b3d24 38%,#083018 68%,#052012 100%)",
    }}>
      {/* Velvet sheen */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%,rgba(120,220,150,.12) 0%,transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 90%,rgba(0,0,0,.5) 0%,transparent 60%)", pointerEvents: "none" }} />

      {/* Fleur-de-lis pattern */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", pointerEvents: "none", opacity: 0.9 }} aria-hidden="true">
        {rows.map((_, r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-around", paddingLeft: r % 2 ? 48 : 0 }}>
            {cols.map((_, c) => (
              <span key={c} style={{ fontSize: 30, color: "#c8a951", opacity: 0.14, lineHeight: 1 }}>⚜</span>
            ))}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: 22, letterSpacing: 18, color: "rgba(200,169,81,.55)", marginBottom: 22 }}>⚜ ⚜ ⚜</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "rgba(200,169,81,.75)", marginBottom: 18 }}>
          Build · Create · Deploy
        </div>
        <h2 className="cf-h2" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 48, fontWeight: 900, lineHeight: 1.18, marginBottom: 26 }}>
          <span className="cf-gold">The best way to build, create,<br />and deploy AI agents.</span>
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "rgba(240,255,244,.75)", lineHeight: 1.75, maxWidth: 700, margin: "0 auto 56px" }}>
          Every other platform makes you a developer first. Beryl Clique makes you a
          host — you run the meeting, and your agents do the engineering.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 22, marginBottom: 52 }}>
          {pillars.map(p => (
            <div key={p.title} className="cf-chip" style={{
              background: "rgba(4,20,12,.6)", border: "1px solid rgba(200,169,81,.28)",
              borderRadius: 12, padding: "30px 24px", textAlign: "center", backdropFilter: "blur(4px)",
            }}>
              <div style={{ fontSize: 28, color: "#c8a951", marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "#f5e070", marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(240,255,244,.6)", lineHeight: 1.6 }}>{p.body}</div>
            </div>
          ))}
        </div>

        <Link href="/demo" className="cf-btn-primary">Open the Room ›</Link>
      </div>
    </section>
  );
}

/* ─── WHITE BANNER — BERYL LIVE AGENT OS ───────────────────────────────────── */
function AgentOSBanner() {
  const channels = [
    { icon: "💻", label: "Your Device" },
    { icon: "🌐", label: "Your Website" },
    { icon: "📣", label: "Social Media" },
    { icon: "✉", label: "Your Emails" },
    { icon: "⚙", label: "Engineer New" },
  ];

  return (
    <section className="cf-pad" style={{ background: "#FDFAF6", padding: "110px 60px" }}>
      <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 56px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#c8a951", marginBottom: 18 }}>
          Beryl Live · Agent OS
        </div>
        <h2 className="cf-h2" style={{ fontFamily: "'Cinzel',serif", fontSize: 42, fontWeight: 700, lineHeight: 1.22, color: "#0D1117", marginBottom: 22 }}>
          Intelligent, human-like agents that<br />
          <span style={{ color: "#1a5f7a" }}>listen, respond, and get it done.</span>
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontStyle: "italic", color: "#555", lineHeight: 1.8, margin: 0 }}>
          The Beryl Live Agent OS gives you a team that listens and communicates in
          real time — then takes action wherever you work. On your device, across your
          website, through your social media and emails, or to engineer something
          entirely new.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 960, margin: "0 auto" }}>
        {channels.map(c => (
          <div key={c.label} className="cf-chip" style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            width: 160, padding: "26px 18px", background: "#fff",
            border: "1px solid rgba(200,169,81,.25)", borderRadius: 12,
            boxShadow: "0 4px 18px rgba(0,0,0,.04)",
          }}>
            <span style={{ fontSize: 26 }}>{c.icon}</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#0D1117", textAlign: "center" }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 52 }}>
        <Link href="/demo" style={{
          display: "inline-block", padding: "15px 44px", fontFamily: "'Cinzel',serif",
          fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
          textDecoration: "none", color: "#fff",
          background: "linear-gradient(135deg,#1a5f7a,#2b7a99)", border: "1px solid rgba(26,95,122,.5)",
        }}>
          Meet Your Agent OS ›
        </Link>
      </div>
    </section>
  );
}

/* ─── COMPARISON BANNER — CREWAI/LANGCHAIN VS THE CLIQUE ───────────────────── */
const COMPARE_KF = `
@keyframes cmp-shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
@keyframes cmp-blink { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes cmp-slide-u { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes cmp-glow { 0%,100%{box-shadow:0 0 24px rgba(200,169,81,.18)} 50%{box-shadow:0 0 48px rgba(200,169,81,.42)} }
@media(max-width:900px){
  .cmp-cols { grid-template-columns:1fr !important; }
  .cmp-title { font-size:30px !important; }
  .cmp-pad { padding:60px 24px 72px !important; }
}
`;

function ComparisonBanner() {
  const CODE_LINES = [
    { t: "kw", v: "from" }, { t: "pl", v: " crewai " }, { t: "kw", v: "import" }, { t: "pl", v: " Agent, Task, Crew" },
    { t: "br" },
    { t: "kw", v: "from" }, { t: "pl", v: " langchain_openai " }, { t: "kw", v: "import" }, { t: "pl", v: " ChatOpenAI" },
    { t: "br" }, { t: "br" },
    { t: "cm", v: "# agents.yaml · tasks.yaml · crew.yaml · tools.yaml" },
    { t: "br" },
    { t: "pl", v: "backend_engineer " }, { t: "op", v: "=" }, { t: "pl", v: " Agent(" }, { t: "br" },
    { t: "pl", v: "    role" }, { t: "op", v: "=" }, { t: "st", v: '"Backend Engineer"' }, { t: "pl", v: "," }, { t: "br" },
    { t: "pl", v: "    goal" }, { t: "op", v: "=" }, { t: "st", v: '"Design orchestration layer..."' }, { t: "pl", v: "," }, { t: "br" },
    { t: "pl", v: "    backstory" }, { t: "op", v: "=" }, { t: "st", v: '"..."' }, { t: "pl", v: "," }, { t: "br" },
    { t: "pl", v: "    llm" }, { t: "op", v: "=" }, { t: "pl", v: "ChatOpenAI(model" }, { t: "op", v: "=" }, { t: "st", v: '"gpt-4"' }, { t: "pl", v: ")," }, { t: "br" },
    { t: "pl", v: "    tools" }, { t: "op", v: "=" }, { t: "pl", v: "[...], memory" }, { t: "op", v: "=" }, { t: "kw", v: "True" }, { t: "br" },
    { t: "pl", v: ")" }, { t: "br" }, { t: "br" },
    { t: "cm", v: "# ...repeat for every agent, every tool, every task" }, { t: "br" },
    { t: "pl", v: "crew " }, { t: "op", v: "=" }, { t: "pl", v: " Crew(agents" }, { t: "op", v: "=" }, { t: "pl", v: "[...], tasks" }, { t: "op", v: "=" }, { t: "pl", v: "[...])" }, { t: "br" },
    { t: "pl", v: "crew.kickoff()  " }, { t: "cm", v: "# pray it doesn't loop" }, { t: "br" }, { t: "br" },
    { t: "err", v: "RecursionError: maximum recursion depth exceeded" }, { t: "br" },
    { t: "err", v: "  in agent_executor.invoke(...)" },
  ];

  const CHAT_LINES = [
    { who: "Jaydian", role: "host", text: "Jeff, spin up the backend for the new endpoint." },
    { who: "Jeff", role: "jeff", text: "On it — orchestration layer's already scaffolded from last week. Give me 90 seconds." },
    { who: "Jaydian", role: "host", text: "Nu, pull whatever's new on long-context memory." },
    { who: "Nu", role: "nu", text: "Found three papers overnight. I'll have a working prototype before standup." },
    { who: "India", role: "india", text: "Staging's green. Deploying the moment Jeff ships." },
    { who: "Amanda", role: "amanda", text: "Reviewed and approved. Shipping now." },
  ];

  return (
    <section style={{
      position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg,#021a0d 0%,#062416 30%,#0a3020 55%,#072018 75%,#031409 100%)",
    }}>
      <style>{COMPARE_KF}</style>

      {/* Velvet noise texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='v'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23v)' opacity='1'/%3E%3C/svg%3E")`, pointerEvents: "none" }} />

      {/* Fleur-de-lis field */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
        {Array.from({ length: 10 }).map((_, r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-around", paddingLeft: r % 2 ? 56 : 0 }}>
            {Array.from({ length: 12 }).map((_, c) => (
              <span key={c} style={{ fontSize: 36, color: "#7a5c10", opacity: 0.28, lineHeight: "82px", display: "block", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.7))" }}>⚜</span>
            ))}
          </div>
        ))}
      </div>

      {/* Top gold rule */}
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,rgba(200,169,81,.6) 30%,rgba(245,224,112,.9) 50%,rgba(200,169,81,.6) 70%,transparent)" }} />

      {/* ── HERO PHOTO — full width ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative", overflow: "hidden", maxHeight: 680 }}>
          <img
            src="/images/clique-agents-pov.png"
            alt="The Clique — Jaydian hosting a live video meeting with AI agents Jeff, Nu and India"
            style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "center 20%" }}
          />
          {/* Gradient fade into comparison below */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(3,20,10,0) 40%, rgba(3,20,10,0.18) 70%, rgba(3,20,10,0.85) 100%)" }} />

          {/* Live badge */}
          <div style={{ position: "absolute", top: 22, left: 28, display: "flex", alignItems: "center", gap: 7, background: "rgba(3,8,4,.78)", border: "1px solid rgba(76,175,80,.45)", borderRadius: 22, padding: "5px 14px", backdropFilter: "blur(6px)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", animation: "cmp-blink 1.3s ease-in-out infinite", boxShadow: "0 0 7px #4CAF50" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#7ed67e", textTransform: "uppercase" }}>Live Session · Beryl Clique</span>
          </div>

          {/* Bottom caption */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 40px 28px", background: "linear-gradient(transparent, rgba(3,16,8,.92))" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Jaydian · The Host</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic", color: "rgba(200,169,81,.9)" }}>
                  "Jeff, spin up the backend. Nu — pull the latest research. India, deploy to staging."
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(255,255,255,.4)", marginTop: 4 }}>No YAML. No Python. No config files. Just the meeting.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div className="cmp-pad" style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "72px 48px 90px" }}>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "6px 20px", border: "1px solid rgba(200,169,81,.28)", background: "rgba(0,0,0,.35)", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc3c3c", animation: "cmp-blink 1.4s ease-in-out infinite", boxShadow: "0 0 6px #dc3c3c" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3.5, textTransform: "uppercase", color: "#c8a951" }}>The Old Way vs The Clique</span>
          </div>
          <h2 className="cmp-title" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 42, fontWeight: 900, lineHeight: 1.18, color: "#fff", margin: 0 }}>
            Stop writing code.<br />
            <span style={{ background: "linear-gradient(110deg,#6b4f0a,#c8a951 25%,#fff8c0 48%,#f5e070 58%,#c8a951 78%,#6b4f0a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "cmp-shimmer 4s linear infinite" }}>
              Start hosting meetings.
            </span>
          </h2>
        </div>

        {/* ── DUAL PANEL — CODE EDITOR vs LIVE CHAT ── */}
        <div className="cmp-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>

          {/* LEFT — code editor window */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 620, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(220,60,60,.3)", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
            {/* Title bar */}
            <div style={{ background: "#1c1210", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(220,60,60,.2)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
              <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 11, color: "#ff9090", marginLeft: 8 }}>crew_setup.py</span>
              <span style={{ marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#ff7070" }}>CrewAI · LangChain</span>
            </div>
            {/* Code body */}
            <div style={{ background: "#0d0806", flex: 1, padding: "18px 20px", fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 12.5, lineHeight: 1.85, overflowX: "auto" }}>
              {CODE_LINES.map((tok, i) =>
                tok.t === "br" ? <br key={i} /> : (
                  <span key={i} style={{
                    color: tok.t === "kw" ? "#c586c0" : tok.t === "st" ? "#ce9178" : tok.t === "cm" ? "#6a9955" : tok.t === "op" ? "#d4d4d4" : tok.t === "err" ? "#ff5f56" : "#d4d4d4",
                    whiteSpace: "pre",
                  }}>{tok.v}</span>
                )
              )}
            </div>
            <div style={{ padding: "12px 20px", background: "rgba(220,60,60,.08)", borderTop: "1px solid rgba(220,60,60,.2)", fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,.45)" }}>
              6+ packages · 200+ lines · 4 config files · still crashes
            </div>
          </div>

          {/* RIGHT — actual Clique Agents POV photo */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(200,169,81,.42)", boxShadow: "0 20px 50px rgba(0,0,0,.5)", animation: "cmp-glow 3s ease-in-out infinite" }}>
            {/* Title bar */}
            <div style={{ background: "#0e1a10", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(200,169,81,.25)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", animation: "cmp-blink 1.2s ease-in-out infinite", boxShadow: "0 0 6px #4CAF50" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "#a8e6a8", letterSpacing: .5 }}>Beryl Live · The Clique</span>
              <span style={{ marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#f5e070" }}>✦ Live Meeting</span>
            </div>
            {/* Photo body */}
            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
              <img
                src="/images/clique-agents-pov.png"
                alt="The Clique — live video meeting with Jaydian, Jeff, Nu and India"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: "center 22%" }}
              />
            </div>
            <div style={{ padding: "12px 20px", background: "rgba(200,169,81,.08)", borderTop: "1px solid rgba(200,169,81,.22)", fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(200,169,81,.85)" }}>
              Zero install · Zero config · Just say their name
            </div>
          </div>
        </div>

        {/* CTA bar */}
        <div style={{ marginTop: 40, padding: "20px 28px", background: "rgba(200,169,81,.06)", border: "1px solid rgba(200,169,81,.28)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontStyle: "italic", color: "rgba(253,250,246,.7)" }}>
            Your agents are already waiting in the room.
          </span>
          <a href="/demo" style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", textDecoration: "none", color: "#0a0604", background: "linear-gradient(110deg,#8B6914,#c8a951,#fff8c0,#f5e070,#c8a951,#8B6914)", backgroundSize: "200% auto", padding: "12px 28px", borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap" }}>
            Open the Room ›
          </a>
        </div>
      </div>

      {/* Bottom gold rule */}
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,rgba(200,169,81,.6) 30%,rgba(245,224,112,.9) 50%,rgba(200,169,81,.6) 70%,transparent)" }} />
    </section>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */
export default function CliqueFlagship() {
  return (
    <>
      <style>{FLAG_KF}</style>
      <VideoHero />
      <OldWayBanner />
      <IntroBanner />
      <ComparisonBanner />
      <div id="roster"><CliqueRoster /></div>
      <FleurGreenBanner />
      <AgentOSBanner />
    </>
  );
}
