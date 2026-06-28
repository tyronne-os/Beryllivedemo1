"use client";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function MatineePage() {
  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04060a; }

        @keyframes road-rush   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes car-a-move  { 0%{transform:translateX(0) skewX(-3deg)} 40%{transform:translateX(18px) skewX(-5deg)} 70%{transform:translateX(-8px) skewX(-2deg)} 100%{transform:translateX(5px) skewX(-4deg)} }
        @keyframes car-b-move  { 0%{transform:translateX(0) skewX(-2deg)} 30%{transform:translateX(-14px) skewX(-6deg)} 65%{transform:translateX(10px) skewX(-3deg)} 100%{transform:translateX(-6px) skewX(-4deg)} }
        @keyframes headlights  { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes spark-fly   { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0} }
        @keyframes near-miss   { 0%,100%{filter:brightness(1)} 48%{filter:brightness(2.4)} 52%{filter:brightness(1.9)} }
        @keyframes scan-line   { 0%{transform:translateY(-100%)} 100%{transform:translateY(6000%)} }
        @keyframes fade-up     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gold-shimmer{ 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes red-pulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes border-glow { 0%,100%{border-color:rgba(220,60,60,.2)} 50%{border-color:rgba(220,60,60,.6)} }
        @keyframes btn-ignite  { 0%{box-shadow:0 0 0 rgba(220,60,60,0)} 50%{box-shadow:0 4px 32px rgba(220,60,60,.7)} 100%{box-shadow:0 0 12px rgba(220,60,60,.3)} }

        .mat-hero-cta {
          display:inline-block; padding:18px 56px;
          font-family:'Cinzel',serif; font-size:13px; letter-spacing:3px;
          text-transform:uppercase; font-weight:700; text-decoration:none; color:#fff;
          background:linear-gradient(135deg,#6b0a0a,#dc3c3c,#ff6060,#dc3c3c,#6b0a0a);
          background-size:300% auto;
          border:1px solid rgba(255,96,96,.4);
          animation:btn-ignite 2s ease-in-out infinite;
          transition:transform .2s;
        }
        .mat-hero-cta:hover{transform:translateY(-4px) scale(1.05);}

        .wo-card {
          border:1px solid rgba(220,60,60,.15); background:rgba(10,4,16,.8);
          padding:32px; transition:border-color .3s,background .3s;
        }
        .wo-card:hover { border-color:rgba(220,60,60,.5); background:rgba(14,6,22,.95); }

        .pipe-dot { width:10px;height:10px;border-radius:50%;background:#dc3c3c;box-shadow:0 0 12px #dc3c3c;flex-shrink:0; }
        @media(max-width:768px){
          .wo-grid{grid-template-columns:1fr!important}
          .feat-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      <div style={{minHeight:"100vh",background:"#04060a",color:"#E8DCC8"}}>

        {/* ── HERO — FULL CINEMATIC CAR CHASE ── */}
        <div style={{position:"relative",width:"100%",height:"100vh",overflow:"hidden",background:"#04060a"}}>

          {/* Letterbox */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:48,background:"#000",zIndex:20}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:48,background:"#000",zIndex:20}}/>

          {/* City skyline — scrolling */}
          <svg style={{position:"absolute",bottom:48,left:0,width:"200%",height:280,zIndex:1,animation:"road-rush 10s linear infinite"}}
            viewBox="0 0 1400 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {[
              [0,80,70,200],[75,40,50,240],[130,100,60,180],[195,20,55,260],[255,70,80,210],
              [340,50,55,230],[400,90,45,190],[450,15,75,265],[530,60,60,220],[595,35,50,245],
              [650,85,70,195],[725,45,55,235],[785,75,65,205],[855,25,50,255],[910,65,75,215],
              [990,55,60,225],[1055,95,45,185],[1105,10,70,270],[1180,50,65,230],[1250,30,55,250],
              [1310,80,60,200],[1375,45,25,235],
            ].map(([x,y,w,h],i)=>(
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} fill={i%4===0?"#0d1828":i%4===1?"#0a1220":i%4===2?"#080e1a":"#0b1525"}/>
                {Array.from({length:Math.floor((h as number)/20)}).map((_,r)=>
                  Array.from({length:Math.floor((w as number)/18)}).map((_,c)=>(
                    <rect key={`${r}${c}`} x={(x as number)+3+(c*18)} y={(y as number)+4+(r*20)}
                      width={7} height={10}
                      fill={r*c%3===0?"rgba(255,220,80,.55)":r%2===0?"rgba(80,160,255,.4)":"rgba(255,100,80,.3)"}
                      opacity={(r+c)%3===0?1:0}/>
                  ))
                )}
              </g>
            ))}
            {/* Mirror for seamless loop */}
            {[
              [0,80,70,200],[75,40,50,240],[130,100,60,180],[195,20,55,260],[255,70,80,210],
              [340,50,55,230],[400,90,45,190],[450,15,75,265],[530,60,60,220],[595,35,50,245],
            ].map(([x,y,w,h],i)=>(
              <rect key={`m${i}`} x={(x as number)+1400} y={y} width={w} height={h}
                fill={i%3===0?"#0d1828":"#0a1220"}/>
            ))}
          </svg>

          {/* Road */}
          <div style={{position:"absolute",bottom:48,left:0,right:0,height:140,background:"linear-gradient(to bottom,#141414,#0a0a0a)",zIndex:2}}>
            {/* Rushing center line */}
            <div style={{position:"absolute",top:"38%",left:0,right:0,height:4,overflow:"hidden"}}>
              <div style={{display:"flex",animation:"road-rush 0.32s linear infinite",width:"200%"}}>
                {Array.from({length:50}).map((_,i)=>(
                  <div key={i} style={{width:70,height:4,background:i%2===0?"rgba(255,220,0,.75)":"transparent",flexShrink:0}}/>
                ))}
              </div>
            </div>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(220,60,60,.12))"}}/>
          </div>

          {/* Car B — being chased, ahead */}
          <div style={{
            position:"absolute",bottom:108,left:"58%",zIndex:5,
            animation:"car-b-move 1.7s ease-in-out infinite, near-miss 3.4s ease-in-out infinite",
          }}>
            <svg viewBox="0 0 200 80" width={200} height={80} xmlns="http://www.w3.org/2000/svg">
              <path d="M10 56 Q12 32 45 24 L155 24 Q188 24 192 40 L194 56 Z" fill="#1a2c1a"/>
              <path d="M34 24 Q40 10 66 7 L134 7 Q162 7 168 24 Z" fill="#122212"/>
              <path d="M42 24 Q47 12 68 9 L96 9 L98 24Z" fill="rgba(100,210,255,.3)"/>
              <path d="M100 24 L100 9 L130 9 Q152 9 160 24Z" fill="rgba(100,210,255,.3)"/>
              <rect x={7} y={40} width={14} height={10} rx={2} fill="#ff2020"/>
              <rect x={7} y={40} width={14} height={10} rx={2} fill="rgba(255,32,32,.5)" style={{filter:"blur(5px)"}}/>
              <circle cx={48} cy={58} r={14} fill="#0f0f0f"/><circle cx={48} cy={58} r={7} fill="#252525"/>
              <circle cx={152} cy={58} r={14} fill="#0f0f0f"/><circle cx={152} cy={58} r={7} fill="#252525"/>
            </svg>
            <div style={{position:"absolute",bottom:-10,left:0,width:50,height:24,background:"radial-gradient(ellipse,rgba(255,30,30,.7),transparent 70%)",filter:"blur(7px)"}}/>
          </div>

          {/* Car A — pursuer, large */}
          <div style={{
            position:"absolute",bottom:95,left:"26%",zIndex:6,
            animation:"car-a-move 1.5s ease-in-out infinite",
          }}>
            <svg viewBox="0 0 280 110" width={280} height={110} xmlns="http://www.w3.org/2000/svg">
              <path d="M10 75 Q12 42 55 32 L225 32 Q268 32 272 55 L274 75 Z" fill="#090909"/>
              <path d="M46 32 Q54 12 86 8 L194 8 Q230 8 238 32 Z" fill="#060606"/>
              <path d="M58 32 Q65 14 90 10 L134 10 L136 32Z" fill="rgba(80,190,255,.28)"/>
              <path d="M138 32 L138 10 L182 10 Q208 10 220 32Z" fill="rgba(80,190,255,.28)"/>
              <rect x={248} y={48} width={22} height={14} rx={4} fill="#ffe066" style={{animation:"headlights .45s ease-in-out infinite"}}/>
              <rect x={248} y={48} width={22} height={14} rx={4} fill="rgba(255,225,80,.45)" style={{filter:"blur(8px)"}}/>
              <rect x={8} y={52} width={16} height={12} rx={2} fill="#ff1010"/>
              <circle cx={68} cy={80} r={20} fill="#0d0d0d"/><circle cx={68} cy={80} r={10} fill="#1e1e1e"/>
              <circle cx={212} cy={80} r={20} fill="#0d0d0d"/><circle cx={212} cy={80} r={10} fill="#1e1e1e"/>
              {[0,1,2,3,4].map(i=>(
                <line key={i} x1={10} y1={36+i*9} x2={-80-i*25} y2={36+i*9}
                  stroke="rgba(255,255,255,.1)" strokeWidth={1.8-(i*0.3)}/>
              ))}
            </svg>
            <div style={{position:"absolute",right:-110,top:24,width:130,height:40,background:"linear-gradient(to right,rgba(255,225,80,.4),transparent)",filter:"blur(10px)"}}/>
          </div>

          {/* Sparks */}
          {[
            {x:54,y:55,sx:"22px",sy:"-26px",c:"#ffcc00",d:0},
            {x:55,y:58,sx:"-15px",sy:"-32px",c:"#ff8800",d:.1},
            {x:53,y:52,sx:"28px",sy:"-18px",c:"#ffffff",d:.2},
            {x:56,y:61,sx:"-22px",sy:"-22px",c:"#ffdd44",d:.05},
            {x:52,y:56,sx:"16px",sy:"-38px",c:"#ff6600",d:.15},
            {x:57,y:54,sx:"-10px",sy:"-28px",c:"#ffaa00",d:.25},
          ].map((s,i)=>(
            <div key={i} style={{
              position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
              width:5,height:5,borderRadius:"50%",background:s.c,
              ["--sx" as string]:s.sx,["--sy" as string]:s.sy,
              animation:`spark-fly 0.55s ${s.d}s ease-out infinite`,
              zIndex:8,filter:"blur(.5px)",
            }}/>
          ))}

          {/* Scan line */}
          <div style={{position:"absolute",left:0,right:0,height:2,background:"rgba(255,255,255,.05)",zIndex:15,animation:"scan-line 6s linear infinite"}}/>

          {/* Red atmosphere */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 90%,rgba(220,60,60,.22) 0%,transparent 60%)",zIndex:3}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(4,6,10,.7) 0%,transparent 30%,transparent 65%,rgba(4,6,10,.8) 100%)",zIndex:4}}/>

          {/* Hero copy — centered */}
          <div style={{
            position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            textAlign:"center",zIndex:16,width:"90%",maxWidth:800,
            animation:"fade-up 1s ease both",
          }}>
            <div style={{
              display:"inline-flex",alignItems:"center",gap:12,marginBottom:24,
              border:"1px solid rgba(220,60,60,.35)",padding:"8px 24px",borderRadius:40,
              animation:"border-glow 3s ease-in-out infinite",
            }}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#dc3c3c",boxShadow:"0 0 10px #dc3c3c"}}/>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#dc3c3c",textTransform:"uppercase"}}>
                Beryl AI Labs · Enterprise Cinema Studio
              </span>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#dc3c3c",boxShadow:"0 0 10px #dc3c3c"}}/>
            </div>

            <h1 style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(2.8rem,8vw,7rem)",
              fontWeight:900,color:"#E8DCC8",lineHeight:1.0,letterSpacing:".02em",
              textShadow:"0 0 80px rgba(220,60,60,.5),0 4px 40px rgba(0,0,0,.95)",
              marginBottom:12,
            }}>BERYL<br/>MATINEE</h1>

            <div style={{
              fontFamily:"'Cinzel',serif",fontSize:"clamp(.8rem,2vw,1.1rem)",
              letterSpacing:5,color:"rgba(220,60,60,.85)",textTransform:"uppercase",marginBottom:32,
              textShadow:"0 0 24px rgba(220,60,60,.6)",
            }}>
              From Prompt to Production — End to End
            </div>

            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
              <a href="#pipeline" className="mat-hero-cta">View the Pipeline →</a>
              <a href="#pipeline" style={{
                display:"inline-block",padding:"18px 56px",
                fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",
                fontWeight:600,textDecoration:"none",color:"rgba(232,220,200,.7)",
                border:"1px solid rgba(232,220,200,.2)",transition:"all .25s",
              }}>Early Access</a>
            </div>
          </div>

          {/* Bottom scroll hint */}
          <div style={{position:"absolute",bottom:60,left:"50%",transform:"translateX(-50%)",zIndex:16,textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:4,color:"rgba(220,60,60,.5)",textTransform:"uppercase",animation:"red-pulse 2s ease-in-out infinite"}}>
              ↓ Scroll
            </div>
          </div>
        </div>

        {/* ── WHAT IS MATINEE ── */}
        <section style={{padding:"96px 24px",maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#dc3c3c",textTransform:"uppercase",marginBottom:16,opacity:.85}}>
            ✦ The Vision
          </div>
          <h2 style={{
            fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.6rem,4vw,3rem)",
            fontWeight:900,color:"#E8DCC8",lineHeight:1.1,marginBottom:28,
          }}>
            AI Cinema Is Not a Tool.<br/>
            <span style={{
              background:"linear-gradient(135deg,#8b1a1a,#dc3c3c,#ff8080,#dc3c3c,#8b1a1a)",
              backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",animation:"gold-shimmer 4s linear infinite",
            }}>
              It's a Studio.
            </span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"rgba(232,220,200,.7)",lineHeight:1.9,maxWidth:720,margin:"0 auto 20px"}}>
            Beryl Matinee transforms a single narrative prompt into a complete cinematic production — coordinating a multi-agent AI director, automated storyboarding, premium video generation, and real-time avatar guidance inside one unified studio.
          </p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"rgba(232,220,200,.5)",lineHeight:1.9,maxWidth:620,margin:"0 auto"}}>
            Built on Llama 4 Maverick, HunyuanVideo-1.5, and Wan2.2-MoE — the same frontier models powering the world's most advanced generative pipelines.
          </p>
        </section>

        {/* ── PIPELINE — 4 WORK ORDERS ── */}
        <section id="pipeline" style={{padding:"80px 24px 96px",background:"rgba(10,4,16,.6)",borderTop:"1px solid rgba(220,60,60,.1)",borderBottom:"1px solid rgba(220,60,60,.1)"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:60}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#dc3c3c",textTransform:"uppercase",marginBottom:12,opacity:.85}}>
                The Architecture
              </div>
              <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.4rem,3.5vw,2.4rem)",fontWeight:900,color:"#E8DCC8"}}>
                Four Stages. One Cinematic Vision.
              </h2>
            </div>

            <div className="wo-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {[
                {
                  n:"01", label:"Core Infrastructure",
                  title:"Agent Framework & Authentication",
                  desc:"Multi-agent orchestration via Hugging Face Pro. Director Agent coordinates Screenplay, Producer, Continuity, and Cinematographer agents through deterministic handoffs — no context drift, no telephone-game degradation.",
                  tags:["Llama 4 Maverick","ChromaDB","Redis/Celery","HF Pro API"],
                },
                {
                  n:"02", label:"Narrative Pipeline",
                  title:"Storyboard & Character Intelligence",
                  desc:"10M-token context window parses full novels into structured scene breakdowns. Character consistency sheets, visual metadata, camera directions, and temporal coherence all resolved before a single frame is generated.",
                  tags:["10M Context","Character IDs","Camera Directions","Continuity AI"],
                },
                {
                  n:"03", label:"Video Generation",
                  title:"Three-Tier Quality Engine",
                  desc:"LTX-Video for rapid previews. HunyuanVideo-1.5 for production. Wan2.2-MoE for premium output. Parallel Celery processing, style LoRA switching (Pixar · Anime · Photorealistic), and AI quality inspection at 85%+ threshold.",
                  tags:["HunyuanVideo-1.5","Wan2.2-MoE","Style LoRAs","AI Inspector"],
                },
                {
                  n:"04", label:"Dual-Sandbox GUI",
                  title:"Live Avatar + Cinema Workspace",
                  desc:"Conversational avatar on Side A guides your creative vision in real time. Side B displays the live storyboard grid, character panels, scene previews, and final export — all updating as the pipeline runs.",
                  tags:["Real-Time Preview","Avatar Director","Scene Carousel","Multi-Format Export"],
                },
              ].map(wo=>(
                <div key={wo.n} className="wo-card">
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                    <div className="pipe-dot"/>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"#dc3c3c",textTransform:"uppercase",opacity:.7}}>
                      Work Order {wo.n} · {wo.label}
                    </div>
                  </div>
                  <h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:"#E8DCC8",letterSpacing:.5,marginBottom:14}}>
                    {wo.title}
                  </h3>
                  <p style={{fontSize:13,color:"rgba(232,220,200,.55)",lineHeight:1.85,marginBottom:20}}>
                    {wo.desc}
                  </p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {wo.tags.map(t=>(
                      <span key={t} style={{
                        fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1.5,
                        textTransform:"uppercase",color:"rgba(220,60,60,.7)",
                        border:"1px solid rgba(220,60,60,.2)",padding:"4px 10px",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CAPABILITIES ── */}
        <section style={{padding:"96px 24px",maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#dc3c3c",textTransform:"uppercase",marginBottom:12,opacity:.85}}>
              What Matinee Delivers
            </div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.4rem,3.5vw,2.4rem)",fontWeight:900,color:"#E8DCC8"}}>
              Production-Ready. End to End.
            </h2>
          </div>
          <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {icon:"🎬",title:"Multi-Agent Director",desc:"AI Director orchestrates every department — from script to final cut."},
              {icon:"📋",title:"Auto-Storyboarding",desc:"Character sheets, camera angles, and scene transitions generated automatically."},
              {icon:"🎭",title:"Character Consistency",desc:"ChromaDB vector storage keeps every character visually identical across scenes."},
              {icon:"🎥",title:"Premium Video Generation",desc:"HunyuanVideo-1.5 and Wan2.2-MoE produce cinematic-quality output."},
              {icon:"🤖",title:"Live Avatar Guidance",desc:"Conversational AI director walks you through every creative decision in real time."},
              {icon:"🎨",title:"Style LoRA System",desc:"One-click switching between Pixar, Anime, and Photorealistic visual styles."},
            ].map(f=>(
              <div key={f.title} style={{
                border:"1px solid rgba(220,60,60,.12)",background:"rgba(10,4,16,.6)",
                padding:"28px 24px",transition:"border-color .3s",
              }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(220,60,60,.4)")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(220,60,60,.12)")}
              >
                <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:"#E8DCC8",letterSpacing:.5,marginBottom:10}}>{f.title}</div>
                <div style={{fontSize:13,color:"rgba(232,220,200,.5)",lineHeight:1.8}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EARLY ACCESS CTA ── */}
        <section style={{
          padding:"96px 24px",textAlign:"center",
          background:"linear-gradient(135deg,#060409,#0a0410,#060409)",
          borderTop:"1px solid rgba(220,60,60,.15)",
        }}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#dc3c3c",textTransform:"uppercase",marginBottom:20,opacity:.8}}>
            ✦ Coming Soon ✦
          </div>
          <h2 style={{
            fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.8rem,5vw,3.5rem)",
            fontWeight:900,color:"#E8DCC8",marginBottom:24,lineHeight:1.1,
            textShadow:"0 0 60px rgba(220,60,60,.3)",
          }}>
            Be First on Set.
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"rgba(232,220,200,.6)",maxWidth:560,margin:"0 auto 40px",lineHeight:1.9}}>
            Beryl Matinee opens early access to select studios and creators. Join the list and be the first to direct your AI cinema production.
          </p>
          <Link href="/contact" className="mat-hero-cta">
            Request Early Access →
          </Link>
        </section>

      </div>
    </>
  );
}
