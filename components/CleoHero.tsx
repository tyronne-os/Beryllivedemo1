"use client";
/**
 * CleoHero — the beloved "Video Conferencing, With AI." full-bleed hero.
 * Restored from the original CliqueLandingPage; typewriter starts when the
 * section scrolls into view so the cursor moment is never missed.
 * Temporarily mounted at the bottom of the main pages until the flow is confirmed.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HEADLINE = "Video Conferencing, With AI.";

export default function CleoHero() {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Start typing when the hero enters the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const t = setInterval(() => {
      setTyped(HEADLINE.slice(0, ++i));
      if (i >= HEADLINE.length) clearInterval(t);
    }, 48);
    return () => clearInterval(t);
  }, [started]);

  return (
    <section ref={sectionRef} style={{
      position: "relative", minHeight: "100svh", background: "#030201",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @keyframes ch-shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes ch-cursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ch-dot     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
        @keyframes ch-fade-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }

        .ch-gold {
          background: linear-gradient(110deg,#6b4f0a 0%,#c8a951 18%,#fff8c0 38%,#f5e070 50%,#fff8c0 62%,#c8a951 82%,#6b4f0a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: ch-shimmer 4s linear infinite;
        }
        .ch-fade-1 { animation: ch-fade-up .8s ease both; }
        .ch-fade-2 { animation: ch-fade-up .8s .2s ease both; }
        .ch-fade-3 { animation: ch-fade-up .8s .4s ease both; }

        .ch-copy { position:relative; z-index:2; padding:0 clamp(24px,6vw,80px); flex:1;
          display:flex; flex-direction:column; justify-content:center; max-width:700px;
          padding-top:96px; padding-bottom:140px; }
        .ch-img-wrap { position:absolute; right:0; bottom:0; top:0; width:52%; pointer-events:none; }
        .ch-plate { position:absolute; bottom:36px; left:clamp(24px,6vw,80px); z-index:3; }

        .ch-cta-primary {
          display:inline-block; padding:16px 40px;
          font-family:'Cinzel',serif; font-size:12px; font-weight:700; letter-spacing:3px;
          text-transform:uppercase; text-decoration:none; color:#0a0604;
          background:linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914);
          background-size:200% auto; animation:ch-shimmer 3s linear infinite;
          border:1px solid rgba(245,224,112,.4);
        }
        .ch-cta-ghost {
          display:inline-block; padding:16px 40px;
          font-family:'Cinzel',serif; font-size:12px; font-weight:700; letter-spacing:3px;
          text-transform:uppercase; text-decoration:none; color:rgba(200,169,81,.8);
          border:1px solid rgba(200,169,81,.3); background:rgba(3,2,1,.5);
        }

        @media (max-width: 768px) {
          .ch-img-wrap { width:100%; }
          .ch-img-fade { background:linear-gradient(90deg,#030201 0%,rgba(3,2,1,.88) 38%,rgba(3,2,1,.25) 100%) !important; }
          .ch-copy { max-width:100%; padding-left:6px; padding-right:6px; padding-top:80px; padding-bottom:150px; }
          .ch-cta-primary, .ch-cta-ghost { width:100%; text-align:center; box-sizing:border-box; }
          h2.ch-headline { font-size:clamp(2.1rem,9.6vw,3.4rem) !important; line-height:1.12 !important; }
        }
      `}</style>

      {/* Cleo — right-anchored full bleed */}
      <div className="ch-img-wrap">
        <img src="/characters/CLEO_SHIELD.png" alt="Cleo"
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
        <div className="ch-img-fade" style={{ position: "absolute", inset: 0,
          background: "linear-gradient(90deg,#030201 0%,#030201 10%,transparent 55%)" }} />
      </div>

      {/* Gold grid overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: .03,
        backgroundImage: "linear-gradient(rgba(200,169,81,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,81,1) 1px,transparent 1px)",
        backgroundSize: "64px 64px", pointerEvents: "none" }} />

      {/* Copy */}
      <div className="ch-copy">
        <div className="ch-fade-1" style={{ display: "inline-flex", alignItems: "center", gap: 8,
          marginBottom: 28, padding: "6px 16px",
          border: "1px solid rgba(200,169,81,.3)", background: "rgba(3,2,1,.6)",
          borderRadius: 20, width: "fit-content" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50",
            animation: "ch-dot 1.4s ease-in-out infinite", boxShadow: "0 0 6px #4CAF50" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3,
            textTransform: "uppercase", color: "#c8a951" }}>Beryl Operating System · Clique</span>
        </div>

        <h2 className="ch-headline ch-fade-2" style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif",
          fontSize: "clamp(34px,5.2vw,58px)", fontWeight: 900, lineHeight: 1.12, letterSpacing: 1,
          marginBottom: 20, color: "#fff", minHeight: "2.3em" }}>
          <span className="ch-gold">{typed}</span>
          <span style={{ animation: "ch-cursor 1s step-end infinite", color: "#c8a951", marginLeft: 2 }}>|</span>
        </h2>

        <p className="ch-fade-3" style={{ fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(17px,2.2vw,22px)", fontStyle: "italic", color: "rgba(253,250,246,.72)",
          lineHeight: 1.7, marginBottom: 24, maxWidth: 540,
          textShadow: "0 1px 16px rgba(3,2,1,.9)" }}>
          The first meeting room where your <strong style={{ color: "#f5e070", fontStyle: "normal" }}>human
          teammates</strong> and your <strong style={{ color: "#f5e070", fontStyle: "normal" }}>AI agents</strong> sit
          side by side — live, face to face, in real time. They know your name, remember your
          wins, and get real work done. Together.
        </p>

        <p className="ch-fade-3" style={{ fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(14px,1.6vw,16px)", color: "rgba(200,169,81,.85)", lineHeight: 1.6,
          marginBottom: 36, maxWidth: 520, textShadow: "0 1px 12px rgba(3,2,1,.9)" }}>
          Brilliant people built powerful AI — and forgot to make it easy.
          <strong style={{ color: "#fff", fontStyle: "normal" }}> berylize</strong> is the easy button.
          One press, and the hardest thing in tech becomes the simplest.
        </p>

        <div className="ch-fade-3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/demo" className="ch-cta-primary">Enter the Clique ›</Link>
          <Link href="/clique" className="ch-cta-ghost">Open the Studio ›</Link>
        </div>
      </div>

      {/* Cleo name plate */}
      <div className="ch-plate">
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3,
          color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 4 }}>
          Your Clique Scribe
        </div>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700,
          color: "#fff", letterSpacing: 2 }}>Cleo</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
          color: "rgba(255,255,255,.4)", fontStyle: "italic" }}>Minutes & Meetings</div>
      </div>
    </section>
  );
}
