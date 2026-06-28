"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
interface Message { role: "user" | "assistant"; content: string; }
interface Scene {
  index: number; title: string; description: string; location: string;
  camera: string; emotion: string; status: "pending"|"generating"|"ready"|"error";
  videoUrl?: string; thumbnail?: string;
}
interface ProjectState {
  title: string; style: "photorealistic"|"pixar"|"anime";
  tier: "preview"|"production"|"premium"|"ultra";
  phase: "idle"|"screenplay"|"storyboard"|"generating"|"complete";
  scenes: Scene[]; characters: {id:string;name:string;description:string}[];
  progress: number;
  audioUrl?: string;      // for Wan2.2-S2V free tiers
  referenceImageUrl?: string; // for Wan2.2-S2V free tiers
}

const TIER_INFO = {
  preview:    { model:"Wan2.2-S2V-14B",   maxSec:600,  maxLabel:"10 min",  free:true,  audio:"Audio-driven (give it audio → synced video)" },
  production: { model:"Wan2.2-S2V-14B",   maxSec:600,  maxLabel:"10 min",  free:true,  audio:"Audio-driven (give it audio → synced video)" },
  premium:    { model:"Seedance 2.0 T2V",  maxSec:15,   maxLabel:"15 sec",  free:false, audio:"Native audio+video (text-to-video)" },
  ultra:      { model:"Seedance 2.5 T2V",  maxSec:30,   maxLabel:"30 sec",  free:false, audio:"Native audio+video (text-to-video)" },
};

// ── Demo scenes (shown before user generates) ──────────────────────────────
const DEMO_SCENES: Scene[] = [
  {index:0,title:"The Setup",description:"Two figures face off on a rain-slicked rooftop, city lights blurring below.",location:"Rooftop · Night",camera:"Wide establishing, slow push in",emotion:"Tension",status:"ready"},
  {index:1,title:"The Chase Begins",description:"A black sedan tears through a crowded market, scattering vendors.",location:"Night Market · Dusk",camera:"Low tracking shot, handheld",emotion:"Urgency",status:"ready"},
  {index:2,title:"Near Miss",description:"Cars collide at an intersection — one spins, sparks flying, pedestrians scatter.",location:"Downtown Intersection",camera:"Dutch angle, crash cam",emotion:"Shock",status:"ready"},
  {index:3,title:"The Alley",description:"On foot now. Protagonist sprints through a narrow alley, breathing hard.",location:"Back Alley · Night",camera:"POV chase cam, extreme close-up",emotion:"Fear / Determination",status:"generating"},
  {index:4,title:"Confrontation",description:"They face each other in an abandoned warehouse, harsh industrial light above.",location:"Warehouse · Interior",camera:"Slow zoom, tight two-shot",emotion:"Reckoning",status:"pending"},
  {index:5,title:"The Reveal",description:"A hand opens to reveal a photograph. Everything changes.",location:"Warehouse · Close",camera:"Extreme close-up → pull back",emotion:"Devastation",status:"pending"},
];

const EMOTION_COLORS: Record<string,string> = {
  Tension:"#c8a951",Urgency:"#dc3c3c",Shock:"#ff6b6b",
  Fear:"#8b4513","Fear / Determination":"#dc3c3c",Reckoning:"#4a9ab5",Devastation:"#6b4f8b",
};

// ── Component ──────────────────────────────────────────────────────────────
export default function MatineeStudio() {
  const [messages, setMessages] = useState<Message[]>([
    {role:"assistant", content:"Director online. I've preloaded a cinematic car-chase sequence to demonstrate the pipeline. Type your own story prompt to begin a new production, or adjust style and quality settings on the left."},
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [project, setProject] = useState<ProjectState>({
    title:"Untitled Production", style:"photorealistic", tier:"preview",
    phase:"idle", scenes:DEMO_SCENES, characters:[], progress:0,
  });
  const [activeScene, setActiveScene] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"scenes"|"characters"|"settings">("scenes");
  const [generating, setGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  // Simulate scene generation progress for demo
  useEffect(()=>{
    const iv = setInterval(()=>{
      setProject(p=>{
        if(p.phase!=="generating") return p;
        const next = p.progress+2;
        if(next>=100) return {...p,progress:100,phase:"complete"};
        return {...p,progress:next};
      });
    },120);
    return ()=>clearInterval(iv);
  },[project.phase]);

  const sendMessage = useCallback(async()=>{
    if(!input.trim()||typing) return;
    const userMsg: Message = {role:"user",content:input.trim()};
    setMessages(m=>[...m,userMsg]);
    setInput("");
    setTyping(true);

    // Detect if it's a generation request
    const isGenerate = /generate|create|make|start|produce|shoot|film|render/i.test(input);
    if(isGenerate){
      setProject(p=>({...p,phase:"screenplay",progress:5}));
      await new Promise(r=>setTimeout(r,800));
      setMessages(m=>[...m,{role:"assistant",content:`Cut! Beginning production on "${input.slice(0,40)}…". Running screenplay agent through Llama 4 Maverick. Storyboard drops next.`}]);
      setProject(p=>({...p,phase:"storyboard",progress:20}));
      await new Promise(r=>setTimeout(r,1200));
      setMessages(m=>[...m,{role:"assistant",content:"Storyboard locked. 6 scenes mapped. Character consistency sheets generated. Sending to video generation tier now."}]);
      setProject(p=>({...p,phase:"generating",progress:30}));
      setTyping(false);
      return;
    }

    // Director chat via API
    try {
      const res = await fetch("/api/matinee/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[...messages,userMsg], projectState:{phase:project.phase,title:project.title,style:project.style,tier:project.tier}}),
      });
      if(!res.ok||!res.body){throw new Error("stream failed");}
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText="";
      setMessages(m=>[...m,{role:"assistant",content:""}]);
      while(true){
        const {done,value}=await reader.read();
        if(done) break;
        const chunk=decoder.decode(value);
        const lines=chunk.split("\n").filter(l=>l.startsWith("data:"));
        for(const line of lines){
          const data=line.slice(5).trim();
          if(data==="[DONE]") break;
          try{
            const parsed=JSON.parse(data);
            const delta=parsed.choices?.[0]?.delta?.content??"";
            assistantText+=delta;
            setMessages(m=>[...m.slice(0,-1),{role:"assistant",content:assistantText}]);
          }catch{}
        }
      }
    } catch {
      setMessages(m=>[...m,{role:"assistant",content:"Director connection momentarily interrupted. Try again or use a generation command."}]);
    }
    setTyping(false);
  },[input,typing,messages,project]);

  const handleKey = (e: React.KeyboardEvent)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} };

  const startGeneration = ()=>{
    if(generating) return;
    setGenerating(true);
    setProject(p=>({...p,phase:"generating",progress:0}));
    setMessages(m=>[...m,{role:"assistant",content:`Production rolling. ${project.tier.toUpperCase()} tier · ${project.style} style. Generating all ${project.scenes.length} scenes in parallel via Celery workers.`}]);
    setTimeout(()=>setGenerating(false),8000);
  };

  const cs = project.scenes[activeScene];

  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&family=Roboto+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#090b0f;overflow-x:hidden;}

        @keyframes gold-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes pulse-dot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes scan-v{0%{transform:translateY(-100%)}100%{transform:translateY(800%)}}
        @keyframes fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes progress-shine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes gen-blink{0%,100%{border-color:rgba(220,60,60,.3)}50%{border-color:rgba(220,60,60,.8)}}

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(200,169,81,.3);border-radius:2px}

        .send-btn{
          background:linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914);
          background-size:300% auto; border:none; color:#090b0f;
          font-family:'Cinzel',serif; font-size:10px; letter-spacing:2px;
          text-transform:uppercase; font-weight:700; padding:10px 20px;
          cursor:pointer; transition:opacity .2s; white-space:nowrap;
          animation:gold-shimmer 3s linear infinite;
        }
        .send-btn:hover{opacity:.85;}
        .send-btn:disabled{background:#333;color:#666;animation:none;cursor:default;}

        .scene-thumb{
          border:1px solid rgba(200,169,81,.12); cursor:pointer;
          transition:border-color .2s,background .2s; background:rgba(255,255,255,.02);
        }
        .scene-thumb:hover{border-color:rgba(200,169,81,.4);background:rgba(200,169,81,.04);}
        .scene-thumb.active{border-color:#c8a951;background:rgba(200,169,81,.08);}

        .tier-btn{
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;
          text-transform:uppercase;padding:7px 14px;cursor:pointer;
          border:1px solid rgba(200,169,81,.2);background:transparent;
          color:rgba(232,220,200,.5);transition:all .2s;
        }
        .tier-btn.active{border-color:#c8a951;background:rgba(200,169,81,.1);color:#c8a951;}
        .tier-btn:hover:not(.active){border-color:rgba(200,169,81,.4);color:rgba(232,220,200,.8);}

        .style-btn{
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;
          text-transform:uppercase;padding:7px 14px;cursor:pointer;
          border:1px solid rgba(100,180,255,.15);background:transparent;
          color:rgba(232,220,200,.45);transition:all .2s;
        }
        .style-btn.active{border-color:#4a9ab5;background:rgba(74,154,181,.1);color:#9de4f8;}
        .style-btn:hover:not(.active){border-color:rgba(100,180,255,.35);color:rgba(232,220,200,.75);}

        .tab-btn{
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
          text-transform:uppercase;padding:8px 16px;cursor:pointer;
          border:none;background:transparent;color:rgba(232,220,200,.4);
          border-bottom:2px solid transparent;transition:all .2s;
        }
        .tab-btn.active{color:#c8a951;border-bottom-color:#c8a951;}
        .tab-btn:hover:not(.active){color:rgba(232,220,200,.7);}

        .chat-bubble-user{
          background:rgba(200,169,81,.1);border:1px solid rgba(200,169,81,.2);
          padding:10px 14px;border-radius:2px 2px 0 2px;margin-left:20%;
          animation:fade-in .3s ease;
        }
        .chat-bubble-ai{
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
          padding:10px 14px;border-radius:2px 2px 2px 0;margin-right:10%;
          animation:fade-in .3s ease;
        }

        @media(max-width:900px){
          .studio-grid{grid-template-columns:1fr!important;}
          .sidebar{display:none!important;}
          .main-panels{grid-template-columns:1fr!important;}
        }
        @media(max-width:600px){
          .main-panels{grid-template-rows:1fr 1fr!important;height:auto!important;}
        }
      `}</style>

      <div style={{minHeight:"100vh",background:"#090b0f",display:"flex",flexDirection:"column"}}>

        {/* ── STUDIO HEADER ── */}
        <div style={{
          borderBottom:"1px solid rgba(200,169,81,.15)",
          background:"rgba(9,11,15,.97)",backdropFilter:"blur(20px)",
          padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",
          position:"sticky",top:64,zIndex:100,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{
              fontFamily:"'Cinzel Decorative',serif",fontSize:14,fontWeight:900,
              background:"linear-gradient(135deg,#8b1a1a,#dc3c3c,#ff8080,#dc3c3c,#8b1a1a)",
              backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",animation:"gold-shimmer 3s linear infinite",
            }}>MATINEE</div>
            <div style={{width:1,height:20,background:"rgba(255,255,255,.1)"}}/>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:"rgba(232,220,200,.5)",textTransform:"uppercase"}}>
              Studio
            </div>
            {project.phase!=="idle" && (
              <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#dc3c3c",animation:"pulse-dot 1s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#dc3c3c",textTransform:"uppercase"}}>
                  {project.phase==="complete"?"Complete":project.phase==="generating"?`Generating ${project.progress}%`:project.phase}
                </span>
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:10,color:"rgba(232,220,200,.3)"}}>
              {project.scenes.filter(s=>s.status==="ready").length}/{project.scenes.length} scenes ready
            </span>
            <button onClick={startGeneration} disabled={generating} style={{
              fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",
              padding:"8px 20px",background:generating?"#333":"linear-gradient(135deg,#6b0a0a,#dc3c3c,#ff6060)",
              color:generating?"#666":"#fff",border:"none",cursor:generating?"default":"pointer",
              transition:"opacity .2s",animation:generating?"gen-blink 1s ease-in-out infinite":"none",
            }}>
              {generating?"● Generating…":"⬤ Start Production"}
            </button>
            <Link href="/matinee" style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(232,220,200,.4)",textDecoration:"none",textTransform:"uppercase"}}>
              ← Back
            </Link>
          </div>
        </div>

        {/* ── PROGRESS BAR (when generating) ── */}
        {project.phase==="generating" && (
          <div style={{height:2,background:"rgba(255,255,255,.05)",position:"relative"}}>
            <div style={{
              position:"absolute",left:0,top:0,height:"100%",width:`${project.progress}%`,
              background:"linear-gradient(to right,#6b0a0a,#dc3c3c,#ff8080,#dc3c3c)",
              backgroundSize:"300% auto",animation:"progress-shine 1.5s linear infinite",
              transition:"width .3s",
            }}/>
          </div>
        )}

        <div className="studio-grid" style={{display:"grid",gridTemplateColumns:"220px 1fr",flex:1,minHeight:0}}>

          {/* ── LEFT SIDEBAR ── */}
          <div className="sidebar" style={{
            borderRight:"1px solid rgba(200,169,81,.1)",background:"rgba(6,8,12,.9)",
            display:"flex",flexDirection:"column",overflow:"hidden",
          }}>
            {/* Tabs */}
            <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              {(["scenes","characters","settings"] as const).map(t=>(
                <button key={t} className={`tab-btn${sidebarTab===t?" active":""}`} onClick={()=>setSidebarTab(t)}>
                  {t==="scenes"?"🎬":t==="characters"?"🎭":"⚙"}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"12px 10px"}}>

              {/* SCENES tab */}
              {sidebarTab==="scenes" && (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {project.scenes.map((s,i)=>(
                    <div key={s.index} className={`scene-thumb${activeScene===i?" active":""}`}
                      onClick={()=>setActiveScene(i)} style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"rgba(200,169,81,.6)"}}>
                          {String(i+1).padStart(2,"0")}
                        </span>
                        <span style={{
                          fontFamily:"'Roboto Mono',monospace",fontSize:8,
                          color:s.status==="ready"?"#4CAF50":s.status==="generating"?"#dc3c3c":s.status==="error"?"#ff4444":"rgba(255,255,255,.3)",
                        }}>
                          {s.status==="generating"?"●":s.status==="ready"?"✓":s.status==="error"?"✗":"○"}
                        </span>
                      </div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"#E8DCC8",marginBottom:3}}>{s.title}</div>
                      <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(232,220,200,.35)",lineHeight:1.5}}>
                        {s.location}
                      </div>
                      {s.emotion && (
                        <div style={{
                          marginTop:5,display:"inline-block",padding:"2px 6px",
                          background:`${EMOTION_COLORS[s.emotion]??EMOTION_COLORS.Tension}22`,
                          border:`1px solid ${EMOTION_COLORS[s.emotion]??EMOTION_COLORS.Tension}44`,
                          fontFamily:"'Roboto Mono',monospace",fontSize:7,
                          color:EMOTION_COLORS[s.emotion]??EMOTION_COLORS.Tension,letterSpacing:1,
                        }}>{s.emotion}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CHARACTERS tab */}
              {sidebarTab==="characters" && (
                <div>
                  {project.characters.length===0 ? (
                    <div style={{textAlign:"center",padding:"32px 12px"}}>
                      <div style={{fontSize:28,marginBottom:12}}>🎭</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(232,220,200,.3)",letterSpacing:1,lineHeight:1.8}}>
                        Characters appear here after screenplay generation. ChromaDB tracks visual consistency across all scenes.
                      </div>
                    </div>
                  ) : project.characters.map(c=>(
                    <div key={c.id} style={{padding:"10px 12px",border:"1px solid rgba(200,169,81,.1)",marginBottom:8}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:11,fontWeight:700,color:"#E8DCC8",marginBottom:4}}>{c.name}</div>
                      <div style={{fontSize:10,color:"rgba(232,220,200,.4)",lineHeight:1.6}}>{c.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* SETTINGS tab */}
              {sidebarTab==="settings" && (
                <div style={{display:"flex",flexDirection:"column",gap:20,padding:"8px 2px"}}>
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(200,169,81,.6)",textTransform:"uppercase",marginBottom:10}}>Style</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {(["photorealistic","pixar","anime"] as const).map(s=>(
                        <button key={s} className={`style-btn${project.style===s?" active":""}`}
                          onClick={()=>setProject(p=>({...p,style:s}))}>
                          {s==="photorealistic"?"📷 Photorealistic":s==="pixar"?"🎪 Pixar 3D":"🌸 Anime"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(200,169,81,.6)",textTransform:"uppercase",marginBottom:10}}>Quality Tier</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {([
                        {id:"preview",    label:"⚡ Preview",    sub:"Wan2.2-S2V · up to 10 min · FREE", free:true },
                        {id:"production", label:"🎬 Production", sub:"Wan2.2-S2V · up to 10 min · FREE", free:true },
                        {id:"premium",    label:"★ Premium",     sub:"Seedance 2.0 · 15 sec · audio",    free:false},
                        {id:"ultra",      label:"◆ Ultra",       sub:"Seedance 2.5 · 30 sec · audio",    free:false},
                      ] as const).map(t=>(
                        <button key={t.id} className={`tier-btn${project.tier===t.id?" active":""}`}
                          onClick={()=>setProject(p=>({...p,tier:t.id as typeof p.tier}))}>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                            <span>{t.label} {t.free && <span style={{fontSize:7,color:"#4CAF50",marginLeft:4,fontWeight:700}}>FREE</span>}</span>
                            <span style={{fontSize:7,opacity:.55,letterSpacing:.5,textTransform:"none"}}>{t.sub}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio input — required for free Wan2.2-S2V tiers */}
                  {(project.tier==="preview"||project.tier==="production") && (
                    <div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(200,169,81,.6)",textTransform:"uppercase",marginBottom:6}}>
                        Audio Track <span style={{color:"#dc3c3c",fontSize:8}}>*required</span>
                      </div>
                      <div style={{fontSize:8,fontFamily:"'Roboto Mono',monospace",color:"rgba(232,220,200,.35)",marginBottom:8,lineHeight:1.7}}>
                        Wan2.2-S2V animates your character in sync with this audio. Video length = audio length.
                      </div>
                      <input
                        type="url"
                        placeholder="https://… audio URL (.mp3/.wav)"
                        value={project.audioUrl??""}
                        onChange={e=>setProject(p=>({...p,audioUrl:e.target.value}))}
                        style={{
                          width:"100%",background:"rgba(255,255,255,.04)",
                          border:"1px solid rgba(200,169,81,.2)",color:"#E8DCC8",
                          fontSize:9,fontFamily:"'Roboto Mono',monospace",padding:"7px 10px",outline:"none",
                        }}
                      />
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(200,169,81,.6)",textTransform:"uppercase",margin:"10px 0 6px"}}>
                        Reference Image <span style={{color:"rgba(232,220,200,.3)",fontWeight:400,letterSpacing:0,textTransform:"none",fontSize:8}}>(portrait to animate)</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://… image URL (.png/.jpg)"
                        value={project.referenceImageUrl??""}
                        onChange={e=>setProject(p=>({...p,referenceImageUrl:e.target.value}))}
                        style={{
                          width:"100%",background:"rgba(255,255,255,.04)",
                          border:"1px solid rgba(200,169,81,.2)",color:"#E8DCC8",
                          fontSize:9,fontFamily:"'Roboto Mono',monospace",padding:"7px 10px",outline:"none",
                        }}
                      />
                    </div>
                  )}

                  {/* Model info card */}
                  <div style={{padding:"12px",background:"rgba(220,60,60,.06)",border:"1px solid rgba(220,60,60,.15)"}}>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(220,60,60,.7)",lineHeight:1.9}}>
                      <span style={{color:"rgba(200,169,81,.8)"}}>MODEL</span> {TIER_INFO[project.tier]?.model}<br/>
                      <span style={{color:"rgba(200,169,81,.8)"}}>MAX LEN</span> {TIER_INFO[project.tier]?.maxLabel}<br/>
                      <span style={{color:"rgba(200,169,81,.8)"}}>AUDIO</span> {TIER_INFO[project.tier]?.audio}<br/>
                      <span style={{color:"rgba(200,169,81,.8)"}}>STYLE</span> {project.style}<br/>
                      <span style={{color:"rgba(200,169,81,.8)"}}>COST</span> <span style={{color:TIER_INFO[project.tier]?.free?"#4CAF50":"#dc3c3c"}}>{TIER_INFO[project.tier]?.free?"$0 — HF free tier":"fal.ai paid API"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MAIN DUAL PANELS ── */}
          <div className="main-panels" style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:0}}>

            {/* ── SIDE A: DIRECTOR AVATAR ── */}
            <div style={{
              borderRight:"1px solid rgba(255,255,255,.06)",
              display:"flex",flexDirection:"column",background:"rgba(8,10,14,.8)",
            }}>
              {/* Panel header */}
              <div style={{
                padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"rgba(6,8,12,.9)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{display:"flex",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
                  </div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:"rgba(232,220,200,.6)",textTransform:"uppercase",marginLeft:4}}>
                    Live Director · Side A
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#28c840",boxShadow:"0 0 8px #28c840",animation:"pulse-dot 2s ease-in-out infinite"}}/>
                  <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"#28c840"}}>GPT-4o · Online</span>
                </div>
              </div>

              {/* Chat window */}
              <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12,minHeight:0}}>
                {messages.map((m,i)=>(
                  <div key={i} className={m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,letterSpacing:1,
                      color:m.role==="user"?"rgba(200,169,81,.6)":"rgba(220,60,60,.6)",marginBottom:5,textTransform:"uppercase"}}>
                      {m.role==="user"?"You":"Director"}
                    </div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,220,200,.85)",lineHeight:1.75}}>
                      {m.content || <span style={{opacity:.3}}>▌</span>}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="chat-bubble-ai">
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"rgba(220,60,60,.6)",marginBottom:5}}>DIRECTOR</div>
                    <div style={{display:"flex",gap:4,padding:"4px 0"}}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#dc3c3c",opacity:.6,
                          animation:`pulse-dot 1s ${i*0.2}s ease-in-out infinite`}}/>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>

              {/* Input */}
              <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(6,8,12,.9)"}}>
                <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(200,169,81,.4)",marginBottom:6,letterSpacing:1}}>
                  TRY: "Generate a noir heist film" · "Switch to anime style" · "What's the project status?"
                </div>
                <div style={{display:"flex",gap:8}}>
                  <textarea
                    value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Direct your production…"
                    rows={2} style={{
                      flex:1,background:"rgba(255,255,255,.04)",border:"1px solid rgba(200,169,81,.2)",
                      color:"#E8DCC8",fontSize:12,fontFamily:"'Cinzel',serif",padding:"8px 12px",
                      resize:"none",outline:"none",lineHeight:1.6,
                    }}
                  />
                  <button className="send-btn" onClick={sendMessage} disabled={!input.trim()||typing}>
                    CUT →
                  </button>
                </div>
              </div>
            </div>

            {/* ── SIDE B: FILM PREVIEW ── */}
            <div style={{display:"flex",flexDirection:"column",background:"rgba(6,8,11,.9)"}}>
              {/* Panel header */}
              <div style={{
                padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"rgba(4,6,10,.9)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{display:"flex",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
                  </div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:"rgba(232,220,200,.6)",textTransform:"uppercase",marginLeft:4}}>
                    Film Preview · Side B
                  </span>
                </div>
                <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(232,220,200,.3)"}}>
                  Scene {activeScene+1}/{project.scenes.length} · {cs?.status?.toUpperCase()}
                </div>
              </div>

              {/* Main viewer */}
              <div style={{flex:1,position:"relative",background:"#000",minHeight:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {/* Letterbox */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:32,background:"#000",zIndex:10}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:32,background:"#000",zIndex:10}}/>

                {cs?.status==="ready" ? (
                  // Scene visualization
                  <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
                    {/* Cinematic scene card */}
                    <div style={{
                      position:"absolute",inset:0,
                      background:`linear-gradient(135deg, ${EMOTION_COLORS[cs.emotion]??EMOTION_COLORS.Tension}22 0%, #000 60%)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      {/* Scene info overlay */}
                      <div style={{textAlign:"center",padding:"0 40px",zIndex:5}}>
                        <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,letterSpacing:3,
                          color:`${EMOTION_COLORS[cs.emotion]??EMOTION_COLORS.Tension}`,marginBottom:16,textTransform:"uppercase"}}>
                          Scene {activeScene+1} · {cs.emotion}
                        </div>
                        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.2rem,2.5vw,2rem)",
                          fontWeight:900,color:"#E8DCC8",marginBottom:16,lineHeight:1.1}}>
                          {cs.title}
                        </div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(232,220,200,.6)",
                          lineHeight:1.8,maxWidth:400,margin:"0 auto 20px"}}>
                          {cs.description}
                        </div>
                        <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"rgba(232,220,200,.3)",letterSpacing:1}}>
                          {cs.location} · {cs.camera}
                        </div>
                      </div>

                      {/* Scan line */}
                      <div style={{position:"absolute",left:0,right:0,height:1,background:"rgba(255,255,255,.06)",
                        animation:"scan-v 6s linear infinite",zIndex:4}}/>
                    </div>
                  </div>
                ) : cs?.status==="generating" ? (
                  <div style={{textAlign:"center",padding:"40px"}}>
                    <div style={{width:48,height:48,borderRadius:"50%",border:"2px solid rgba(220,60,60,.3)",
                      borderTopColor:"#dc3c3c",margin:"0 auto 20px",
                      animation:"scan-v 1s linear infinite"}}/>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(220,60,60,.7)",letterSpacing:2}}>
                      Generating with {TIER_INFO[project.tier]?.model} · {TIER_INFO[project.tier]?.maxLabel} max…
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:"center",padding:"40px"}}>
                    <div style={{fontSize:32,marginBottom:16,opacity:.3}}>🎬</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(232,220,200,.3)",letterSpacing:2,lineHeight:1.8}}>
                      Awaiting generation.<br/>Press "Start Production" to begin.
                    </div>
                  </div>
                )}
              </div>

              {/* Scene strip */}
              <div style={{
                borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(4,6,10,.95)",
                padding:"10px 12px",display:"flex",gap:8,overflowX:"auto",
              }}>
                {project.scenes.map((s,i)=>(
                  <div key={i} onClick={()=>setActiveScene(i)} style={{
                    flexShrink:0,width:64,height:40,
                    border:`1px solid ${activeScene===i?"#c8a951":"rgba(255,255,255,.08)"}`,
                    background:activeScene===i?"rgba(200,169,81,.08)":"rgba(255,255,255,.02)",
                    cursor:"pointer",display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",gap:3,transition:"all .2s",
                  }}>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:7,color:activeScene===i?"#c8a951":"rgba(255,255,255,.3)"}}>
                      {String(i+1).padStart(2,"0")}
                    </div>
                    <div style={{width:6,height:6,borderRadius:"50%",
                      background:s.status==="ready"?"#4CAF50":s.status==="generating"?"#dc3c3c":s.status==="error"?"#ff4444":"rgba(255,255,255,.15)"}}/>
                  </div>
                ))}
              </div>

              {/* Playback controls */}
              <div style={{
                padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,.06)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"rgba(4,6,10,.98)",
              }}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <button onClick={()=>setActiveScene(i=>Math.max(0,i-1))} style={{
                    background:"none",border:"none",color:"rgba(232,220,200,.5)",cursor:"pointer",fontSize:14,padding:"4px",
                  }}>⏮</button>
                  <button style={{
                    background:"rgba(200,169,81,.15)",border:"1px solid rgba(200,169,81,.3)",
                    color:"#c8a951",cursor:"pointer",fontSize:14,padding:"6px 10px",borderRadius:2,
                  }}>▶</button>
                  <button onClick={()=>setActiveScene(i=>Math.min(project.scenes.length-1,i+1))} style={{
                    background:"none",border:"none",color:"rgba(232,220,200,.5)",cursor:"pointer",fontSize:14,padding:"4px",
                  }}>⏭</button>
                </div>
                <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"rgba(232,220,200,.25)"}}>
                  {project.style.toUpperCase()} · {project.tier.toUpperCase()} · MAX {TIER_INFO[project.tier]?.maxLabel?.toUpperCase()} · {project.scenes.filter(s=>s.status==="ready").length} READY
                </div>
                <div style={{display:"flex",gap:8}}>
                  {["MP4","MOV","WEBM"].map(f=>(
                    <button key={f} style={{
                      fontFamily:"'Roboto Mono',monospace",fontSize:7,letterSpacing:1,
                      background:"none",border:"1px solid rgba(255,255,255,.08)",
                      color:"rgba(232,220,200,.3)",cursor:"pointer",padding:"3px 7px",
                    }}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
