"use client";
import Link from "next/link";
import { useState } from "react";
import { CLIQUE_ROSTER } from "@/lib/clique-roster";

const FEATURES = [
  {
    icon: "🧠",
    title: "QCR Technology",
    sub: "Quantum Consciousness Recollection",
    body: "Every agent builds a genuine relationship with you across sessions. They remember your wins, your preferences, your style. Rapport grows through every interaction. They compete to be your favorite — and that competition makes them better.",
  },
  {
    icon: "🎥",
    title: "Live Avatar Conversations",
    sub: "Powered by Runway × LiveKit × OpenAI Realtime",
    body: "Call any agent by name and they come alive — real-time face, real voice, real personality. The rest of your clique stays in active listening mode, always taking notes. One live session at a time, perfectly orchestrated.",
  },
  {
    icon: "🤝",
    title: "Group Response Intelligence",
    sub: "Pre-rendered collective moments, zero API cost",
    body: "Say \"good job team\" and the whole room celebrates with you — genuinely, naturally, together. Pre-built vault of group reactions (celebration, greeting, agreement, encouragement) triggered instantly. Your clique is a real team.",
  },
  {
    icon: "📝",
    title: "Always-On Scribe",
    sub: "Cleo never misses a word",
    body: "Cleo captures every decision, action item, and insight in real-time — in both listening and live states. NotebookLM-style notetaking that builds a searchable memory of every meeting you've ever had.",
  },
  {
    icon: "📞",
    title: "They Call You",
    sub: "Your AI team reaches out",
    body: "Request a call from any agent and they ring your actual phone — with updates, check-ins, and progress reports in their voice. Grant email and LinkedIn access and they can act on your behalf without you even being in the room.",
  },
  {
    icon: "📱",
    title: "Any Device, Any Camera",
    sub: "Mobile-first from day one",
    body: "Join from your phone, tablet, or laptop. Front-facing camera auto-selected on mobile with device switching and mirror controls. The room comes to you — not the other way around.",
  },
];

const DEFAULT_PREVIEW_IDS = ["amanda","eve","kizzy","jamarr","india","lacara","cleo","naomi","bri"];

export default function CliquePromo() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const previewAgents = DEFAULT_PREVIEW_IDS
    .map(id => CLIQUE_ROSTER.find(a => a.id === id))
    .filter(Boolean);

  return (
    <section id="clique" style={{ background: "#FDFAF6", overflow: "hidden" }}>
      <style>{`
        @keyframes clique-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes clique-glow {
          0%,100% { box-shadow: 0 0 20px rgba(200,169,81,.2); }
          50%      { box-shadow: 0 0 40px rgba(200,169,81,.45), 0 0 80px rgba(200,169,81,.1); }
        }
        @keyframes clique-pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.85); }
        }
        .clique-feat-card:hover {
          border-color: rgba(200,169,81,.55) !important;
          background: rgba(200,169,81,.06) !important;
          transform: translateY(-4px);
        }
        .clique-agent-tile:hover {
          transform: translateY(-8px) scale(1.04) !important;
          border-color: #c8a951 !important;
          box-shadow: 0 12px 40px rgba(200,169,81,.3) !important;
        }
        @media (max-width:768px) {
          .clique-hero-title { font-size: 32px !important; }
          .clique-hero-sub   { font-size: 15px !important; }
          .clique-feat-grid  { grid-template-columns: 1fr !important; }
          .clique-agent-grid { gap: 12px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(160deg,#0d0905 0%,#1a1004 40%,#0d0905 100%)",
        padding: "80px 28px 72px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background shimmer grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(200,169,81,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,81,.8) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        {/* Live indicator */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
          padding: "6px 16px", border: "1px solid rgba(200,169,81,.3)",
          background: "rgba(200,169,81,.06)", borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50",
            display: "inline-block", animation: "clique-pulse-dot 1.4s ease-in-out infinite",
            boxShadow: "0 0 6px #4CAF50" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3,
            textTransform: "uppercase", color: "#c8a951" }}>Now Live on berylize.com</span>
        </div>

        <h2 className="clique-hero-title" style={{
          fontFamily: "'Cinzel Decorative','Cinzel',serif",
          fontSize: 52, fontWeight: 900, letterSpacing: 2,
          background: "linear-gradient(110deg,#6b4f0a 0%,#c8a951 15%,#fff8c0 35%,#f5e070 50%,#fff8c0 65%,#c8a951 85%,#6b4f0a 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          marginBottom: 8, lineHeight: 1.15,
        }}>BERYL CLIQUE</h2>

        <p className="clique-hero-sub" style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 22,
          color: "rgba(253,250,246,.65)", fontStyle: "italic",
          marginBottom: 40, letterSpacing: 1,
        }}>Zoom with live conversational AI avatars — your team, your way.</p>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
          color: "rgba(200,169,81,.7)", lineHeight: 1.75,
          maxWidth: 620, margin: "0 auto 48px",
        }}>
          FaceTime your AI agent clique. Call them by name and they come alive.
          They remember you, compete for your trust, and get real work done —
          together, in the room, always on.
        </p>

        <Link href="/clique" style={{
          display: "inline-block",
          padding: "16px 48px",
          fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700,
          letterSpacing: 3, textTransform: "uppercase", textDecoration: "none",
          color: "#0a0604",
          background: "linear-gradient(110deg,#8B6914 0%,#c8a951 25%,#fff8c0 45%,#f5e070 55%,#c8a951 75%,#8B6914 100%)",
          backgroundSize: "200% auto",
          border: "1px solid rgba(245,224,112,.4)",
          boxShadow: "0 0 30px rgba(200,169,81,.3)",
          animation: "clique-glow 3s ease-in-out infinite",
        }}>Enter the Clique ›</Link>
      </div>

      {/* ── AGENT ROSTER PREVIEW ── */}
      <div style={{ padding: "60px 28px 52px", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 3, textTransform: "uppercase", color: "#4CAF50", marginBottom: 10 }}>
            Your Default Team
          </div>
          <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 600, color: "#0D1117", marginBottom: 6 }}>
            Meet The <span style={{ color: "#1a5f7a" }}>Beryl Clique</span>
          </h3>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
            color: "#888", fontStyle: "italic", marginTop: 4 }}>
            16 agents. Each one wants to earn your trust.
          </p>
          <div style={{ width: 40, height: 2, background: "#4CAF50", margin: "14px auto 0" }} />
        </div>

        <div className="clique-agent-grid" style={{
          display: "flex", flexWrap: "wrap", gap: 18,
          justifyContent: "center", maxWidth: 900, margin: "0 auto",
        }}>
          {previewAgents.map(agent => agent && (
            <div
              key={agent.id}
              className="clique-agent-tile"
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                cursor: "pointer",
                transition: "transform .25s, border-color .25s, box-shadow .25s",
              }}
            >
              <div style={{
                width: 88, height: 88,
                borderRadius: agent.isCSA ? "50%" : 6,
                overflow: "hidden",
                border: hoveredAgent === agent.id
                  ? "2px solid #c8a951"
                  : agent.isCSA
                    ? "2px solid rgba(200,169,81,.6)"
                    : "2px solid rgba(200,169,81,.22)",
                background: "#ddd4c0",
                boxShadow: "0 4px 14px rgba(0,0,0,.08)",
                transition: "border-color .25s, box-shadow .25s",
              }}>
                <img
                  src={agent.portrait}
                  alt={agent.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 600,
                  color: "#0D1117", letterSpacing: 1 }}>{agent.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10,
                  color: "#aaa", fontStyle: "italic", marginTop: 1 }}>{agent.role}</div>
                {agent.isCSA && (
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: 1.5,
                    color: "#c8a951", textTransform: "uppercase", marginTop: 2 }}>CSA</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {hoveredAgent && (() => {
          const a = CLIQUE_ROSTER.find(x => x.id === hoveredAgent);
          return a ? (
            <div style={{
              textAlign: "center", marginTop: 24,
              fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
              color: "#555", fontStyle: "italic", minHeight: 24,
              transition: "opacity .2s",
            }}>
              <strong style={{ color: "#1a5f7a", fontStyle: "normal" }}>{a.name}</strong>
              {" — "}{a.persona}
            </div>
          ) : null;
        })()}
      </div>

      {/* ── 6-FEATURE GRID ── */}
      <div style={{ padding: "64px 28px 72px", background: "#FDFAF6" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 3, textTransform: "uppercase", color: "#c8a951", marginBottom: 10 }}>
            Built Different
          </div>
          <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 600,
            color: "#0D1117" }}>Everything That Makes It One of a Kind</h3>
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#8B6914,#f5e070,#8B6914)",
            margin: "14px auto 0" }} />
        </div>

        <div className="clique-feat-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20, maxWidth: 1000, margin: "0 auto",
        }}>
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="clique-feat-card"
              style={{
                padding: "28px 24px",
                border: "1px solid rgba(200,169,81,.2)",
                background: "#fff",
                borderRadius: 8,
                transition: "border-color .25s, background .25s, transform .25s",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", color: "#0D1117",
                marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12,
                color: "#c8a951", fontStyle: "italic", marginBottom: 12 }}>{f.sub}</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                color: "#555", lineHeight: 1.7, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{
        textAlign: "center",
        padding: "60px 28px 72px",
        background: "linear-gradient(160deg,#0d0905 0%,#1a1004 50%,#0d0905 100%)",
      }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 3,
          textTransform: "uppercase", color: "rgba(200,169,81,.5)", marginBottom: 20 }}>
          Version 1 · Beryl Operating System
        </p>
        <h3 style={{
          fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 28, fontWeight: 700,
          background: "linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          marginBottom: 16,
        }}>Your Clique Is Waiting</h3>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
          color: "rgba(253,250,246,.55)", maxWidth: 480, margin: "0 auto 36px",
          fontStyle: "italic", lineHeight: 1.7 }}>
          Call your team by name. They already know you.
        </p>
        <Link href="/clique" style={{
          display: "inline-block", padding: "15px 44px",
          fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700,
          letterSpacing: 3, textTransform: "uppercase", textDecoration: "none",
          color: "#0a0604",
          background: "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
          border: "1px solid rgba(245,224,112,.35)",
        }}>Open the Room ›</Link>
      </div>
    </section>
  );
}
