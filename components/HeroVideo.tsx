"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.muted = true;
    v.play().catch(() => document.addEventListener("click", () => v.play(), {once:true}));
  }, []);

  return (
    <section style={{position:"relative",width:"100%",height:"85vh",minHeight:560,overflow:"hidden",background:"#0D1117"}}>
      <video ref={ref} autoPlay loop muted playsInline preload="auto" id="introBannerVideo"
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0}}>
        <source src="/videos/beryl-banner.mp4" type="video/mp4"/>
      </video>

      {/* Gradient overlays — exact from HTML */}
      <div style={{position:"absolute",inset:0,zIndex:1,background:
        "linear-gradient(to bottom, rgba(13,17,23,0.45) 0%, transparent 25%, transparent 65%, rgba(13,17,23,0.92) 100%), linear-gradient(to right, rgba(13,17,23,0.55) 0%, transparent 50%)"
      }}/>

      {/* Content */}
      <div style={{position:"absolute",inset:0,zIndex:2,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 56px 56px"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:16}}>
          Beryl AI Labs · Live Avatar Platform
        </div>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(36px,5vw,68px)",fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:18,maxWidth:720}}>
          We need to have a<br/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#E8DCC8",fontSize:"clamp(42px,6vw,76px)"}}>face to face.</span>
        </h1>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"rgba(232,220,200,0.8)",maxWidth:540,lineHeight:1.65,marginBottom:32}}>
          The era of the chatbox is over. Beryl Live replaces text-only AI with real, photorealistic conversations — sub-180ms, premium, human.
        </p>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <Link href="/demo">
            <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"15px 34px",background:"#4CAF50",color:"#fff",border:"none",cursor:"pointer",textTransform:"uppercase",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#1a5f7a"}}
              onMouseLeave={e=>{e.currentTarget.style.background="#4CAF50"}}>
              Start Live Demo
            </button>
          </Link>
          <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"15px 32px",background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.5)",cursor:"pointer",textTransform:"uppercase",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#4CAF50";e.currentTarget.style.color="#4CAF50"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.5)";e.currentTarget.style.color="#fff"}}>
            Meet the Squad
          </button>
        </div>

        {/* LIVE badge */}
        <div style={{position:"absolute",top:32,right:40,display:"flex",alignItems:"center",gap:8,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,color:"#fff",textTransform:"uppercase"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite",display:"inline-block"}}/>
          Live Platform
        </div>
      </div>
    </section>
  );
}
