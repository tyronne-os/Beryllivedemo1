"use client";

export default function VoiceAgents() {
  return (
    <section style={{background:"#c8711a",padding:"72px 48px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(10,5,0,0.65)"}}/>

      <div style={{position:"relative",zIndex:2,maxWidth:900,margin:"0 auto"}}>

        {/* Top text */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#c8a951",marginBottom:14}}>Voice Agents</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(26px,3.5vw,44px)",fontWeight:700,color:"#fff",lineHeight:1.15,marginBottom:16}}>
            A voice you trust.
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,lineHeight:1.8,color:"rgba(232,220,200,0.8)",maxWidth:620,margin:"0 auto"}}>
            There is something about a voice you trust that is difficult to describe until you feel it. Sub-200ms response. 50+ languages. Emotion-aware. Available the precise moment you need it.
          </p>
        </div>

        {/* Split box: model image left | orb right — same height */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",height:480,border:"1px solid rgba(200,169,81,0.2)",overflow:"hidden"}}>

          {/* Left: model photo */}
          <div style={{position:"relative",overflow:"hidden",borderRight:"1px solid rgba(200,169,81,0.2)"}}>
            <img
              src="/voice-agent-model.jpeg"
              alt="Voice Agent"
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",opacity:0.88}}
            />
            {/* Wave bars at bottom */}
            <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,alignItems:"flex-end",height:48}}>
              {[...Array(12)].map((_,i)=>(
                <div key={i} style={{width:4,background:"#c8a951",borderRadius:2,transformOrigin:"bottom",animation:`wave-bar ${0.5+i*0.06}s ease-in-out infinite alternate`,animationDelay:`${i*0.05}s`,height:`${10+Math.abs(Math.sin(i*0.8))*32}px`}}/>
              ))}
            </div>
          </div>

          {/* Right: animated gold orb — same box size */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.25)",position:"relative"}}>
            {/* Ambient glow */}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%,rgba(200,169,81,0.12),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{animation:"orb-float 4s ease-in-out infinite",position:"relative",zIndex:1}}>
              <div style={{position:"relative",width:160,height:160}}>
                <div style={{position:"absolute",inset:-32,borderRadius:"50%",border:"1px solid rgba(200,169,81,0.25)",animation:"orb-spin 14s linear infinite"}}/>
                <div style={{position:"absolute",inset:-18,borderRadius:"50%",border:"1px solid rgba(200,169,81,0.18)",animation:"orb-spin 9s linear infinite reverse"}}/>
                <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:"1px solid rgba(200,169,81,0.12)",animation:"orb-spin 5s linear infinite"}}/>
                <div style={{
                  width:160,height:160,borderRadius:"50%",
                  background:"radial-gradient(circle at 35% 32%,#fff8c0,#f5e070 20%,#c8a951 45%,#8B6914 75%,#5a3f08 100%)",
                  boxShadow:"0 0 60px rgba(200,169,81,0.5),0 0 120px rgba(139,105,20,0.3),inset 0 -20px 40px rgba(90,63,8,0.4)"
                }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bullets */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,marginTop:36,paddingTop:32,borderTop:"1px solid rgba(200,169,81,0.15)"}}>
          {[
            {label:"Romantic Companionship",note:"Available now"},
            {label:"Finance Voice Guidance",note:"Coming soon"},
            {label:"Sub-200ms Latency",note:"Real-time response"},
            {label:"50+ Languages",note:"Emotion-aware · 24/7"},
          ].map(item=>(
            <div key={item.label} style={{textAlign:"center"}}>
              <div style={{color:"#c8a951",fontSize:16,marginBottom:6}}>✦</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:1,textTransform:"uppercase",color:"rgba(232,220,200,0.9)",marginBottom:4}}>{item.label}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(232,220,200,0.5)",fontStyle:"italic"}}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
