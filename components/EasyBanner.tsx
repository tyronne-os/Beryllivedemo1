"use client";
/**
 * EasyBanner — the bold thesis statement.
 * "AI was supposed to make things easy. Code isn't easy. BERYL MAKES AI EASY."
 * Proof shot: the Clique Agents POV image (team room watching a live agent chat).
 */
import Link from "next/link";
import Image from "next/image";

export default function EasyBanner() {
  return (
    <section style={{
      position: "relative", overflow: "hidden", background: "#050302",
      padding: "clamp(72px,10vw,130px) 24px clamp(64px,8vw,110px)",
      borderTop: "1px solid rgba(200,169,81,.15)",
      borderBottom: "1px solid rgba(200,169,81,.15)",
    }}>
      <style>{`
        @keyframes ez-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ez-fade-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ez-strike  { from{width:0} to{width:calc(100% - 16px)} }
        @keyframes ez-glow    { 0%,100%{box-shadow:0 30px 90px rgba(0,0,0,.8),0 0 60px rgba(200,169,81,.12)} 50%{box-shadow:0 30px 90px rgba(0,0,0,.8),0 0 100px rgba(200,169,81,.26)} }

        .ez-gold {
          background:linear-gradient(110deg,#6b4f0a 0%,#c8a951 18%,#fff8c0 38%,#f5e070 50%,#fff8c0 62%,#c8a951 82%,#6b4f0a 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:ez-shimmer 4s linear infinite;
        }
        .ez-line1 { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:500;
          font-size:clamp(24px,4.2vw,44px); color:rgba(253,250,246,.85); line-height:1.3; }
        .ez-line2 { font-family:'SF Mono','Fira Code',monospace; font-weight:700;
          font-size:clamp(20px,3.4vw,36px); color:#ff7b72; position:relative; display:inline-block;
          padding:6px 18px; border:1px solid rgba(255,123,114,.35); background:rgba(255,123,114,.06);
          border-radius:8px; letter-spacing:1px; }
        .ez-line2::after { content:''; position:absolute; left:8px; top:50%; height:3px;
          background:#ff7b72; border-radius:2px; animation:ez-strike .7s .9s ease-out both; }
        h2.ez-line3 { font-family:'Cinzel Decorative','Cinzel',serif; font-weight:900;
          font-size:clamp(40px,7.6vw,96px) !important; line-height:1.04 !important; letter-spacing:1px; }

        .ez-frame { position:relative; max-width:1040px; margin:clamp(48px,6vw,80px) auto 0;
          border:1px solid rgba(200,169,81,.4); border-radius:14px; overflow:hidden;
          animation:ez-glow 4s ease-in-out infinite; }
        .ez-cta {
          display:inline-block; padding:18px 56px; margin-top:clamp(36px,5vw,56px);
          font-family:'Cinzel',serif; font-size:13px; font-weight:700; letter-spacing:3px;
          text-transform:uppercase; text-decoration:none; color:#0a0604;
          background:linear-gradient(110deg,#8B6914,#c8a951,#fff8c0,#f5e070,#c8a951,#8B6914);
          background-size:200% auto; animation:ez-shimmer 3s linear infinite;
          border:1px solid rgba(245,224,112,.4); box-shadow:0 0 24px rgba(200,169,81,.3);
          transition:transform .2s;
        }
        .ez-cta:hover { transform:translateY(-3px) scale(1.03); }

        @media (max-width:768px) {
          .ez-cta { width:100%; text-align:center; box-sizing:border-box; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(200,169,81,.09) 0%,transparent 65%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1150, margin: "0 auto", textAlign: "center" }}>

        {/* The three-beat statement */}
        <div className="ez-line1" style={{ animation: "ez-fade-up .7s ease both", marginBottom: 22 }}>
          AI was supposed to make things easy.
        </div>

        <div style={{ animation: "ez-fade-up .7s .25s ease both", marginBottom: "clamp(28px,4vw,44px)" }}>
          <span className="ez-line2">code isn&apos;t easy</span>
        </div>

        <h2 className="ez-line3" style={{ animation: "ez-fade-up .8s .5s ease both", margin: 0 }}>
          <span style={{ color: "#fff" }}>BERYL MAKES</span><br />
          <span className="ez-gold">AI EASY.</span>
        </h2>

        {/* Proof shot — the POV image */}
        <div className="ez-frame" style={{ aspectRatio: "1888 / 2218" }}>
          <Image
            src="/images/clique-agents-pov.png"
            alt="A real team in a conference room on a live Beryl video call with their AI agents — Jaydian hosting, Jeff, Nu, and India on screen"
            fill
            sizes="(max-width: 1100px) 100vw, 1040px"
            style={{ objectFit: "cover" }}
            quality={80}
          />
          {/* Bottom caption gradient */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0,
            padding: "80px 24px 22px",
            background: "linear-gradient(transparent,rgba(5,3,2,.94) 70%)" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(10px,1.4vw,13px)", letterSpacing: 4,
              textTransform: "uppercase", color: "#c8a951" }}>
              One screen · Your whole AI team · Live
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(14px,1.8vw,18px)",
              fontStyle: "italic", color: "rgba(253,250,246,.7)", marginTop: 6 }}>
              No prompts. No pipelines. No Python. Just press the easy button.
            </div>
          </div>
        </div>

        <Link href="/demo" className="ez-cta">Press the Easy Button ›</Link>
      </div>
    </section>
  );
}
