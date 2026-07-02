"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes logo-sweep { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes logo-glow  { 0%,100%{filter:drop-shadow(0 0 8px rgba(200,169,81,.45))} 50%{filter:drop-shadow(0 0 18px rgba(200,169,81,.85))} }
        @keyframes btn-flash  { 0%{background-position:150% center} 100%{background-position:-50% center} }
        @keyframes mob-slide  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .nl {
          position:relative; display:inline-block;
          font-family:'Cinzel',serif; font-size:13px; font-weight:600;
          letter-spacing:2.5px; text-transform:uppercase; text-decoration:none;
          padding:4px 2px 6px;
          background:linear-gradient(135deg,#8B6914 0%,#c8a951 22%,#f5e070 48%,#c8a951 74%,#8B6914 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          transition:background .22s ease;
        }
        .nl::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:transparent; transition:background .25s,box-shadow .25s; }
        .nl:hover { background:linear-gradient(135deg,#1a5f7a 0%,#4a9ab5 28%,#9de4f8 50%,#4a9ab5 72%,#1a5f7a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nl:hover::after { background:linear-gradient(90deg,transparent,#7ecde8 50%,transparent); box-shadow:0 0 8px #4a9ab5; }

        .nl-mob {
          font-family:'Cinzel',serif; font-size:15px; font-weight:600;
          letter-spacing:2px; text-transform:uppercase; text-decoration:none;
          padding:14px 0; display:block; border-bottom:1px solid rgba(200,169,81,.12);
          background:linear-gradient(135deg,#8B6914 0%,#c8a951 40%,#f5e070 60%,#8B6914 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .nl-mob:active { opacity:.7; }

        .cta-btn {
          display:inline-block; padding:11px 28px;
          font-family:'Cinzel',serif; font-size:11px; font-weight:700;
          letter-spacing:2.5px; text-transform:uppercase; text-decoration:none;
          color:#0a0604;
          background:linear-gradient(110deg,#8B6914 0%,#c8a951 25%,#fff8c0 45%,#f5e070 55%,#c8a951 75%,#8B6914 100%);
          background-size:200% auto; border:1px solid rgba(245,224,112,.35);
          box-shadow:0 0 8px rgba(200,169,81,.2); transition:box-shadow .25s; white-space:nowrap; cursor:pointer;
        }
        .cta-btn:hover { animation:btn-flash .5s ease-out both; box-shadow:0 0 22px rgba(200,169,81,.55),0 0 44px rgba(200,169,81,.2); }

        .llm-pill {
          display:flex; align-items:center; gap:8px; padding:7px 18px;
          border:1px solid rgba(200,169,81,.28); background:rgba(200,169,81,.04);
          text-decoration:none; transition:border-color .25s,background .25s,box-shadow .25s;
        }
        .llm-pill:hover { border-color:rgba(200,169,81,.75); background:rgba(200,169,81,.11); box-shadow:0 0 16px rgba(200,169,81,.18); }
        .llm-pill-dot { width:6px; height:6px; border-radius:50%; background:#c8a951; box-shadow:0 0 6px #c8a951; flex-shrink:0; display:inline-block; transition:box-shadow .25s; }
        .llm-pill:hover .llm-pill-dot { box-shadow:0 0 14px #f5e070,0 0 28px #c8a951; }
        .llm-pill-text { font-family:'Cinzel',serif; font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; background:linear-gradient(135deg,#8B6914 0%,#c8a951 25%,#f5e070 50%,#c8a951 75%,#8B6914 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .logo-beryl { font-family:'Cinzel Decorative','Cinzel',serif; font-size:35px; font-weight:900; letter-spacing:3px; background:linear-gradient(110deg,#6b4f0a 0%,#c8a951 15%,#fff8c0 30%,#f5e070 40%,#fff8c0 50%,#c8a951 65%,#6b4f0a 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:logo-sweep 4s linear infinite,logo-glow 3s ease-in-out infinite; }
        .logo-live  { font-family:'Cinzel',serif; font-size:24px; font-weight:400; letter-spacing:9px; background:linear-gradient(135deg,#1b5e20 0%,#4CAF50 40%,#a8e6a8 60%,#4CAF50 80%,#1b5e20 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-left:8px; animation:logo-sweep 5s linear infinite; }

        /* Hamburger */
        .ham { display:none; flex-direction:column; justify-content:center; gap:5px; width:40px; height:40px; cursor:pointer; padding:6px; background:none; border:none; }
        .ham span { display:block; height:2px; background:#c8a951; border-radius:2px; transition:all .3s; }
        .ham.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
        .ham.open span:nth-child(2) { opacity:0; }
        .ham.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

        @media (max-width: 768px) {
          .ham { display:flex !important; }
          .nav-links { display:none !important; }
          .cta-btn { display:none !important; }
          .logo-beryl { font-size:25px !important; letter-spacing:1px !important; }
          .logo-live  { font-size:17px !important; letter-spacing:5px !important; margin-left:5px !important; }
        }
        @media (max-width: 480px) {
          .logo-beryl { font-size:23px !important; }
          .logo-live  { font-size:15px !important; letter-spacing:3px !important; }
        }
      `}</style>

      <nav style={{
        position:"sticky", top:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:64,
        backgroundColor:"#0d0905",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E"),linear-gradient(160deg,rgba(40,22,5,.7) 0%,rgba(8,5,2,.95) 50%,rgba(30,16,4,.7) 100%)`,
        borderBottom:"1px solid rgba(200,169,81,.22)",
        boxShadow:"0 1px 0 rgba(200,169,81,.08) inset,0 6px 50px rgba(0,0,0,.85)",
      }}>

        {/* LOGO */}
        <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",flexShrink:0}} onClick={()=>setMenuOpen(false)}>
          <span className="logo-beryl">BERYL</span>
          <span className="logo-live">LIVE</span>
        </Link>

        {/* Desktop NAV LINKS */}
        <div className="nav-links" style={{display:"flex",alignItems:"center",gap:32}}>
          <Link href="/" style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,letterSpacing:"2.5px",textTransform:"uppercase",textDecoration:"none",display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#8B6914 0%,#c8a951 30%,#f5e070 50%,#c8a951 70%,#8B6914 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",padding:"4px 2px 6px"}}>
            <span style={{WebkitTextFillColor:"initial",fontSize:14}}>✦</span>
            The Clique
          </Link>
          <Link href="/demo" className="nl">Demo</Link>
          <Link href="/meet-beryl" className="nl">Meet Beryl</Link>
          <a href="/meet-beryl#pricing" className="nl">Pricing</a>
          <Link href="/contact" className="nl">Contact</Link>
        </div>

        {/* Desktop CTA */}
        <Link href="/demo" className="cta-btn">Live Session ›</Link>

        {/* Hamburger */}
        <button className={`ham${menuOpen?" open":""}`} onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </nav>

      {/* ── MOBILE MENU — 100% inline-style controlled, no CSS class dependency ── */}
      {menuOpen && (
        <div style={{
          position:"fixed", top:64, left:0, right:0, bottom:0,
          background:"rgba(6,4,2,.97)",
          zIndex:300,
          display:"flex", flexDirection:"column",
          overflowY:"auto",
          borderTop:"1px solid rgba(200,169,81,.25)",
          padding:"8px 0 40px",
        }}>
          {/* Close strip tap target at very top */}
          <button onClick={()=>setMenuOpen(false)} style={{
            background:"none", border:"none", cursor:"pointer",
            padding:"12px 28px", textAlign:"right",
            fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:3,
            color:"rgba(200,169,81,.4)", textTransform:"uppercase",
          }}>✕ Close</button>

          {/* Nav links — each fully self-contained with inline styles */}
          {([
            { label:"The Clique",     href:"/",                    show: true },
            { label:"Demo",           href:"/demo",                show: true },
            { label:"Meet Beryl",     href:"/meet-beryl",          show: true },
            { label:"Pricing",        href:"/meet-beryl#pricing",  show: true, isAnchor: true },
            { label:"Contact",        href:"/contact",             show: true },
          ] as {label:string;href:string;show:boolean;isAnchor?:boolean}[])
            .filter(l => l.show)
            .map(l => l.isAnchor ? (
              <a key={l.href} href={l.href} onClick={()=>setMenuOpen(false)} style={{
                display:"block", padding:"18px 28px",
                fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:600,
                letterSpacing:"2px", textTransform:"uppercase", textDecoration:"none",
                color:"#c8a951",
                borderBottom:"1px solid rgba(200,169,81,.1)",
              }}>{l.label}</a>
            ) : (
              <Link key={l.href} href={l.href} onClick={()=>setMenuOpen(false)} style={{
                display:"block", padding:"18px 28px",
                fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:600,
                letterSpacing:"2px", textTransform:"uppercase", textDecoration:"none",
                color:"#c8a951",
                borderBottom:"1px solid rgba(200,169,81,.1)",
              }}>{l.label}</Link>
            ))
          }

          {/* CTA button */}
          <div style={{padding:"32px 28px 0"}}>
            <Link href="/demo" onClick={()=>setMenuOpen(false)} style={{
              display:"block", textAlign:"center", padding:"18px",
              fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"2.5px",
              textTransform:"uppercase", textDecoration:"none", color:"#0a0604",
              background:"linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
            }}>
              Live Session ›
            </Link>
          </div>
        </div>
      )}

    </>
  );
}
