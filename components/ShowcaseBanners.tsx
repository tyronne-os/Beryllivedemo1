"use client";
/**
 * ShowcaseBanners — four hero-style product banners under Use Cases.
 * Each banner represents a full page removed from the nav for the YC build:
 *   Clique Studio → /clique · Beryl Desktop → /desktop
 *   Beryl Matinee → /matinee · Beryl Diffusion → /beryl-llm
 */
import Link from "next/link";

const CLIQUE_TEAM = [
  { name: "Amanda", role: "Clique Supervisor", img: "/characters/amanda.png" },
  { name: "India",  role: "Growth",            img: "/characters/india.png" },
  { name: "Jeff",   role: "Operations",        img: "/characters/jeff.png" },
  { name: "Nu",     role: "Innovation",        img: "/characters/nu.png" },
];

const DIFFUSION_PORTRAITS = [
  "/beryl-llm/portrait-1.png",
  "/beryl-llm/portrait-3.png",
  "/beryl-llm/portrait-5.png",
  "/beryl-llm/portrait-7.png",
];

export default function ShowcaseBanners() {
  return (
    <section id="suite" style={{ background: "#080503", position: "relative" }}>
      <style>{`
        @keyframes sb-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sb-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes sb-red-pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes sb-dot-pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes sb-xfade { 0%,22%{opacity:1} 30%,92%{opacity:0} 100%{opacity:1} }
        @keyframes sb-wave { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
        @keyframes sb-scan { 0%{top:-10%} 100%{top:110%} }

        .sb-gold-text {
          background:linear-gradient(110deg,#8B6914 0%,#c8a951 22%,#fff8c0 45%,#f5e070 55%,#c8a951 74%,#8B6914 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:sb-shimmer 4s linear infinite;
        }
        .sb-cta {
          display:inline-block;padding:15px 44px;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;
          font-weight:700;text-decoration:none;color:#0a0604;
          background:linear-gradient(110deg,#8B6914,#c8a951,#fff8c0,#f5e070,#c8a951,#8B6914);
          background-size:200% auto;border:1px solid rgba(245,224,112,.4);
          box-shadow:0 0 12px rgba(200,169,81,.25);transition:transform .2s,box-shadow .25s;white-space:nowrap;
        }
        .sb-cta:hover { transform:translateY(-3px);box-shadow:0 0 26px rgba(200,169,81,.6); }
        .sb-cta-red {
          display:inline-block;padding:15px 44px;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;
          font-weight:700;text-decoration:none;color:#fff;
          background:linear-gradient(135deg,#8b1a1a,#dc3c3c,#ff6060,#dc3c3c,#8b1a1a);
          border:1px solid rgba(255,96,96,.4);box-shadow:0 0 12px rgba(220,60,60,.3);
          transition:transform .2s,box-shadow .25s;white-space:nowrap;
        }
        .sb-cta-red:hover { transform:translateY(-3px);box-shadow:0 0 26px rgba(220,60,60,.6); }

        .sb-eyebrow { font-family:'Cinzel',serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;margin-bottom:14px; }
        .sb-title { font-family:'Cinzel Decorative','Cinzel',serif;font-weight:900;font-size:clamp(1.6rem,3.6vw,2.9rem);line-height:1.05;margin-bottom:12px; }
        .sb-sub { font-family:'Cormorant Garamond',serif;font-size:clamp(15px,1.8vw,19px);line-height:1.7;max-width:560px;margin-bottom:28px; }

        .sb-banner { position:relative;overflow:hidden;padding:64px 24px;display:flex;align-items:center;justify-content:center; }
        .sb-inner { position:relative;z-index:5;max-width:1150px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:48px; }

        .sb-card { position:relative;width:132px;height:170px;overflow:hidden;border:1px solid rgba(200,169,81,.35);background:#0d0905;flex-shrink:0;transition:transform .25s,box-shadow .25s; }
        .sb-card:hover { transform:translateY(-6px);box-shadow:0 12px 36px rgba(200,169,81,.25); }
        .sb-card img { width:100%;height:100%;object-fit:cover;object-position:top center;display:block; }
        .sb-card-label { position:absolute;bottom:0;left:0;right:0;padding:8px 10px 7px;background:linear-gradient(transparent,rgba(8,5,3,.95) 55%); }

        .sb-window { width:340px;border:1px solid rgba(200,169,81,.35);background:rgba(10,7,3,.9);box-shadow:0 24px 70px rgba(0,0,0,.7),0 0 40px rgba(200,169,81,.08);flex-shrink:0; }

        .sb-copy-right { text-align:right; }
        .sb-copy-right .sb-eyebrow { justify-content:flex-end; }
        .sb-copy-right .sb-sub { margin-left:auto; }

        @media (max-width: 900px) {
          .sb-inner { flex-direction:column;text-align:center;gap:36px; }
          .sb-sub { margin-left:auto;margin-right:auto; }
          .sb-cards { justify-content:center !important; }
          .sb-window { width:100%;max-width:340px; }
          .sb-banner { padding:52px 20px; }
          .sb-copy-right { text-align:center; }
          .sb-copy-right .sb-eyebrow { justify-content:center; }
        }
        @media (max-width: 520px) {
          .sb-card { width:120px;height:152px; }
        }
      `}</style>

      {/* ── Section intro ── */}
      <div style={{ textAlign: "center", padding: "72px 20px 8px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#4CAF50", marginBottom: 14 }}>
          ✦ The Beryl Suite ✦
        </div>
        <h2 className="sb-gold-text" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: "clamp(1.7rem,4vw,3rem)", fontWeight: 900, margin: 0 }}>
          Four Products. One Engine.
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(15px,2vw,19px)", color: "rgba(232,220,200,.55)", maxWidth: 540, margin: "16px auto 40px", lineHeight: 1.7, fontStyle: "italic" }}>
          Everything below runs on the same live presence engine that powers the Clique.
        </p>
      </div>

      {/* ════════════════ 1 · CLIQUE STUDIO → /clique ════════════════ */}
      <div className="sb-banner" style={{ background: "linear-gradient(160deg,#0a1408 0%,#080503 45%,#0d1a0c 100%)", borderTop: "1px solid rgba(76,175,80,.18)", borderBottom: "1px solid rgba(200,169,81,.14)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 75% 50%,rgba(76,175,80,.1) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="sb-inner">
          <div style={{ animation: "sb-fade-up .8s ease both" }}>
            <div className="sb-eyebrow" style={{ color: "#4CAF50", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", boxShadow: "0 0 8px #4CAF50", display: "inline-block", animation: "sb-dot-pulse 1.8s ease-in-out infinite" }} />
              Beryl Clique · The Team Room
            </div>
            <h3 className="sb-title sb-gold-text">CLIQUE STUDIO</h3>
            <p className="sb-sub" style={{ color: "rgba(232,220,200,.6)" }}>
              Step inside the room where it happens. Amanda supervises. India grows it.
              Jeff ships it. Nu breaks the frame. A live video meeting with your
              AI executive team — voices, faces, and a shared goal.
            </p>
            <Link href="/clique" className="sb-cta">Enter the Studio ›</Link>
          </div>
          <div className="sb-cards" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, maxWidth: 580 }}>
            {CLIQUE_TEAM.map((m, i) => (
              <div key={m.name} className="sb-card" style={{ marginTop: i % 2 === 0 ? 0 : 22 }}>
                <img src={m.img} alt={m.name} loading="lazy" />
                <div className="sb-card-label">
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#E8DCC8", letterSpacing: 1 }}>{m.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#4CAF50", fontStyle: "italic" }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ 2 · BERYL DESKTOP → /desktop ════════════════ */}
      <div className="sb-banner" style={{ background: "linear-gradient(160deg,rgba(40,22,5,.55) 0%,#080503 50%,rgba(30,16,4,.55) 100%)", borderBottom: "1px solid rgba(200,169,81,.14)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 50%,rgba(200,169,81,.08) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="sb-inner" style={{ flexDirection: "row-reverse" }}>
          <div style={{ animation: "sb-fade-up .8s ease both" }}>
            <div className="sb-eyebrow" style={{ color: "#c8a951" }}>Beryl AI Labs · Native App</div>
            <h3 className="sb-title sb-gold-text">BERYL DESKTOP</h3>
            <p className="sb-sub" style={{ color: "rgba(232,220,200,.6)" }}>
              The presence engine, living on your machine. A native desktop companion
              with instant voice, always-on availability, and zero browser tabs —
              your Beryl agents one keystroke away.
            </p>
            <Link href="/desktop" className="sb-cta">Get Beryl Desktop ›</Link>
          </div>
          {/* Stylized app-window mockup */}
          <div className="sb-window">
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid rgba(200,169,81,.25)", background: "rgba(200,169,81,.06)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#dc3c3c", opacity: .8 }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#c8a951", opacity: .8 }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#4CAF50", opacity: .8 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(200,169,81,.7)", marginLeft: 10 }}>Beryl Desktop</span>
            </div>
            <div style={{ position: "relative", padding: "28px 22px 24px", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,169,81,.5),transparent)", animation: "sb-scan 4s linear infinite", pointerEvents: "none" }} />
              <div className="sb-gold-text" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 6 }}>BERYL</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#4CAF50", textAlign: "center", marginBottom: 20 }}>Listening…</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center", height: 34 }}>
                {[...Array(16)].map((_, i) => (
                  <span key={i} style={{ width: 3, height: "100%", background: "#c8a951", borderRadius: 2, transformOrigin: "center", animation: `sb-wave ${0.9 + (i % 5) * 0.14}s ease-in-out ${i * 0.07}s infinite`, opacity: .8 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ 3 · BERYL MATINEE → /matinee ════════════════ */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(220,60,60,.15)" }}>
        {/* Letterbox bars */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: "#000", zIndex: 20, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: "#000", zIndex: 20, pointerEvents: "none" }} />
        {/* Muted cinema reel (raw HTML — React SSR drops the muted attr) */}
        <div
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
          dangerouslySetInnerHTML={{ __html: `<video autoplay loop muted playsinline preload="metadata" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"><source src="/videos/matinee-hero-opt.mp4" type="video/mp4"/></video>` }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(4,6,10,.92) 0%,rgba(4,6,10,.55) 45%,rgba(4,6,10,.25) 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%,rgba(220,60,60,.2) 0%,transparent 60%)", zIndex: 3, pointerEvents: "none" }} />
        <div className="sb-banner" style={{ position: "relative", zIndex: 5, minHeight: 340, background: "transparent" }}>
          <div className="sb-inner" style={{ justifyContent: "flex-start" }}>
            <div style={{ animation: "sb-fade-up .8s ease both" }}>
              <div className="sb-eyebrow" style={{ color: "rgba(220,60,60,.9)", animation: "sb-red-pulse 2s ease-in-out infinite" }}>✦ Enterprise AI Cinema Studio ✦</div>
              <h3 className="sb-title" style={{ color: "#E8DCC8", textShadow: "0 0 50px rgba(220,60,60,.5),0 2px 24px rgba(0,0,0,.95)" }}>BERYL MATINEE</h3>
              <p className="sb-sub" style={{ color: "rgba(232,220,200,.72)" }}>
                A full production house in a browser. OMEGA — our Oscar-grade AI
                cinematographer — turns a single sentence into a lit, graded,
                camera-blocked scene. Direct it live with Vera, your AI director.
              </p>
              <Link href="/matinee" className="sb-cta-red">Enter the Cinema ›</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ 4 · BERYL DIFFUSION → /beryl-llm ════════════════ */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(200,169,81,.18)" }}>
        {/* Crossfading portrait backdrop */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          {DIFFUSION_PORTRAITS.map((src, i) => (
            <img key={src} src={src} alt="" loading="lazy" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 18%",
              opacity: 0, animation: `sb-xfade 16s ease-in-out ${i * 4}s infinite`,
            }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(8,5,3,.35) 0%,rgba(8,5,3,.75) 55%,rgba(8,5,3,.95) 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 30%,rgba(200,169,81,.14) 0%,transparent 55%)", zIndex: 3, pointerEvents: "none" }} />
        <div className="sb-banner" style={{ position: "relative", zIndex: 5, minHeight: 360, background: "transparent" }}>
          <div className="sb-inner" style={{ justifyContent: "flex-end" }}>
            <div className="sb-copy-right" style={{ animation: "sb-fade-up .8s ease both", maxWidth: 620 }}>
              <div className="sb-eyebrow" style={{ color: "#c8a951", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8a951", boxShadow: "0 0 8px #c8a951", display: "inline-block" }} />
                Beryl AI Labs · Image Model
              </div>
              <h3 className="sb-title sb-gold-text">BERYL DIFFUSION</h3>
              <p className="sb-sub" style={{ color: "rgba(232,220,200,.65)" }}>
                The faces you just met were born here. Photorealistic humans in a
                single inference pass — 4K native, no upscaling, no uncanny valley.
                The visual foundation of every Beryl agent.
              </p>
              <Link href="/beryl-llm" className="sb-cta">See the Model ›</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
