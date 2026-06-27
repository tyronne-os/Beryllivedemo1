"use client";

export default function KizzyBanner() {
  return (
    <section style={{
      position: "relative",
      width: "100%",
      minHeight: "50vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700;900&display=swap');
        @keyframes tagline-glow {
          0%,100% { text-shadow: 0 0 40px rgba(200,169,81,0.4), 0 0 80px rgba(200,169,81,0.15); }
          50%     { text-shadow: 0 0 70px rgba(200,169,81,0.75), 0 0 140px rgba(200,169,81,0.3); }
        }
        @keyframes gold-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .kizzy-cta { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .kizzy-cta:hover {
          transform: translateY(-4px) scale(1.05) !important;
          box-shadow: 0 16px 48px rgba(200,169,81,0.55) !important;
        }
      `}</style>

      {/* ── KIZZY SOFA — full bleed background ── */}
      <img
        src="/kizzy-sofa.png"
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "60% 0%",
        }}
      />

      {/* Vignette for text legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(8,5,3,0.55) 0%, rgba(8,5,3,0.2) 35%, rgba(8,5,3,0.2) 60%, rgba(8,5,3,0.65) 100%)",
      }} />

      {/* ── TAGLINE — top of banner, above Kizzy ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        zIndex: 10, padding: "18px 24px 0",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 6,
          textTransform: "uppercase", color: "#c8a951",
          marginBottom: 20, opacity: 0.9,
          textShadow: "0 1px 8px rgba(0,0,0,0.9)",
        }}>
          Beryl Labs · The Future of AI Is Now
        </div>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.8rem, 5vw, 4rem)",
          fontWeight: 900, color: "#E8DCC8",
          lineHeight: 1.12, letterSpacing: "0.02em",
          marginBottom: 12,
          animation: "tagline-glow 3s ease-in-out infinite",
          textShadow: "0 2px 28px rgba(0,0,0,0.97)",
        }}>
          Build Something Amazing
        </h2>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.8rem, 5vw, 4rem)",
          fontWeight: 900,
          background: "linear-gradient(135deg, #8B6914 0%, #c8a951 30%, #f5e070 55%, #c8a951 78%, #8B6914 100%)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.12,
          animation: "gold-shimmer 4s linear infinite",
        }}>
          With Beryl
        </h2>
      </div>

      {/* ── CTA BUTTON — bottom of banner, below Kizzy ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        zIndex: 10, padding: "0 24px 52px",
        display: "flex", justifyContent: "center",
      }}>
        <a
          href="/beryl-llm"
          className="kizzy-cta"
          style={{
            display: "inline-block",
            fontFamily: "'Cinzel', serif",
            fontSize: 14, letterSpacing: "3px",
            textTransform: "uppercase",
            padding: "18px 56px",
            background: "linear-gradient(270deg, #8B6914, #c8a951, #f5e070, #c8a951, #8B6914)",
            backgroundSize: "300% 100%",
            color: "#165168",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 28px rgba(200,169,81,0.35)",
            animation: "gold-shimmer 4s linear infinite",
          }}
        >
          Try Beryl Diffusion →
        </a>
      </div>

    </section>
  );
}
