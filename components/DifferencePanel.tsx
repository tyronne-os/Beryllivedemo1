"use client";
import { useEffect, useRef } from "react";

export default function DifferencePanel() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const v=ref.current; if(!v) return;
    v.muted=true; v.play().catch(()=>document.addEventListener("click",()=>v.play(),{once:true}));
  },[]);

  return (
    <section style={{position:"relative",width:"100%",overflow:"hidden",background:"#0a0a0a"}}>
      {/* Top fade from white */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:80,background:"linear-gradient(to bottom,#fff,transparent)",zIndex:1}}/>
      {/* Bottom fade */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to top,#FDFAF6,transparent)",zIndex:1}}/>

      <div style={{position:"relative",zIndex:2,padding:"72px 48px 80px"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:12}}>Beryl Live · The Difference</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:700,color:"#fff",marginBottom:14}}>
            This is what you&apos;ve been <span style={{color:"#4CAF50"}}>missing.</span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"rgba(232,220,200,0.75)",maxWidth:560,margin:"0 auto",lineHeight:1.7}}>
            One side is where AI has been. The other is where it&apos;s going.
          </p>
          <div style={{width:40,height:2,background:"#4CAF50",margin:"20px auto 0"}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:0,maxWidth:1100,margin:"0 auto",alignItems:"stretch"}}>

          {/* LEFT: old chatbox */}
          <div style={{background:"rgba(13,17,23,0.82)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px 0 0 12px",padding:32,display:"flex",flexDirection:"column",backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#aaa"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#aaa"}}>The Old Way</span>
            </div>
            <div style={{background:"#1a1a1a",borderRadius:8,overflow:"hidden",flex:1,display:"flex",flexDirection:"column"}}>
              <div style={{background:"#2a2a2a",padding:"8px 14px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #333"}}>
                {["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
                <div style={{flex:1,background:"#333",borderRadius:4,padding:"4px 12px",fontSize:11,color:"#888",margin:"0 12px"}}>ai-chatbot.com/chat</div>
              </div>
              <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",gap:14,minHeight:320}}>
                <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:14,borderBottom:"1px solid #2a2a2a"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>AI Assistant</div><div style={{fontSize:11,color:"#555"}}>● Online</div></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12,flex:1}}>
                  {[
                    {side:"right",bg:"#1a5f7a",text:"Can you help me understand my options?"},
                    {side:"left",bg:"#2a2a2a",text:"Hello! I am an AI assistant. I can help you with a wide range of tasks. Please type your question and I will respond with relevant information..."},
                    {side:"right",bg:"#1a5f7a",text:"This feels so... cold."},
                    {side:"left",bg:"#2a2a2a",text:"I understand you may find text-based interfaces impersonal. Would you like me to adjust my communication style?"},
                  ].map((m,i)=>(
                    <div key={i} style={{alignSelf:m.side==="right"?"flex-end":"flex-start",background:m.bg,color:m.side==="right"?"#fff":"#bbb",padding:"10px 14px",borderRadius:m.side==="right"?"12px 12px 2px 12px":"12px 12px 12px 2px",fontSize:13,maxWidth:"85%",lineHeight:1.5,fontFamily:"'Cormorant Garamond',serif"}}>{m.text}</div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <div style={{flex:1,background:"#2a2a2a",border:"1px solid #333",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#555",fontFamily:"'Cormorant Garamond',serif"}}>Type a message...</div>
                  <div style={{background:"#333",borderRadius:6,padding:"10px 16px",color:"#555",fontSize:16,cursor:"pointer"}}>➤</div>
                </div>
              </div>
            </div>
            <div style={{marginTop:20,textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#666",letterSpacing:1}}>NO FACE. NO TONE. NO CONNECTION.</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#555",marginTop:6,fontStyle:"italic"}}>Just text on a screen.</div>
            </div>
          </div>

          {/* CENTER VS */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 20px",position:"relative"}}>
            <div style={{width:1,flex:1,background:"linear-gradient(to bottom,transparent,#4CAF50,transparent)"}}/>
            <div style={{width:48,height:48,borderRadius:"50%",background:"#4CAF50",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:"#fff",margin:"12px 0",boxShadow:"0 0 24px rgba(76,175,80,0.5)",flexShrink:0}}>VS</div>
            <div style={{width:1,flex:1,background:"linear-gradient(to bottom,transparent,#4CAF50,transparent)"}}/>
          </div>

          {/* RIGHT: Beryl Live */}
          <div style={{background:"rgba(232,220,200,0.06)",border:"1px solid rgba(76,175,80,0.3)",borderRadius:"0 12px 12px 0",padding:32,display:"flex",flexDirection:"column",backdropFilter:"blur(8px)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(76,175,80,0.18),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#4CAF50"}}>Beryl Live</span>
            </div>
            <div style={{background:"#0D1117",borderRadius:8,overflow:"hidden",flex:1,display:"flex",flexDirection:"column",minHeight:320,position:"relative"}}>
              <video ref={ref} id="eveVideo" autoPlay loop muted playsInline preload="auto"
                style={{width:"100%",height:"100%",objectFit:"cover",minHeight:320}}>
                <source src="/videos/eve-demo.mp4" type="video/mp4"/>
              </video>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 55%,rgba(13,17,23,0.85))"}}/>
              <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#4CAF50",animation:"pulse 2s infinite",display:"inline-block"}}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#4CAF50",textTransform:"uppercase"}}>Live</span>
              </div>
              <div style={{position:"absolute",bottom:14,left:16}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:"#fff"}}>Eve</div>
                <div style={{fontSize:12,color:"#4CAF50",letterSpacing:1,marginTop:2}}>AI Architect · In Session</div>
              </div>
            </div>
            <div style={{marginTop:20,textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#4CAF50",letterSpacing:1}}>FACE. VOICE. PRESENCE.</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"rgba(232,220,200,0.7)",marginTop:6,fontStyle:"italic"}}>A conversation that actually feels like one.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
