"use client";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export default function MatineePage() {
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(()=>{
    videoRef.current = videoWrapperRef.current?.querySelector("video") as HTMLVideoElement | null;
    const v = videoRef.current;
    if(!v) return;
    // Video autoplays muted (universal browser support). Then try to unmute.
    v.play().then(()=>{
      v.muted = false;
      setMuted(false);
    }).catch(()=>{
      // Stay muted — browser requires interaction first
    });
  },[]);

  const toggleMute = ()=>{
    if(!videoRef.current) return;
    const next = !videoRef.current.muted;
    videoRef.current.muted = next;
    setMuted(next);
  };

  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#04060a;}

        @keyframes gold-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fade-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes pulse-dot{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes border-glow{0%,100%{border-color:rgba(200,169,81,.2)}50%{border-color:rgba(200,169,81,.5)}}
        @keyframes btn-gold{0%{box-shadow:0 0 0 rgba(200,169,81,0)}50%{box-shadow:0 6px 40px rgba(200,169,81,.5)}100%{box-shadow:0 0 16px rgba(200,169,81,.2)}}
        @keyframes scan-line{0%{transform:translateY(-100%)}100%{transform:translateY(6000%)}}
        @keyframes parallax-drift{0%,100%{transform:scale(1.08) translate(0,0)}50%{transform:scale(1.1) translate(-1%,-.5%)}}
        @keyframes text-reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
        @keyframes trex-glow{0%,100%{box-shadow:0 0 80px rgba(76,175,80,.1),inset 0 0 40px rgba(76,175,80,.04)}50%{box-shadow:0 0 120px rgba(76,175,80,.2),inset 0 0 60px rgba(76,175,80,.08)}}

        .mat-cta-primary{
          display:inline-block;padding:20px 64px;
          font-family:'Cinzel',serif;font-size:13px;letter-spacing:4px;
          text-transform:uppercase;font-weight:700;text-decoration:none;color:#07050a;
          background:linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914);
          background-size:300% auto;animation:gold-shimmer 3s linear infinite,btn-gold 2.5s ease-in-out infinite;
          transition:transform .2s;border:none;cursor:pointer;
        }
        .mat-cta-primary:hover{transform:translateY(-4px) scale(1.04);}

        .mat-cta-outline{
          display:inline-block;padding:20px 48px;
          font-family:'Cinzel',serif;font-size:13px;letter-spacing:4px;text-transform:uppercase;
          font-weight:600;text-decoration:none;color:rgba(232,220,200,.75);
          border:1px solid rgba(232,220,200,.25);transition:all .25s;background:transparent;cursor:pointer;
        }
        .mat-cta-outline:hover{border-color:rgba(200,169,81,.5);color:#c8a951;}

        .wo-card{
          border:1px solid rgba(200,169,81,.12);background:rgba(10,8,4,.85);
          padding:32px;transition:border-color .3s,background .3s;
        }
        .wo-card:hover{border-color:rgba(200,169,81,.4);background:rgba(14,10,4,.95);}

        .feat-card{
          border:1px solid rgba(200,169,81,.1);background:rgba(10,8,4,.7);
          padding:28px 24px;transition:border-color .3s,transform .2s;
        }
        .feat-card:hover{border-color:rgba(200,169,81,.35);transform:translateY(-3px);}

        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(200,169,81,.3);border-radius:2px}

        @media(max-width:900px){
          .trex-split{flex-direction:column!important;}
          .trex-copy{max-width:100%!important;text-align:center!important;}
          .wo-grid{grid-template-columns:1fr!important}
          .feat-grid{grid-template-columns:1fr 1fr!important}
          .studio-embed-bar{flex-direction:column!important;gap:16px!important;text-align:center!important;}
        }
        @media(max-width:600px){
          .feat-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{minHeight:"100vh",background:"#04060a",color:"#E8DCC8"}}>

        {/* ════════════════════════════════════════════
            SECTION 1 — VIDEO HERO
        ════════════════════════════════════════════ */}
        <div style={{position:"relative",width:"100%",height:"100vh",overflow:"hidden",background:"#000"}}>

          {/* Letterbox bars */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:52,background:"#000",zIndex:20}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:52,background:"#000",zIndex:20}}/>

          {/* VIDEO */}
          <div
            ref={videoWrapperRef}
            style={{ position:"absolute", inset:0, zIndex:1 }}
            dangerouslySetInnerHTML={{ __html: `<video autoplay loop muted playsinline preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:parallax-drift 18s ease-in-out infinite;"><source src="/videos/matinee-hero.mp4" type="video/mp4"/></video>` }}
          />

          {/* Cinematic overlays */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(4,6,10,.72) 0%,rgba(4,6,10,.18) 35%,rgba(4,6,10,.18) 60%,rgba(4,6,10,.88) 100%)",zIndex:2}}/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(4,6,10,.5) 100%)",zIndex:3}}/>

          {/* Scan line */}
          <div style={{position:"absolute",left:0,right:0,height:1,background:"rgba(255,255,255,.04)",zIndex:4,animation:"scan-line 7s linear infinite"}}/>

          {/* Corner filigrees */}
          <svg style={{position:"absolute",top:60,left:24,zIndex:10,opacity:.45}} width={60} height={60} viewBox="0 0 60 60">
            <path d="M0 60 L0 0 L60 0" fill="none" stroke="rgba(200,169,81,.6)" strokeWidth="1"/>
            <path d="M0 45 L0 0 L45 0" fill="none" stroke="rgba(200,169,81,.3)" strokeWidth=".5"/>
          </svg>
          <svg style={{position:"absolute",top:60,right:24,zIndex:10,opacity:.45}} width={60} height={60} viewBox="0 0 60 60">
            <path d="M60 60 L60 0 L0 0" fill="none" stroke="rgba(200,169,81,.6)" strokeWidth="1"/>
            <path d="M60 45 L60 0 L15 0" fill="none" stroke="rgba(200,169,81,.3)" strokeWidth=".5"/>
          </svg>

          {/* HERO COPY */}
          <div style={{
            position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            textAlign:"center",zIndex:16,width:"92%",maxWidth:900,
          }}>
            {/* Live badge */}
            <div style={{
              display:"inline-flex",alignItems:"center",gap:10,marginBottom:28,
              border:"1px solid rgba(200,169,81,.3)",padding:"8px 24px",borderRadius:40,
              animation:"border-glow 3s ease-in-out infinite",
              background:"rgba(4,6,10,.4)",backdropFilter:"blur(8px)",
            }}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#4CAF50",
                boxShadow:"0 0 10px #4CAF50",animation:"pulse-dot 2s ease-in-out infinite"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,
                color:"rgba(200,169,81,.85)",textTransform:"uppercase"}}>
                Beryl AI Labs · Next-Gen Cinema Studio
              </span>
            </div>

            <h1 style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(3rem,9vw,7.5rem)",fontWeight:900,
              color:"#E8DCC8",lineHeight:.95,letterSpacing:".02em",
              textShadow:"0 0 100px rgba(200,169,81,.3),0 4px 60px rgba(0,0,0,.95)",
              marginBottom:16,animation:"fade-up .9s ease both",
            }}>
              BERYL<br/>MATINEE
            </h1>

            <div style={{
              fontFamily:"'Cinzel',serif",fontSize:"clamp(.85rem,2vw,1.15rem)",
              letterSpacing:6,color:"rgba(200,169,81,.8)",textTransform:"uppercase",
              marginBottom:16,animation:"fade-up 1.1s ease both",
            }}>
              From Prompt to Production — End to End
            </div>

            <p style={{
              fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1rem,1.8vw,1.2rem)",
              color:"rgba(232,220,200,.55)",lineHeight:1.8,maxWidth:620,
              margin:"0 auto 40px",animation:"fade-up 1.3s ease both",fontStyle:"italic",
            }}>
              Tell Vera your story. She'll build every scene.
            </p>

            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",animation:"fade-up 1.5s ease both"}}>
              <Link href="/matinee/studio" className="mat-cta-primary">Enter the Studio →</Link>
              <a href="#what-is-matinee" className="mat-cta-outline">See How It Works</a>
            </div>
          </div>

          {/* Mute toggle — bottom right */}
          <button
            onClick={toggleMute}
            style={{
              position:"absolute",bottom:68,right:28,zIndex:20,
              background:"rgba(4,6,10,.55)",backdropFilter:"blur(12px)",
              border:"1px solid rgba(76,175,80,.3)",borderRadius:"50%",
              width:52,height:52,cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:3,transition:"border-color .2s,background .2s",padding:0,
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(76,175,80,.7)";(e.currentTarget as HTMLButtonElement).style.background="rgba(76,175,80,.12)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(76,175,80,.3)";(e.currentTarget as HTMLButtonElement).style.background="rgba(4,6,10,.55)";}}
          >
            {/* Speaker icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {muted ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </>
              )}
            </svg>
            <span style={{
              fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:2,
              color:"#4CAF50",textTransform:"uppercase",lineHeight:1,
            }}>
              {muted ? "UNMUTE" : "MUTE"}
            </span>
          </button>

          {/* Scroll hint */}
          <div style={{position:"absolute",bottom:62,left:"50%",transform:"translateX(-50%)",zIndex:16,textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:4,
              color:"rgba(200,169,81,.4)",textTransform:"uppercase",animation:"pulse-dot 2.5s ease-in-out infinite"}}>
              ↓ Scroll
            </div>
          </div>
        </div>


        {/* ════════════════════════════════════════════
            SECTION 2 — T-REX BANNER: WHAT IS MATINEE
        ════════════════════════════════════════════ */}
        <section id="what-is-matinee" style={{
          position:"relative",overflow:"hidden",
          background:"linear-gradient(135deg,#040a04 0%,#060c06 40%,#04060a 100%)",
          borderTop:"1px solid rgba(200,169,81,.1)",borderBottom:"1px solid rgba(200,169,81,.1)",
        }}>
          {/* Full-bleed T-Rex image */}
          <div style={{
            position:"absolute",inset:0,
            backgroundImage:"url('/images/trex-banner.jpg')",
            backgroundSize:"cover",backgroundPosition:"center 30%",
            opacity:.22,
            animation:"parallax-drift 22s ease-in-out infinite",
          }}/>
          {/* Gradient mask over image */}
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to right,rgba(4,10,4,.97) 0%,rgba(4,10,4,.8) 45%,rgba(4,6,10,.3) 100%)"}}/>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to bottom,rgba(4,10,4,.5) 0%,transparent 30%,transparent 70%,rgba(4,10,4,.6) 100%)"}}/>

          <div className="trex-split" style={{
            position:"relative",zIndex:10,
            maxWidth:1300,margin:"0 auto",padding:"100px 40px",
            display:"flex",alignItems:"center",gap:60,
          }}>
            {/* Copy side */}
            <div className="trex-copy" style={{flex:"0 0 auto",maxWidth:620}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:5,
                color:"rgba(76,175,80,.8)",textTransform:"uppercase",marginBottom:18}}>
                ✦ Next-Generation Diffusion
              </div>

              <h2 style={{
                fontFamily:"'Cinzel Decorative',serif",
                fontSize:"clamp(1.8rem,4vw,3.2rem)",fontWeight:900,
                color:"#E8DCC8",lineHeight:1.05,marginBottom:24,letterSpacing:".02em",
              }}>
                A New Era of<br/>
                <span style={{
                  background:"linear-gradient(135deg,#1b5e20,#4CAF50,#a8e6a8,#4CAF50,#1b5e20)",
                  backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  backgroundClip:"text",animation:"gold-shimmer 4s linear infinite",
                }}>
                  Cinematic AI
                </span>
              </h2>

              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,
                color:"rgba(232,220,200,.75)",lineHeight:1.95,marginBottom:20}}>
                Beryl Matinee is the world's first voice-directed AI cinema studio. Speak your vision
                to <strong style={{color:"#4CAF50",fontStyle:"normal"}}>Vera</strong> — our award-winning
                cinematographer AI — and watch her build every scene, frame by frame, in real time.
              </p>

              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,
                color:"rgba(232,220,200,.55)",lineHeight:1.95,marginBottom:20}}>
                Powered by the latest diffusion frontier — <strong style={{color:"rgba(200,169,81,.8)",fontStyle:"normal"}}>Wan2.2-S2V</strong>,{" "}
                <strong style={{color:"rgba(200,169,81,.8)",fontStyle:"normal"}}>Seedance 2.5</strong>, and GPT-4o Realtime —
                Matinee turns narrative prompts into production-quality video with audio-driven character animation,
                automated storyboarding, and Oscar-level editorial intelligence.
              </p>

              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,
                color:"rgba(232,220,200,.5)",lineHeight:1.95,marginBottom:40}}>
                This is not a prompt tool. This is a <em>studio</em>. Your screenplay. Your storyboard.
                Your film — assembled, graded, and exported in minutes.
              </p>

              {/* Innovation pills */}
              <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:44}}>
                {[
                  "Voice-Directed",
                  "Vera AI Cinematographer",
                  "Auto-Stitch Film Assembly",
                  "HuggingFace Free Tier",
                  "Production Vault",
                  "LinkedIn Share",
                ].map(tag=>(
                  <span key={tag} style={{
                    fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,textTransform:"uppercase",
                    padding:"5px 12px",border:"1px solid rgba(76,175,80,.25)",
                    color:"rgba(76,175,80,.75)",background:"rgba(76,175,80,.06)",borderRadius:20,
                  }}>{tag}</span>
                ))}
              </div>

              {/* THE CTA */}
              <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                <Link href="/matinee/studio" className="mat-cta-primary">
                  Try It Now — Free →
                </Link>
                <Link href="/matinee/gallery" style={{
                  fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",
                  color:"rgba(200,169,81,.6)",textDecoration:"none",transition:"color .2s",
                }}>
                  View Gallery →
                </Link>
              </div>
            </div>

            {/* Right side — cinematic frame with T-Rex image */}
            <div style={{
              flex:1,minWidth:280,position:"relative",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              {/* Outer frame */}
              <div style={{
                position:"relative",width:"100%",maxWidth:500,
                border:"1px solid rgba(200,169,81,.2)",
                animation:"trex-glow 4s ease-in-out infinite",
              }}>
                {/* Letterbox top/bottom */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:20,background:"#000",zIndex:5}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:20,background:"#000",zIndex:5}}/>

                <img
                  src="/images/trex-banner.jpg"
                  alt="Beryl Matinee — T-Rex scene generated with Vera"
                  style={{
                    width:"100%",display:"block",
                    filter:"contrast(1.1) saturate(1.15)",
                  }}
                  onError={e=>{
                    (e.target as HTMLImageElement).style.display="none";
                  }}
                />

                {/* Corner marks */}
                {[
                  {top:20,left:0},{top:20,right:0},{bottom:20,left:0},{bottom:20,right:0}
                ].map((pos,i)=>(
                  <svg key={i} style={{position:"absolute",zIndex:6,opacity:.7,...pos}} width={16} height={16} viewBox="0 0 16 16">
                    <path d={i===0?"M0 16 L0 0 L16 0":i===1?"M16 16 L16 0 L0 0":i===2?"M0 0 L0 16 L16 16":"M16 0 L16 16 L0 16"}
                      fill="none" stroke="rgba(200,169,81,.8)" strokeWidth="1.5"/>
                  </svg>
                ))}

                {/* Overlay label */}
                <div style={{
                  position:"absolute",bottom:20,left:0,right:0,zIndex:6,
                  padding:"12px 16px",
                  background:"linear-gradient(to top,rgba(0,0,0,.85),transparent)",
                }}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,
                    color:"rgba(200,169,81,.8)",textTransform:"uppercase"}}>
                    Generated with Vera · Beryl Matinee Studio
                  </div>
                </div>

                {/* Scan line */}
                <div style={{position:"absolute",left:0,right:0,height:1,
                  background:"rgba(255,255,255,.05)",zIndex:7,animation:"scan-line 5s linear infinite"}}/>
              </div>
            </div>
          </div>
        </section>


        {/* ════════════════════════════════════════════
            SECTION 3 — PIPELINE
        ════════════════════════════════════════════ */}
        <section id="pipeline" style={{padding:"96px 24px",background:"rgba(6,8,5,.8)",
          borderBottom:"1px solid rgba(200,169,81,.08)"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:60}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,
                color:"rgba(200,169,81,.7)",textTransform:"uppercase",marginBottom:12}}>
                The Architecture
              </div>
              <h2 style={{fontFamily:"'Cinzel Decorative',serif",
                fontSize:"clamp(1.4rem,3.5vw,2.4rem)",fontWeight:900,color:"#E8DCC8"}}>
                Four Stages. One Cinematic Vision.
              </h2>
            </div>
            <div className="wo-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {[
                {n:"01",label:"Voice Direction",title:"Vera — AI Cinematographer",
                  desc:"Connect to Vera via GPT-4o Realtime. Speak your vision — she translates it into cinematic shot descriptions, calls the generation pipeline mid-conversation, and assembles your film automatically. No typing. No prompting. Just directing.",
                  tags:["GPT-4o Realtime","WebRTC","Server VAD","Tool Calls"]},
                {n:"02",label:"Scene Generation",title:"Vera Builds Each Scene",
                  desc:"When Vera understands your vision clearly enough to shoot, she fires the generation pipeline — filling in shot type, lighting, color grade, and camera movement. Scenes appear in the filmstrip in real time as they complete.",
                  tags:["Wan2.2-S2V","Seedance 2.5","Audio-Driven","Parallel Generation"]},
                {n:"03",label:"Auto-Stitch",title:"Oscar-Level Editorial AI",
                  desc:"Tell Vera you're ready to assemble. The stitch agent — powered by GPT-4o — designs scene order, cut types (hard cut, dissolve, smash cut, match cut), master color grade, pacing tempo, and bridge clip prompts. It writes an editor's note.",
                  tags:["GPT-4o Editor","Scene Ordering","Cut Intelligence","Color Grading"]},
                {n:"04",label:"Production Vault",title:"Gallery + LinkedIn Distribution",
                  desc:"Every film saves to your Production Vault — backed by HuggingFace Dataset storage. Browse in grid, filmstrip, or list view. One click drafts and posts your film to LinkedIn with a pre-written caption and hashtags.",
                  tags:["HF Dataset","3-View Gallery","LinkedIn Share","AIBRUH/beryl-matinee-gallery"]},
              ].map(wo=>(
                <div key={wo.n} className="wo-card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:"#4CAF50",
                      boxShadow:"0 0 10px #4CAF50",flexShrink:0}}/>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,
                      color:"rgba(200,169,81,.65)",textTransform:"uppercase"}}>
                      Stage {wo.n} · {wo.label}
                    </div>
                  </div>
                  <h3 style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,
                    color:"#E8DCC8",letterSpacing:.5,marginBottom:12}}>
                    {wo.title}
                  </h3>
                  <p style={{fontSize:13,color:"rgba(232,220,200,.52)",lineHeight:1.9,marginBottom:18}}>
                    {wo.desc}
                  </p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {wo.tags.map(t=>(
                      <span key={t} style={{
                        fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",
                        color:"rgba(76,175,80,.65)",border:"1px solid rgba(76,175,80,.18)",padding:"3px 9px",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════════════════════════════════════
            SECTION 4 — CAPABILITIES
        ════════════════════════════════════════════ */}
        <section style={{padding:"96px 24px",maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,
              color:"rgba(200,169,81,.7)",textTransform:"uppercase",marginBottom:12}}>
              What Matinee Delivers
            </div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(1.4rem,3.5vw,2.4rem)",fontWeight:900,color:"#E8DCC8"}}>
              Production-Ready. End to End.
            </h2>
          </div>
          <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {icon:"🎙️",title:"Voice-Directed Studio",desc:"Talk to Vera. She listens, designs, and generates — all hands-free via GPT-4o Realtime."},
              {icon:"🎬",title:"Auto Scene Builder",desc:"Vera calls generate_scene mid-conversation. Scenes appear in the filmstrip as you talk."},
              {icon:"✂️",title:"AI Film Assembly",desc:"Auto-stitch agent designs scene order, cut types, color grade, and editorial notes."},
              {icon:"🎥",title:"Premium Video Models",desc:"Wan2.2-S2V (free, 10 min, audio-driven) and Seedance 2.5 (30 sec, native audio)."},
              {icon:"🏛️",title:"Production Vault",desc:"HuggingFace Dataset-backed gallery. Grid, filmstrip, and list views. Always available."},
              {icon:"💼",title:"LinkedIn Distribution",desc:"One click drafts a professional post and shares your film directly to your LinkedIn page."},
            ].map(f=>(
              <div key={f.title} className="feat-card">
                <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,
                  color:"#E8DCC8",letterSpacing:.5,marginBottom:10}}>{f.title}</div>
                <div style={{fontSize:13,color:"rgba(232,220,200,.5)",lineHeight:1.8}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>


        {/* ════════════════════════════════════════════
            SECTION 5 — STUDIO GATEWAY (the builder)
        ════════════════════════════════════════════ */}
        <section style={{
          padding:"0",
          borderTop:"1px solid rgba(200,169,81,.15)",
          position:"relative",overflow:"hidden",
        }}>
          {/* Background — dark green/gold cinematic */}
          <div style={{
            position:"absolute",inset:0,
            background:"linear-gradient(135deg,#040a04 0%,#060e06 50%,#04060a 100%)",
          }}/>
          <div style={{position:"absolute",inset:0,
            background:"radial-gradient(ellipse at 50% 0%,rgba(76,175,80,.08) 0%,transparent 60%)"}}/>

          {/* Top bar — CTA gateway */}
          <div className="studio-embed-bar" style={{
            position:"relative",zIndex:10,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"48px 60px",maxWidth:1300,margin:"0 auto",
          }}>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:5,
                color:"rgba(76,175,80,.7)",textTransform:"uppercase",marginBottom:10}}>
                ✦ The Builder — Launch Now
              </div>
              <h2 style={{fontFamily:"'Cinzel Decorative',serif",
                fontSize:"clamp(1.4rem,3.5vw,2.8rem)",fontWeight:900,color:"#E8DCC8",
                lineHeight:1.1,marginBottom:8}}>
                Open the Studio.
              </h2>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,
                color:"rgba(232,220,200,.5)",lineHeight:1.8,maxWidth:480}}>
                Click Vera's orb. Describe your first scene. She'll do the rest — screenplay, storyboard, generation, and final cut.
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"flex-end"}}>
              <Link href="/matinee/studio" className="mat-cta-primary" style={{whiteSpace:"nowrap"}}>
                Launch Studio — Free →
              </Link>
              <Link href="/matinee/gallery" style={{
                fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,textTransform:"uppercase",
                color:"rgba(200,169,81,.5)",textDecoration:"none",textAlign:"right",
              }}>
                View Production Vault →
              </Link>
            </div>
          </div>

          {/* Studio preview strip — three feature cards */}
          <div style={{
            position:"relative",zIndex:10,
            display:"grid",gridTemplateColumns:"repeat(3,1fr)",
            borderTop:"1px solid rgba(255,255,255,.05)",
          }}>
            {[
              {
                icon:"🟢",label:"Side A — Vera",
                desc:"Voice-powered AI director. Speak your vision. She builds every scene.",
                sub:"GPT-4o Realtime · shimmer voice",
                color:"#4CAF50",
              },{
                icon:"🎬",label:"Side B — Film Preview",
                desc:"Live scene strip. Active generation indicator. Video playback on completion.",
                sub:"Wan2.2-S2V · Seedance 2.5",
                color:"#c8a951",
              },{
                icon:"◈",label:"Production Vault",
                desc:"Your gallery. Every film saved. One-click LinkedIn share.",
                sub:"HuggingFace Dataset storage",
                color:"rgba(157,228,248,.8)",
              },
            ].map((s,i)=>(
              <div key={i} style={{
                padding:"36px 40px",
                borderRight:i<2?"1px solid rgba(255,255,255,.05)":"none",
                transition:"background .2s",
              }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.02)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
              >
                <div style={{fontSize:22,marginBottom:12}}>{s.icon}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,
                  color:s.color,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>
                  {s.label}
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,
                  color:"rgba(232,220,200,.65)",lineHeight:1.8,marginBottom:10}}>
                  {s.desc}
                </div>
                <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,
                  color:"rgba(232,220,200,.25)",letterSpacing:1}}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA strip */}
          <div style={{
            position:"relative",zIndex:10,textAlign:"center",
            padding:"56px 24px",
            borderTop:"1px solid rgba(200,169,81,.08)",
            background:"rgba(4,6,4,.6)",
          }}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:6,
              color:"rgba(200,169,81,.5)",textTransform:"uppercase",marginBottom:20}}>
              ✦ Free to Use · No Card Required ✦
            </div>
            <Link href="/matinee/studio" className="mat-cta-primary" style={{fontSize:14,letterSpacing:5,padding:"22px 80px"}}>
              Direct Your First Film →
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
