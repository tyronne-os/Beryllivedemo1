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
  useEffect(() => { ref.current?.play().catch(() => {}); }, []);

  return (
    <section style={{
      position: "relative", minHeight: "94vh", background: "#030201",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <video
        ref={ref}
        autoPlay loop muted playsInline
        poster="/images/clique-still-wide.png"
        onLoadedData={() => setLoaded(true)}
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
            Beryl Operating System · The Clique
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

        {/* Still image in monitor-esque frame */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -2, borderRadius: 14, background: "linear-gradient(135deg,rgba(200,169,81,.5),rgba(76,175,80,.3),transparent)", filter: "blur(2px)" }} />
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(200,169,81,.35)", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
            <img src="/images/clique-still.png" alt="The Clique — live video agent chat" style={{ width: "100%", display: "block" }} />
            {/* LIVE tag */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 6, background: "rgba(6,4,10,.7)", border: "1px solid rgba(220,60,60,.5)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc3c3c", animation: "cf-live 1.2s ease-in-out infinite", boxShadow: "0 0 6px #dc3c3c" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2, color: "#ff8080", textTransform: "uppercase" }}>Live Now</span>
            </div>
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

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */
export default function CliqueFlagship() {
  return (
    <>
      <style>{FLAG_KF}</style>
      <VideoHero />
      <IntroBanner />
      <div id="roster"><CliqueRoster /></div>
      <FleurGreenBanner />
      <AgentOSBanner />
    </>
  );
}
