"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { VIDEO } from "@/lib/cdn";

export default function HeroVideo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = ref.current?.querySelector("video") as HTMLVideoElement | null;
    if (!v) return;

    // Promote to GPU compositor layer before anything else
    v.style.transform = "translateZ(0)";
    v.style.willChange = "transform";
    v.muted = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");

    const tryPlay = () => v.play().catch(() => {});

    // Hero is always above fold — start immediately
    tryPlay();

    // iOS Safari needs a user gesture; listen for first touch/click
    const onGesture = () => { tryPlay(); };
    document.addEventListener("touchstart", onGesture, { once: true });
    document.addEventListener("click", onGesture, { once: true });

    // Kill GPU cost entirely when tab is backgrounded
    const onVisibility = () => { document.hidden ? v.pause() : tryPlay(); };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("click", onGesture);
    };
  }, []);

  return (
    <section style={{position:"relative",width:"100%",height:"85vh",minHeight:480,overflow:"hidden",background:"#0D1117"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @media(max-width:768px){
          .hero-content{padding:0 20px 36px!important}
          .hero-btns{flex-direction:column!important;gap:10px!important}
          .hero-btns a,.hero-btns button{width:100%!important;text-align:center!important}
          .hero-badge{top:16px!important;right:16px!important}
        }
      `}</style>

      {/*
        GPU optimisation notes:
        - transform:translateZ(0) + will-change:transform → own compositor layer, no CPU repaint
        - backfaceVisibility:hidden → skip back-face occlusion checks
        - preload="auto" hero only (above fold, plays immediately)
        - disablePictureInPicture → browser skips PiP affordance overhead
      */}
      <div
        ref={ref}
        style={{ position:"absolute", inset:0, zIndex:0 }}
        dangerouslySetInnerHTML={{ __html: `<video autoplay loop muted playsinline preload="auto" disablepictureinpicture style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:translateZ(0);will-change:transform;backface-visibility:hidden;"><source src="${VIDEO.hero}" type="video/mp4"/></video>` }}
      />

      <div style={{position:"absolute",inset:0,zIndex:1,background:
        "linear-gradient(to bottom,rgba(13,17,23,.55) 0%,transparent 25%,transparent 55%,rgba(13,17,23,.95) 100%),linear-gradient(to right,rgba(13,17,23,.65) 0%,transparent 60%)"
      }}/>

      <div className="hero-content" style={{position:"absolute",inset:0,zIndex:2,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 48px 52px"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:14}}>
          Beryl AI Labs · Live Avatar Platform
        </div>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(28px,5vw,68px)",fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:16,maxWidth:680}}>
          We need to have a<br/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#E8DCC8",fontSize:"clamp(32px,6vw,76px)"}}>face to face.</span>
        </h1>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(15px,2vw,19px)",color:"rgba(232,220,200,.8)",maxWidth:520,lineHeight:1.65,marginBottom:28}}>
          The era of the chatbox is over. Beryl Live replaces text-only AI with real, photorealistic conversations — sub-180ms, premium, human.
        </p>
        <div className="hero-btns" style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <Link href="/demo">
            <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"14px 32px",background:"#4CAF50",color:"#fff",border:"none",cursor:"pointer",textTransform:"uppercase",transition:"all .2s",width:"100%"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#1a5f7a"}}
              onMouseLeave={e=>{e.currentTarget.style.background="#4CAF50"}}>
              Start Live Demo
            </button>
          </Link>
          <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"14px 30px",background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,.5)",cursor:"pointer",textTransform:"uppercase",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#4CAF50";e.currentTarget.style.color="#4CAF50"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.5)";e.currentTarget.style.color="#fff"}}>
            Meet the Squad
          </button>
        </div>
        <div className="hero-badge" style={{position:"absolute",top:28,right:36,display:"flex",alignItems:"center",gap:8,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,color:"#fff",textTransform:"uppercase"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite",display:"inline-block"}}/>
          Live Platform
        </div>
      </div>
    </section>
  );
}

