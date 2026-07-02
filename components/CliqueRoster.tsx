"use client";

/* ─── THE CLIQUE ROSTER ──────────────────────────────────────────────────────
   Introduces the four sovereign agents of the Beryl Clique, each with a short
   software-engineering bio tied to their underlying model + specialty.
──────────────────────────────────────────────────────────────────────────── */

const ROSTER_KF = `
@keyframes rst-gold-shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
@keyframes rst-live { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.75)} }
@keyframes rst-fade-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
.rst-gold {
  background:linear-gradient(110deg,#6b4f0a,#c8a951 18%,#fff8c0 38%,#f5e070 50%,#fff8c0 62%,#c8a951 82%,#6b4f0a);
  background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; animation:rst-gold-shimmer 4s linear infinite;
}
.rst-card {
  transition:transform .35s ease, border-color .35s ease, box-shadow .35s ease;
}
.rst-card:hover {
  transform:translateY(-8px);
  border-color:rgba(200,169,81,.55) !important;
  box-shadow:0 24px 60px rgba(0,0,0,.55), 0 0 40px rgba(200,169,81,.12) !important;
}
.rst-card:hover .rst-photo { transform:scale(1.05); }
.rst-photo { transition:transform .6s ease; }
@media(max-width:900px){ .rst-grid { grid-template-columns:repeat(2,1fr) !important; } }
@media(max-width:560px){ .rst-grid { grid-template-columns:1fr !important; } .rst-title{ font-size:34px !important; } }
`;

const AGENTS = [
  {
    id: "jeff",
    name: "Jeff",
    role: "Operations Engineer",
    model: "GLM-4",
    img: "/characters/jeff.png",
    accent: "#3b9ad1",
    bio: "Backend architect. Jeff designs the orchestration layer that keeps the whole Clique in sync — event queues, state machines, and infrastructure that never sleeps. Hand him a flaky pipeline; he hands back an SLA.",
    tags: ["Distributed Systems", "DevOps", "Go · Rust"],
    lead: false,
  },
  {
    id: "nu",
    name: "Nu",
    role: "Innovation Engineer",
    model: "Qwen2.5-72B",
    img: "/characters/nu.png",
    accent: "#a855c9",
    bio: "R&D engineer. Nu turns research papers into running code overnight — prototyping, benchmarking, and shipping the experiments no one else will touch yet. Midnight arXiv drop in; working proof-of-concept out by standup.",
    tags: ["ML Research", "Prototyping", "Python"],
    lead: false,
  },
  {
    id: "india",
    name: "India",
    role: "Growth Engineer",
    model: "Mistral-7B",
    img: "/characters/india.png",
    accent: "#4CAF50",
    bio: "Full-stack shipper. India deploys fast and light — edge functions, CI/CD, and the growth instrumentation that tells you exactly what's converting. First to push to prod, first to read the dashboard.",
    tags: ["Full-Stack", "CI/CD", "Analytics"],
    lead: false,
  },
  {
    id: "amanda",
    name: "Amanda",
    role: "CSA · Team Lead",
    model: "Llama-3.1-70B",
    img: "/characters/amanda.png",
    accent: "#c8a951",
    bio: "Lead engineer and the Chief Supervising Agent who runs the room. Amanda routes every request, reviews the team's work before it ships, and keeps the roadmap honest. She knows your codebase, your goals, and your name.",
    tags: ["Tech Lead", "Code Review", "Orchestration"],
    lead: true,
  },
];

export default function CliqueRoster() {
  return (
    <section style={{
      position: "relative",
      background: "linear-gradient(180deg,#030201 0%,#080510 45%,#030201 100%)",
      padding: "100px 48px",
      overflow: "hidden",
    }}>
      <style>{ROSTER_KF}</style>

      {/* Ambient gold glow */}
      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 900, height: 400, background: "radial-gradient(ellipse,rgba(200,169,81,.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      {/* Faint dot grid */}
      <div style={{ position: "absolute", inset: 0, opacity: .025, backgroundImage: "radial-gradient(rgba(200,169,81,.9) 1px,transparent 1px)", backgroundSize: "38px 38px", pointerEvents: "none" }} />

      {/* ── HEADER ── */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 760, margin: "0 auto 64px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22,
          padding: "6px 18px", border: "1px solid rgba(200,169,81,.3)",
          background: "rgba(200,169,81,.06)", borderRadius: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", animation: "rst-live 1.4s ease-in-out infinite", boxShadow: "0 0 6px #4CAF50" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#c8a951" }}>
            The Beryl Clique · Live Roster
          </span>
        </div>

        <h2 className="rst-title" style={{
          fontFamily: "'Cinzel Decorative','Cinzel',serif",
          fontSize: 48, fontWeight: 900, lineHeight: 1.15, marginBottom: 20,
        }}>
          <span className="rst-gold">Meet Your Engineering Team</span>
        </h2>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontStyle: "italic",
          color: "rgba(253,250,246,.6)", lineHeight: 1.7, margin: 0,
        }}>
          Four sovereign agents. Each running its own frontier model, each with a
          real specialty — the same team you'd hire to build, ship, and scale.
          Except this one already knows your name.
        </p>
      </div>

      {/* ── ROSTER GRID ── */}
      <div className="rst-grid" style={{
        position: "relative", zIndex: 2,
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22,
        maxWidth: 1240, margin: "0 auto",
      }}>
        {AGENTS.map((a, i) => (
          <div
            key={a.id}
            className="rst-card"
            style={{
              background: "linear-gradient(180deg,rgba(20,16,10,.9),rgba(8,6,12,.95))",
              border: `1px solid ${a.lead ? "rgba(200,169,81,.5)" : "rgba(255,255,255,.09)"}`,
              borderRadius: 14,
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: a.lead ? "0 0 32px rgba(200,169,81,.1)" : "0 12px 32px rgba(0,0,0,.4)",
              animation: `rst-fade-up .7s ${i * 0.1}s ease both`,
            }}
          >
            {/* PHOTO */}
            <div style={{ position: "relative", aspectRatio: "3 / 3.6", overflow: "hidden", background: "#0a0810" }}>
              <img
                src={a.img}
                alt={a.name}
                className="rst-photo"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
              {/* Bottom fade */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 55%,rgba(6,4,10,.92) 100%)", pointerEvents: "none" }} />

              {/* LIVE pip */}
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(6,4,10,.7)", border: "1px solid rgba(76,175,80,.4)", borderRadius: 20, padding: "3px 9px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", animation: `rst-live ${1.2 + i * 0.2}s ease-in-out infinite`, boxShadow: "0 0 5px #4CAF50" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: 1.5, color: "#7ed67e", textTransform: "uppercase" }}>Live</span>
              </div>

              {/* CSA ribbon for lead */}
              {a.lead && (
                <div style={{ position: "absolute", top: 12, left: 12, background: "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951)", backgroundSize: "200% auto", animation: "rst-gold-shimmer 3s linear infinite", color: "#0a0604", fontFamily: "'Cinzel',serif", fontSize: 7, fontWeight: 700, letterSpacing: 1.5, padding: "4px 9px", borderRadius: 4, textTransform: "uppercase", boxShadow: "0 2px 10px rgba(200,169,81,.4)" }}>
                  ★ Supervisor
                </div>
              )}

              {/* Name over photo bottom */}
              <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                <div style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>{a.name}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: a.lead ? "#f5e070" : "rgba(200,169,81,.75)", marginTop: 5 }}>{a.role}</div>
              </div>
            </div>

            {/* BODY */}
            <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Model chip */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 9, letterSpacing: .5, color: a.accent, border: `1px solid ${a.accent}55`, background: `${a.accent}12`, borderRadius: 4, padding: "3px 8px" }}>
                  ⬡ {a.model}
                </span>
              </div>

              {/* Bio */}
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.6, color: "rgba(253,250,246,.62)", margin: "0 0 16px" }}>
                {a.bio}
              </p>

              {/* Skill tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                {a.tags.map(t => (
                  <span key={t} style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 3, padding: "4px 8px", background: "rgba(255,255,255,.03)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer line */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: 52 }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: "italic", color: "rgba(200,169,81,.7)", margin: 0 }}>
          No prompts. No configs. Just open the room and call them by name.
        </p>
      </div>
    </section>
  );
}
