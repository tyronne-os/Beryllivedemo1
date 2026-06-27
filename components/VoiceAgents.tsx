"use client";

export default function VoiceAgents() {
  return (
    <section style={{background:"#c8711a",padding:"64px 24px",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes wave-bar { from{transform:scaleY(.4)} to{transform:scaleY(1)} }
        @keyframes orb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes orb-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .va-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 440px;
          border: 1px solid rgba(200,169,81,.2);
          overflow: hidden;
        }
        .va-bullets {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .va-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .va-model { min-height: 260px !important; }
          .va-orb-box { padding: 40px 0 !important; height: auto !important; }
          .va-bullets {
            grid-template-columns: repeat(2,1fr) !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div style={{position:"absolute",inset:0,background:"rgba(10,5,0,.65)"}}/>
      <div style={{position:"relative",zIndex:2,maxWidth:900,margin:"0 auto"}}>

        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:"#c8a951",marginBottom:14}}>Voice Agents</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(24px,3.5vw,44px)",fontWeight:700,color:"#fff",lineHeight:1.15,marginBottom:14}}>A voice you trust.</h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(15px,2vw,19px)",lineHeight:1.8,color:"rgba(232,220,200,.8)",maxWidth:580,margin:"0 auto"}}>
            Sub-200ms response. 50+ languages. Emotion-aware. Available the precise moment you need it.
          </p>
        </div>

        <div className="va-grid">
          {/* Left: model photo */}
          <div className="va-model" style={{position:"relative",overflow:"hidden",borderRight:"1px solid rgba(200,169,81,.2)"}}>
            <img src="/voice-agent-model.jpeg" alt="Voice Agent"
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",opacity:.88}}/>
            <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,alignItems:"flex-end",height:44}}>
              {[...Array(12)].map((_,i)=>(
                <div key={i} style={{width:4,background:"#c8a951",borderRadius:2,transformOrigin:"bottom",animation:`wave-bar ${0.5+i*0.06}s ease-in-out infinite alternate`,animationDelay:`${i*0.05}s`,height:`${10+Math.abs(Math.sin(i*0.8))*28}px`}}/>
              ))}
            </div>
          </div>

          {/* Right: orb */}
          <div className="va-orb-box" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.25)",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%,rgba(200,169,81,.12),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{animation:"orb-float 4s ease-in-out infinite",position:"relative",zIndex:1}}>
              <div style={{position:"relative",width:140,height:140}}>
                <div style={{position:"absolute",inset:-28,borderRadius:"50%",border:"1px solid rgba(200,169,81,.25)",animation:"orb-spin 14s linear infinite"}}/>
                <div style={{position:"absolute",inset:-16,borderRadius:"50%",border:"1px solid rgba(200,169,81,.18)",animation:"orb-spin 9s linear infinite reverse"}}/>
                <div style={{position:"absolute",inset:-6,borderRadius:"50%",border:"1px solid rgba(200,169,81,.12)",animation:"orb-spin 5s linear infinite"}}/>
                <div style={{width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle at 35% 32%,#fff8c0,#f5e070 20%,#c8a951 45%,#8B6914 75%,#5a3f08 100%)",boxShadow:"0 0 50px rgba(200,169,81,.5),0 0 100px rgba(139,105,20,.3),inset 0 -16px 32px rgba(90,63,8,.4)"}}/>
              </div>
            </div>
          </div>
        </div>

        <div className="va-bullets" style={{marginTop:32,paddingTop:28,borderTop:"1px solid rgba(200,169,81,.15)"}}>
          {[
            {label:"Romantic Companionship",note:"Available now"},
            {label:"Finance Voice Guidance",note:"Coming soon"},
            {label:"Sub-200ms Latency",note:"Real-time response"},
            {label:"50+ Languages",note:"Emotion-aware · 24/7"},
          ].map(item=>(
            <div key={item.label} style={{textAlign:"center"}}>
              <div style={{color:"#c8a951",fontSize:16,marginBottom:6}}>✦</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"rgba(232,220,200,.9)",marginBottom:4}}>{item.label}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(232,220,200,.5)",fontStyle:"italic"}}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


