"use client";
import { useEffect, useRef } from "react";
import { VIDEO } from "@/lib/cdn";

export default function DifferencePanel() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // GPU layer promotion
    v.style.transform = "translateZ(0)";
    v.style.willChange = "transform";
    v.muted = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");

    const tryPlay = () => v.play().catch(() => {});

    // IntersectionObserver: only decode + play when panel is visible
    // Pause + unload src when scrolled away — frees GPU memory on mobile
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!v.src && !v.querySelector("source")?.getAttribute("src")) return;
          tryPlay();
        } else {
          v.pause();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(v);

    // iOS first-gesture fallback
    const onGesture = () => { if (v.paused) tryPlay(); };
    document.addEventListener("touchstart", onGesture, { once: true });
    document.addEventListener("click", onGesture, { once: true });

    // Tab hidden → pause, tab visible → resume only if in viewport
    const onVisibility = () => {
      if (document.hidden) { v.pause(); }
      else {
        const rect = v.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) tryPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("click", onGesture);
    };
  }, []);

  return (
    <section style={{position:"relative",width:"100%",overflow:"hidden",background:"#0a0a0a"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .diff-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0;
          max-width: 1100px;
          margin: 0 auto;
          align-items: stretch;
        }
        .diff-vs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
        }
        @media (max-width: 768px) {
          .diff-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .diff-vs { flex-direction: row !important; padding: 8px 0 !important; justify-content: center !important; }
          .diff-vs .diff-vline { display: none !important; }
          .diff-left { border-radius: 12px !important; }
          .diff-right { border-radius: 12px !important; }
          .diff-section { padding: 40px 20px 48px !important; }
        }
      `}</style>

      <div style={{position:"absolute",top:0,left:0,right:0,height:80,background:"linear-gradient(to bottom,#fff,transparent)",zIndex:1}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to top,#FDFAF6,transparent)",zIndex:1}}/>

      <div className="diff-section" style={{position:"relative",zIndex:2,padding:"72px 24px 80px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:12}}>Beryl Live · The Difference</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,3.5vw,40px)",fontWeight:700,color:"#fff",marginBottom:14}}>
            This is what you&apos;ve been <span style={{color:"#4CAF50"}}>missing.</span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(15px,2vw,18px)",color:"rgba(232,220,200,.75)",maxWidth:540,margin:"0 auto",lineHeight:1.7}}>
            One side is where AI has been. The other is where it&apos;s going.
          </p>
          <div style={{width:40,height:2,background:"#4CAF50",margin:"20px auto 0"}}/>
        </div>

        <div className="diff-grid">
          {/* LEFT: old chatbox */}
          <div className="diff-left" style={{background:"rgba(13,17,23,.82)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px 0 0 12px",padding:"24px",display:"flex",flexDirection:"column",backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#aaa"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#aaa"}}>The Old Way</span>
            </div>
            <div style={{background:"#1a1a1a",borderRadius:8,overflow:"hidden",flex:1,display:"flex",flexDirection:"column"}}>
              <div style={{background:"#2a2a2a",padding:"8px 12px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #333"}}>
                {["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
                <div style={{flex:1,background:"#333",borderRadius:4,padding:"4px 10px",fontSize:11,color:"#888",margin:"0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>ai-chatbot.com/chat</div>
              </div>
              <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,minHeight:280}}>
                <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:12,borderBottom:"1px solid #2a2a2a"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>AI Assistant</div><div style={{fontSize:11,color:"#555"}}>● Online</div></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
                  {[
                    {side:"right",bg:"#1a5f7a",text:"Can you help me understand my options?"},
                    {side:"left",bg:"#2a2a2a",text:"Hello! I am an AI assistant. I can help you with a wide range of tasks. Please type your question..."},
                    {side:"right",bg:"#1a5f7a",text:"This feels so... cold."},
                    {side:"left",bg:"#2a2a2a",text:"I understand you may find text-based interfaces impersonal. Would you like me to adjust?"},
                  ].map((m,i)=>(
                    <div key={i} style={{alignSelf:m.side==="right"?"flex-end":"flex-start",background:m.bg,color:m.side==="right"?"#fff":"#bbb",padding:"9px 13px",borderRadius:m.side==="right"?"12px 12px 2px 12px":"12px 12px 12px 2px",fontSize:"clamp(11px,2vw,13px)",maxWidth:"88%",lineHeight:1.5,fontFamily:"'Cormorant Garamond',serif"}}>{m.text}</div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1,background:"#2a2a2a",border:"1px solid #333",borderRadius:6,padding:"9px 12px",fontSize:12,color:"#555",fontFamily:"'Cormorant Garamond',serif"}}>Type a message...</div>
                  <div style={{background:"#333",borderRadius:6,padding:"9px 14px",color:"#555",fontSize:16,cursor:"pointer"}}>➤</div>
                </div>
              </div>
            </div>
            <div style={{marginTop:16,textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#666",letterSpacing:1}}>NO FACE. NO TONE. NO CONNECTION.</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#555",marginTop:4,fontStyle:"italic"}}>Just text on a screen.</div>
            </div>
          </div>

          {/* CENTER VS */}
          <div className="diff-vs">
            <div className="diff-vline" style={{width:1,flex:1,background:"linear-gradient(to bottom,transparent,#4CAF50,transparent)"}}/>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#4CAF50",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:"#fff",margin:"12px 0",boxShadow:"0 0 24px rgba(76,175,80,.5)",flexShrink:0}}>VS</div>
            <div className="diff-vline" style={{width:1,flex:1,background:"linear-gradient(to bottom,transparent,#4CAF50,transparent)"}}/>
          </div>

          {/* RIGHT: Beryl Live — Eve video */}
          <div className="diff-right" style={{background:"rgba(232,220,200,.06)",border:"1px solid rgba(76,175,80,.3)",borderRadius:"0 12px 12px 0",padding:"24px",display:"flex",flexDirection:"column",backdropFilter:"blur(8px)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(76,175,80,.18),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#4CAF50"}}>Beryl Live</span>
            </div>
            <div style={{background:"#0D1117",borderRadius:8,overflow:"hidden",flex:1,display:"flex",flexDirection:"column",minHeight:280,position:"relative"}}>
              {/*
                Eve video optimisations:
                - preload="none" → zero network cost until IntersectionObserver fires
                - transform/will-change → own GPU layer
                - backfaceVisibility hidden → skip occlusion math
              */}
              <video
                ref={ref}
                autoPlay loop muted playsInline
                preload="none"
                disablePictureInPicture
                style={{
                  width:"100%",height:"100%",objectFit:"cover",minHeight:280,display:"block",
                  transform:"translateZ(0)",
                  willChange:"transform",
                  backfaceVisibility:"hidden",
                  WebkitBackfaceVisibility:"hidden" as "hidden",
                }}
              >
                <source src={VIDEO.eve} type="video/mp4"/>
              </video>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 55%,rgba(13,17,23,.85))"}}/>
              <div style={{position:"absolute",top:10,left:10,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite",display:"inline-block"}}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#4CAF50",textTransform:"uppercase"}}>Live</span>
              </div>
              <div style={{position:"absolute",bottom:12,left:14}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:"#fff"}}>Eve</div>
                <div style={{fontSize:11,color:"#4CAF50",letterSpacing:1,marginTop:2}}>AI Architect · In Session</div>
              </div>
            </div>
            <div style={{marginTop:16,textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#4CAF50",letterSpacing:1}}>FACE. VOICE. PRESENCE.</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"rgba(232,220,200,.7)",marginTop:4,fontStyle:"italic"}}>A conversation that actually feels like one.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

