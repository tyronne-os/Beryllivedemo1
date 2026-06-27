"use client";

const EDUCATION = [
  {alt:"Living Room",title:"Home Learning",sub:"Living room · Parent + child · Math tutoring",img:"/use-cases/living-room.jpeg"},
  {alt:"Kitchen",title:"Kitchen Table Learning",sub:"Kitchen · Teen student · Chemistry",img:"/use-cases/kitchen.jpeg"},
  {alt:"Office",title:"Corporate Training",sub:"Office · Professional · Excel & Analytics",img:"/use-cases/office.jpeg"},
  {alt:"College Dorm",title:"College Dorm",sub:"Dorm room · Student · Code & CS",img:"/use-cases/college.jpeg"},
];

const COMING_SOON = [
  {emoji:"💞",title:"Romantic Companion",bg:"linear-gradient(135deg,#1a0814,#3d0f2a,#1a0814)",desc:"Real connection, zero judgment. A live AI companion that listens, responds, and remembers — built for companionship, emotional support, and meaningful daily conversation."},
  {emoji:"🏡",title:"Elderly Care",bg:"linear-gradient(135deg,#0e0a1a,#2a1f4a,#0e0a1a)",desc:"A familiar face, always available. Beryl Live companions reduce isolation for seniors with daily check-ins, medication reminders, and warm conversation — on demand, 24/7."},
  {emoji:"📈",title:"Finance & Wealth",bg:"linear-gradient(135deg,#091409,#0d2e0d,#091409)",desc:"Your personal CFO, face to face. Live avatar advisors explain markets, build budgets, and answer complex financial questions in plain language — available the moment you need clarity."},
  {emoji:"🎙️",title:"Media & Podcasting",bg:"linear-gradient(135deg,#140808,#3a1010,#140808)",desc:"Live callers, real faces. Beryl Live transforms radio and podcast call-ins with live avatar guests — interactive, on-brand, and available for any show format, any time zone."},
];

export default function UseCases() {
  return (
    <section id="usecases" style={{background:"#FDFAF6",padding:"80px 32px 96px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#4CAF50,#1a5f7a,#4CAF50)"}}/>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:14}}>Beryl Live · Use Cases</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:700,color:"#0D1117",marginBottom:16}}>
            One platform.<br/><span style={{color:"#1a5f7a"}}>Infinite conversations.</span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#666",maxWidth:560,margin:"0 auto",lineHeight:1.7}}>
            Wherever humans need a face to talk to — Beryl Live is there.
          </p>
          <div style={{width:40,height:2,background:"#4CAF50",margin:"20px auto 0"}}/>
        </div>

        {/* Education grid */}
        <div style={{marginBottom:64}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
            <div style={{width:36,height:36,background:"#4CAF50",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎓</div>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#0D1117",letterSpacing:1}}>Education</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#4CAF50",fontStyle:"italic"}}>Live Now · Four real-world settings</div>
            </div>
            <div style={{flex:1,height:1,background:"rgba(76,175,80,0.2)"}}/>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#4CAF50",border:"1px solid #4CAF50",padding:"4px 12px",textTransform:"uppercase"}}>Active</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
            {EDUCATION.map(c=>(
              <div key={c.title} style={{position:"relative",overflow:"hidden",cursor:"pointer"}}
                onMouseEnter={e=>{(e.currentTarget.querySelector("img") as HTMLImageElement).style.transform="scale(1.04)";(e.currentTarget.querySelector(".uco") as HTMLElement).style.opacity="1"}}
                onMouseLeave={e=>{(e.currentTarget.querySelector("img") as HTMLImageElement).style.transform="scale(1)";(e.currentTarget.querySelector(".uco") as HTMLElement).style.opacity="0"}}>
                <div style={{paddingTop:"56%",position:"relative",overflow:"hidden",background:"#0D1117"}}>
                  <img src={c.img} alt={c.alt} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s"}}
                    onError={e=>{(e.currentTarget as HTMLImageElement).style.opacity="0.2"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 24px",background:"linear-gradient(transparent,rgba(13,17,23,0.9))"}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:"#fff",letterSpacing:1}}>{c.title}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#4CAF50",marginTop:3}}>{c.sub}</div>
                  </div>
                  <div className="uco" style={{position:"absolute",inset:0,border:"2px solid #4CAF50",background:"rgba(76,175,80,0.1)",opacity:0,transition:"opacity 0.3s"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon burnt orange section */}
        <div style={{position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(10,5,0,0.72)",zIndex:1}}/>
          <div style={{position:"absolute",inset:0,background:"#8B4513",zIndex:0}}/>
          <div style={{position:"relative",zIndex:2,padding:"64px 48px 72px"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#c8a951",marginBottom:16}}>The Future Is Already Here</div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(28px,4.5vw,54px)",fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:16}}>
                Beryl Live Is the Future<br/>
                <span style={{background:"linear-gradient(180deg,#f5e070 0%,#c8a951 30%,#8B6914 60%,#d4a832 100%)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>of AI Interaction.</span>
              </h2>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"rgba(232,220,200,0.75)",maxWidth:620,margin:"0 auto",lineHeight:1.7}}>
                Every industry. Every human need. Every conversation that used to feel cold — made warm, real, and alive.
              </p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:20}}>
                <div style={{height:1,width:60,background:"linear-gradient(to right,transparent,#c8a951)"}}/>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"#c8a951",textTransform:"uppercase"}}>More Verticals Coming</div>
                <div style={{height:1,width:60,background:"linear-gradient(to left,transparent,#c8a951)"}}/>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,maxWidth:1100,margin:"0 auto"}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {COMING_SOON.slice(0,2).map(c=>(
                  <div key={c.title} style={{position:"relative",overflow:"hidden",cursor:"pointer",border:"1px solid rgba(200,169,81,0.2)",transition:"border-color 0.3s"}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(200,169,81,0.6)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(200,169,81,0.2)")}>
                    <div style={{background:c.bg,padding:"36px 36px 32px",display:"flex",gap:28,alignItems:"flex-start"}}>
                      <div style={{fontSize:56,lineHeight:1,flexShrink:0}}>{c.emoji}</div>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:1}}>{c.title}</div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"#c8a951",border:"1px solid rgba(200,169,81,0.5)",padding:"3px 10px",textTransform:"uppercase",flexShrink:0}}>Coming Soon</div>
                        </div>
                        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"rgba(232,220,200,0.72)",lineHeight:1.6,margin:0}}>{c.desc}</p>
                      </div>
                    </div>
                    <div style={{height:2,background:"linear-gradient(90deg,transparent,#c8a951,transparent)"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {COMING_SOON.slice(2).map(c=>(
                  <div key={c.title} style={{position:"relative",overflow:"hidden",cursor:"pointer",border:"1px solid rgba(200,169,81,0.2)",transition:"border-color 0.3s"}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(200,169,81,0.6)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(200,169,81,0.2)")}>
                    <div style={{background:c.bg,padding:"36px 36px 32px",display:"flex",gap:28,alignItems:"flex-start"}}>
                      <div style={{fontSize:56,lineHeight:1,flexShrink:0}}>{c.emoji}</div>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:1}}>{c.title}</div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"#c8a951",border:"1px solid rgba(200,169,81,0.5)",padding:"3px 10px",textTransform:"uppercase",flexShrink:0}}>Coming Soon</div>
                        </div>
                        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"rgba(232,220,200,0.72)",lineHeight:1.6,margin:0}}>{c.desc}</p>
                      </div>
                    </div>
                    <div style={{height:2,background:"linear-gradient(90deg,transparent,#c8a951,transparent)"}}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Waitlist strip */}
            <div style={{maxWidth:1100,margin:"3px auto 0",background:"rgba(200,169,81,0.08)",border:"1px solid rgba(200,169,81,0.25)",padding:"22px 36px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:"#E8DCC8",letterSpacing:1}}>Be first in your vertical.</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"rgba(200,169,81,0.7)",marginTop:4,fontStyle:"italic"}}>New use cases launch monthly. Join the waitlist for early access & founding pricing.</div>
              </div>
              <button style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,padding:"13px 32px",background:"linear-gradient(135deg,#c8a951,#8B6914)",color:"#fff",border:"none",cursor:"pointer",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}>
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
