"use client";
import { useState, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type AssetType = "image" | "video" | "audio";

interface Voice { id:string; name:string; emoji:string; tags:string[]; source:"preset"|"cloned"; createdAt?:string; }
interface StorySegment { id:string; text:string; duration:number; emotion:string; }
interface WorkflowCard { id:string; icon:string; title:string; desc:string; steps:string[]; recommended?:boolean; }

export interface BerylizeConfig {
  script:string; voiceId:string; lipSyncQuality:"natural"|"precise"|"exaggerated";
  style:string; segments:StorySegment[]; language:string; exportPreset:string;
  workflow:string; makeitbang:boolean; bangOptions:string[];
}

export interface BerylizeContext {
  type: AssetType;
  src: string;
  prompt: string;
  id?: string;
}

interface BerylizeModalProps {
  context: BerylizeContext;
  onClose: () => void;
  onBerylize: (config: BerylizeConfig) => void;
  history?: BerylizeContext[];
}

// ── Static data ────────────────────────────────────────────────────────────────
const PRESET_VOICES: Voice[] = [
  { id:"v_kizzy",   name:"Kizzy",   emoji:"👑", tags:["warm","confident","premium"],    source:"preset" },
  { id:"v_eve",     name:"Eve",     emoji:"🤖", tags:["sharp","clear","technical"],      source:"preset" },
  { id:"v_amanda",  name:"Amanda",  emoji:"💼", tags:["corporate","polished","calm"],    source:"preset" },
  { id:"v_india",   name:"India",   emoji:"🌟", tags:["energetic","youthful","bright"],  source:"preset" },
  { id:"v_jessica", name:"Jessica", emoji:"🎯", tags:["strategic","direct","powerful"],  source:"preset" },
  { id:"v_nu",      name:"Nu",      emoji:"💡", tags:["innovative","visionary","bold"],  source:"preset" },
];

const EMOTIONS   = ["Neutral","Confident","Warm","Excited","Serious","Playful","Empathetic","Commanding"];
const STYLES     = ["Professional","Warm & Personal","Energetic","Authoritative","Conversational","Cinematic"];
const LANGUAGES  = ["English","Spanish","French","Mandarin","Arabic","Portuguese","German","Japanese","Korean","Hindi"];
const EXPORT_PRESETS = [
  { id:"instagram", label:"Instagram Reel", icon:"📱", spec:"9:16 · 60s · 1080p" },
  { id:"youtube",   label:"YouTube Short",  icon:"▶",  spec:"9:16 · 60s · 1080p"  },
  { id:"linkedin",  label:"LinkedIn",       icon:"💼", spec:"16:9 · 10min · 1080p" },
  { id:"tiktok",    label:"TikTok",         icon:"🎵", spec:"9:16 · 3min · 1080p"  },
  { id:"web",       label:"Web / Embed",    icon:"🌐", spec:"16:9 · unlimited · 4K" },
  { id:"raw",       label:"Raw Export",     icon:"📁", spec:"Any · unlimited · 4K"  },
];
const BANG_OPTIONS = [
  { id:"camera",   label:"Cinematic camera moves",    icon:"🎬" },
  { id:"music",    label:"Background score",           icon:"🎵" },
  { id:"subtitles",label:"Auto-subtitles (burned in)", icon:"💬" },
  { id:"colorgrd", label:"Cinematic color grade",      icon:"🎨" },
  { id:"kenburns", label:"Ken Burns effect",           icon:"🖼" },
  { id:"lowerthird",label:"Lower-third name card",     icon:"📛" },
];

// Context-aware workflow cards per asset type
const WORKFLOWS: Record<AssetType, WorkflowCard[]> = {
  image: [
    { id:"img_talking", icon:"🗣", title:"Talking Portrait",    desc:"Bring this image to life with voice + lip-sync", steps:["Script","Voice","Lip-sync"], recommended:true },
    { id:"img_reel",    icon:"📱", title:"Social Media Reel",   desc:"8s punchy reel, auto-captions, export-ready",   steps:["Script","Voice","Export"] },
    { id:"img_cinematic",icon:"🎬",title:"Cinematic Scene",     desc:"Cinematic camera + music + color grade",         steps:["Motion","Score","Grade"] },
    { id:"img_combo",   icon:"⚡", title:"Full Combo",           desc:"Image + voice + motion → masterpiece",           steps:["Voice","Motion","Polish"] },
  ],
  video: [
    { id:"vid_voice",   icon:"🎙", title:"Add Voice & Lip-sync", desc:"Perfect lip-sync to your existing video",       steps:["Script","Voice","Sync"], recommended:true },
    { id:"vid_dub",     icon:"🌍", title:"Auto-Dub",             desc:"Translate + re-voice in any of 10 languages",   steps:["Language","Voice","Dub"] },
    { id:"vid_enhance", icon:"✨", title:"Cinematic Enhance",    desc:"Music, color grade, subtitles, name card",       steps:["Score","Grade","Captions"] },
    { id:"vid_dialogue",icon:"💬", title:"Dialogue Version",     desc:"Add multi-character dialogue to your video",     steps:["Cast","Script","Mix"] },
  ],
  audio: [
    { id:"aud_character",icon:"👤",title:"Generate Character",  desc:"Create a face that matches this voice",          steps:["Character","Image","Polish"], recommended:true },
    { id:"aud_talking",  icon:"🗣",title:"Full Talking Head",    desc:"Character image → lip-synced talking video",     steps:["Character","Animate","Export"] },
    { id:"aud_scene",    icon:"🎬",title:"Build Short Film",     desc:"Full scene: character + script + motion + music",steps:["Cast","Scene","Score"] },
    { id:"aud_combo",    icon:"⚡",title:"Voice → Masterpiece",  desc:"One voice. Infinite expression.",                steps:["Image","Motion","Export"] },
  ],
};

// Smart copy per context
const CTX = {
  image: { banner:"You have an Image.", action:"Turn it into a complete talking video.", color:"#3b82f6", icon:"🖼" },
  video: { banner:"You have a Video.",  action:"Add voice + perfect lip-sync.",          color:"#8b5cf6", icon:"▶" },
  audio: { banner:"You have a Voice.",  action:"Generate a character + talking video.",  color:"#22c55e", icon:"🎙" },
};

function uid() { return Math.random().toString(36).slice(2,9); }

// ── Component ──────────────────────────────────────────────────────────────────
export default function BerylizeModal({ context, onClose, onBerylize, history=[] }: BerylizeModalProps) {
  const [phase, setPhase]             = useState<"workflows"|"build">("workflows");
  const [workflow, setWorkflow]       = useState<WorkflowCard | null>(null);
  const [step, setStep]               = useState<1|2|3>(1);
  const [script, setScript]           = useState("");
  const [segments, setSegments]       = useState<StorySegment[]>([]);
  const [storyboard, setStoryboard]   = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]);
  const [clonedVoices, setClonedVoices]   = useState<Voice[]>([]);
  const [ytLink, setYtLink]           = useState("");
  const [ytTimestamp, setYtTimestamp] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [lipSync, setLipSync]         = useState<"natural"|"precise"|"exaggerated">("precise");
  const [style, setStyle]             = useState(STYLES[0]);
  const [language, setLanguage]       = useState(LANGUAGES[0]);
  const [exportPreset, setExportPreset] = useState(EXPORT_PRESETS[0].id);
  const [makeitbang, setMakeitbang]   = useState(false);
  const [bangOpts, setBangOpts]       = useState<string[]>([]);
  const [multiVoice, setMultiVoice]   = useState(false);
  const [autoDub, setAutoDub]         = useState(false);
  const [consistency, setConsistency] = useState(95);
  const [cloneStatus, setCloneStatus] = useState<"idle"|"cloning"|"done">("idle");
  const [dragOver, setDragOver]       = useState(false);
  const [berylizing, setBerylizing]   = useState(false);
  const [berylProgress, setBerylProgress] = useState(0);
  const [berylDone, setBerylDone]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const ctx = CTX[context.type];
  const flows = WORKFLOWS[context.type];

  // Auto-pick recommended workflow
  useEffect(() => {
    const rec = flows.find(f => f.recommended);
    if (rec) setWorkflow(rec);
  }, [context.type]);

  const autoSegment = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.map(s => ({ id:uid(), text:s.trim(), duration:Math.max(2,Math.ceil(s.trim().split(" ").length*.4)), emotion:"Neutral" }));
  };

  const handleCloneYT = () => {
    if (!ytLink.trim()) return;
    setCloneStatus("cloning");
    setTimeout(() => {
      const v: Voice = { id:`v_yt_${uid()}`, name:`YT Clone ${clonedVoices.length+1}`, emoji:"🎬", tags:["youtube","cloned"], source:"cloned", createdAt:new Date().toLocaleDateString() };
      setClonedVoices(p=>[v,...p]); setSelectedVoice(v); setYtLink("");
      setCloneStatus("done"); setTimeout(()=>setCloneStatus("idle"),3000);
    }, 2000);
  };

  const handleAudioUpload = (file: File) => {
    setCloneStatus("cloning");
    setTimeout(() => {
      const v: Voice = { id:`v_up_${uid()}`, name:file.name.replace(/\.[^.]+$/,"").slice(0,22), emoji:"🎙️", tags:["uploaded","cloned"], source:"cloned", createdAt:new Date().toLocaleDateString() };
      setClonedVoices(p=>[v,...p]); setSelectedVoice(v);
      setCloneStatus("done"); setTimeout(()=>setCloneStatus("idle"),3000);
    }, 1800);
  };

  const handleBerylize = () => {
    if (!script.trim() && context.type !== "video") return;
    setBerylizing(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 100) {
        clearInterval(iv); p = 100; setBerylDone(true); setBerylizing(false);
      }
      setBerylProgress(Math.min(p,100));
    }, 200);
    onBerylize({ script, voiceId:selectedVoice.id, lipSyncQuality:lipSync, style, segments, language, exportPreset, workflow:workflow?.id||"", makeitbang, bangOptions:bangOpts });
  };

  const allVoices = [...clonedVoices,...PRESET_VOICES].filter(v=>
    !voiceSearch || v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.tags.some(t=>t.includes(voiceSearch.toLowerCase()))
  );

  const stepLabels = context.type==="video"
    ? ["","Voice & Script","Style & Lip-sync","Export & Polish"]
    : context.type==="audio"
    ? ["","Script & Story","Character & Voice","Export & Polish"]
    : ["","Script & Story","Voice & Sound","Style & Export"];

  const canProceed = step===1 ? (script.trim().length>0||context.type==="video") : true;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <style>{`
        .bm{transition:all .15s ease;cursor:pointer;border:none;outline:none}
        .bm:hover{opacity:.85}
        .bm-voice:hover{border-color:#3b82f6!important;background:#13131f!important}
        .bm-voice{transition:all .15s ease;cursor:pointer}
        .bm-flow:hover{border-color:${ctx.color}!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
        .bm-flow{transition:all .2s ease;cursor:pointer}
        .bm-export:hover{border-color:#c8a951!important}
        .bm-export{transition:all .15s ease;cursor:pointer}
        .bm-bang:hover{border-color:#f59e0b!important;background:rgba(245,158,11,.12)!important}
        .bm-bang{transition:all .15s ease;cursor:pointer}
        .bm-inp:focus{outline:none;border-color:#3b82f6!important}
        .bm-inp{transition:border-color .15s ease}
        @keyframes bm-prog{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .bm-prog-bar{background:linear-gradient(90deg,#c8a951,#f5e070,#8b5cf6,#c8a951);background-size:300% 100%;animation:bm-prog 2s linear infinite}
        @keyframes bm-pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,81,.5)}50%{box-shadow:0 0 0 12px rgba(200,169,81,0)}}
        .bm-pulse{animation:bm-pulse 1.8s infinite}
        @keyframes bm-spin{to{transform:rotate(360deg)}}
        .bm-spin{animation:bm-spin 1s linear infinite}
        @keyframes bm-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .bm-in{animation:bm-in .22s ease}
        @keyframes bm-bang{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        .bm-bang-ani{animation:bm-bang 2s ease-in-out infinite}
      `}</style>

      <div style={{background:"#111118",borderRadius:20,border:"1px solid #1e1e2a",width:"100%",maxWidth:1020,maxHeight:"94vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,.9)"}}>

        {/* ── SMART CONTEXT BANNER ── */}
        <div style={{background:`linear-gradient(135deg,rgba(${context.type==="image"?"59,130,246":context.type==="video"?"139,92,246":"34,197,94"},.18),rgba(0,0,0,.4))`,borderBottom:"1px solid #1e1e2a",padding:"14px 24px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:12,background:`rgba(${context.type==="image"?"59,130,246":context.type==="video"?"139,92,246":"34,197,94"},.25)`,border:`1px solid ${ctx.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {ctx.icon}
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:ctx.color,letterSpacing:1,textTransform:"uppercase"}}>✨ Berylize It!</span>
                  <span style={{fontSize:10,background:ctx.color+"22",color:ctx.color,borderRadius:4,padding:"1px 8px",border:`1px solid ${ctx.color}44`}}>AI-Powered</span>
                </div>
                <div style={{fontSize:14,color:"#e8e8e8",fontWeight:600,marginTop:1}}>
                  <span style={{color:ctx.color}}>{ctx.banner}</span> {ctx.action}
                </div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {history.length>0 && (
                <button className="bm" onClick={()=>setShowHistory(h=>!h)} style={{background:"#1a1a24",border:"1px solid #2a2a3a",borderRadius:8,color:"#666",padding:"6px 12px",fontSize:11}}>
                  🕐 History ({history.length})
                </button>
              )}
              <button className="bm" onClick={onClose} style={{background:"#1a1a24",border:"1px solid #2a2a3a",borderRadius:8,color:"#666",width:32,height:32,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
        </div>

        {/* ── HISTORY PANEL (slide-in) ── */}
        {showHistory && (
          <div style={{background:"#0e0e16",borderBottom:"1px solid #1e1e2a",padding:"12px 24px",flexShrink:0}}>
            <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Recent Berylized Projects — click to remix</div>
            <div style={{display:"flex",gap:10,overflow:"auto",paddingBottom:4}}>
              {history.map((h,i)=>(
                <div key={i} className="bm" style={{flexShrink:0,background:"#151520",border:"1px solid #1e1e2a",borderRadius:10,overflow:"hidden",width:64}} title={h.prompt}>
                  <div style={{width:64,height:64,background:"#0c0c0f",overflow:"hidden"}}>
                    {h.type==="image"
                      ? <img src={h.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{h.type==="video"?"▶":"🎙"}</div>
                    }
                  </div>
                  <div style={{padding:"4px 6px",fontSize:8,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.prompt.slice(0,20)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

          {/* ─────────────── PHASE 1: WORKFLOW PICKER ─────────────── */}
          {phase==="workflows" && (
            <div className="bm-in" style={{flex:1,overflow:"auto",padding:24,display:"flex",gap:20}}>

              {/* Left: asset preview */}
              <div style={{width:180,flexShrink:0}}>
                <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Your {context.type}</div>
                <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${ctx.color}33`,background:"#0e0e16",aspectRatio:"3/4",position:"relative"}}>
                  {context.type==="image"
                    ? <img src={context.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                    : context.type==="video"
                    ? <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0c0c0f",flexDirection:"column",gap:8}}>
                        <div style={{width:48,height:48,borderRadius:"50%",background:`${ctx.color}22`,border:`1px solid ${ctx.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>▶</div>
                        <div style={{fontSize:10,color:"#555"}}>Video Asset</div>
                      </div>
                    : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0e0e16,#151520)",flexDirection:"column",gap:8}}>
                        <div style={{width:56,height:56,borderRadius:"50%",background:`${ctx.color}22`,border:`1px solid ${ctx.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🎙</div>
                        <div style={{fontSize:10,color:"#555"}}>Audio Asset</div>
                      </div>
                  }
                  <div style={{position:"absolute",top:6,left:6,background:ctx.color,borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#fff",textTransform:"uppercase"}}>{context.type}</div>
                </div>
                {context.prompt && (
                  <div style={{fontSize:9,color:"#444",lineHeight:1.5,marginTop:8,fontStyle:"italic"}}>"{context.prompt.slice(0,70)}{context.prompt.length>70?"...":""}"</div>
                )}

                {/* Consistency meter */}
                <div style={{background:"#0e0e16",borderRadius:10,border:"1px solid #1e1e2a",padding:"10px 12px",marginTop:12}}>
                  <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Character Lock</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:5,background:"#1a1a24",borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${consistency}%`,height:"100%",background:"linear-gradient(90deg,#22c55e,#4ade80)",borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:"#22c55e"}}>{consistency}%</span>
                  </div>
                  <div style={{fontSize:9,color:"#444",marginTop:4}}>Beryl LLM reference lock</div>
                  <input type="range" min={60} max={100} value={consistency} onChange={e=>setConsistency(+e.target.value)} style={{width:"100%",marginTop:6,accentColor:"#3b82f6",cursor:"pointer"}}/>
                </div>
              </div>

              {/* Right: workflow cards */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"#e8e8e8",marginBottom:4}}>Recommended Workflows</div>
                <div style={{fontSize:11,color:"#555",marginBottom:16}}>Choose how you want to transform your {context.type}. One click to begin.</div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                  {flows.map(f=>(
                    <div key={f.id} className="bm-flow" onClick={()=>setWorkflow(f)} style={{
                      background:workflow?.id===f.id?`${ctx.color}14`:"#151520",
                      border:`2px solid ${workflow?.id===f.id?ctx.color:"#1e1e2a"}`,
                      borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden",
                    }}>
                      {f.recommended && <div style={{position:"absolute",top:8,right:8,fontSize:8,background:`${ctx.color}22`,color:ctx.color,borderRadius:3,padding:"2px 6px",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>⭐ Recommended</div>}
                      <div style={{fontSize:28,marginBottom:8}}>{f.icon}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#e8e8e8",marginBottom:4}}>{f.title}</div>
                      <div style={{fontSize:11,color:"#777",lineHeight:1.5,marginBottom:10}}>{f.desc}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        {f.steps.map((s,i)=>(
                          <div key={s} style={{display:"flex",alignItems:"center",gap:4}}>
                            <span style={{fontSize:9,color:workflow?.id===f.id?ctx.color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{s}</span>
                            {i<f.steps.length-1 && <span style={{fontSize:9,color:"#333"}}>→</span>}
                          </div>
                        ))}
                      </div>
                      {workflow?.id===f.id && (
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${ctx.color},${ctx.color}88,${ctx.color})`}}/>
                      )}
                    </div>
                  ))}
                </div>

                {/* Make It Bang toggle */}
                <div style={{background:"linear-gradient(135deg,#1a1200,#201800)",border:"1px solid #f59e0b33",borderRadius:14,padding:"14px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:makeitbang?14:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}} className={makeitbang?"bm-bang-ani":""}>💥</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>Make It Bang</div>
                        <div style={{fontSize:10,color:"#78570a"}}>Add cinematic enhancements that make every second hit harder</div>
                      </div>
                    </div>
                    <div onClick={()=>setMakeitbang(v=>!v)} style={{width:40,height:22,borderRadius:11,background:makeitbang?"#f59e0b":"#1a1a24",border:`1px solid ${makeitbang?"#f59e0b":"#2a2a3a"}`,position:"relative",transition:"all .2s",cursor:"pointer",flexShrink:0}}>
                      <div style={{position:"absolute",top:3,left:makeitbang?20:3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                    </div>
                  </div>
                  {makeitbang && (
                    <div className="bm-in" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                      {BANG_OPTIONS.map(o=>(
                        <div key={o.id} className="bm-bang" onClick={()=>setBangOpts(p=>p.includes(o.id)?p.filter(x=>x!==o.id):[...p,o.id])} style={{
                          background:bangOpts.includes(o.id)?"rgba(245,158,11,.15)":"rgba(255,255,255,.03)",
                          border:`1px solid ${bangOpts.includes(o.id)?"#f59e0b":"#2a2a3a"}`,
                          borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,
                        }}>
                          <span style={{fontSize:14}}>{o.icon}</span>
                          <span style={{fontSize:10,color:bangOpts.includes(o.id)?"#f59e0b":"#666",lineHeight:1.3}}>{o.label}</span>
                          {bangOpts.includes(o.id) && <span style={{marginLeft:"auto",fontSize:10,color:"#f59e0b"}}>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── PHASE 2: BUILD FLOW ─────────────── */}
          {phase==="build" && (
            <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              {/* Step bar */}
              <div style={{padding:"14px 24px 0",flexShrink:0,borderBottom:"1px solid #1e1e2a"}}>
                <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
                  <button className="bm" onClick={()=>setPhase("workflows")} style={{background:"none",color:"#555",fontSize:12,padding:0,display:"flex",alignItems:"center",gap:4}}>
                    ← Workflows
                  </button>
                  {workflow && <span style={{marginLeft:12,fontSize:12,color:ctx.color,fontWeight:600}}>✦ {workflow.title}</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  {[1,2,3].map((s,i)=>(
                    <div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:0}}>
                      <div onClick={()=>!berylizing&&setStep(s as 1|2|3)} style={{
                        display:"flex",alignItems:"center",gap:7,cursor:"pointer",padding:"6px 12px",borderRadius:8,
                        background:step===s?`${ctx.color}18`:"transparent",border:`1px solid ${step===s?ctx.color+"44":"transparent"}`,flexShrink:0,
                      }}>
                        <div style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,
                          background:step>s?"#22c55e":step===s?ctx.color:"#1a1a24",color:"#fff",border:`1px solid ${step>s?"#22c55e":step===s?ctx.color:"#2a2a3a"}`,
                        }}>{step>s?"✓":s}</div>
                        <span style={{fontSize:11,fontWeight:step===s?600:400,color:step===s?"#d8d8d8":"#555"}}>{stepLabels[s]}</span>
                      </div>
                      {i<2 && <div style={{flex:1,height:1,background:step>s?"#22c55e":"#1e1e2a",margin:"0 4px"}}/>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{flex:1,overflow:"auto",padding:24,display:"flex",gap:24}}>
                {/* Left: preview */}
                <div style={{width:160,flexShrink:0}}>
                  <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Your {context.type}</div>
                  <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${ctx.color}33`,background:"#0e0e16",aspectRatio:"3/4"}}>
                    {context.type==="image"
                      ? <img src={context.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{context.type==="video"?"▶":"🎙"}</div>
                    }
                  </div>
                  {/* Mini consistency */}
                  <div style={{marginTop:10,background:"#0e0e16",borderRadius:8,border:"1px solid #1e1e2a",padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:"#555",marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>Character Lock</div>
                    <div style={{height:4,background:"#1a1a24",borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${consistency}%`,height:"100%",background:"linear-gradient(90deg,#22c55e,#4ade80)",borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:9,color:"#22c55e",marginTop:3,textAlign:"right"}}>{consistency}%</div>
                  </div>
                </div>

                {/* Right: step content */}
                <div style={{flex:1,minWidth:0}}>

                  {/* STEP 1 */}
                  {step===1 && (
                    <div className="bm-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e8e8e8"}}>
                          {context.type==="video" ? "🎙️ What should she say?" : context.type==="audio" ? "📖 Write your story" : "✍️ What should she say?"}
                        </div>
                        <div style={{fontSize:11,color:"#555",marginTop:2}}>
                          {context.type==="video" ? "Add a voice script to your video — timing handled automatically." : "Write the script. We handle timing, pacing, and emotion."}
                        </div>
                      </div>

                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{fontSize:11,color:"#888"}}>Storyboard mode</div>
                        <div onClick={()=>{setStoryboard(v=>!v);if(!storyboard&&script)setSegments(autoSegment(script));}}
                          style={{width:36,height:20,borderRadius:10,background:storyboard?ctx.color:"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"all .2s",cursor:"pointer"}}>
                          <div style={{position:"absolute",top:2,left:storyboard?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                        </div>
                      </div>

                      <textarea className="bm-inp" value={script} onChange={e=>{setScript(e.target.value);if(storyboard)setSegments(autoSegment(e.target.value));}}
                        placeholder={context.type==="video"
                          ? "Write the narration for this video...\n\nExample: 'Welcome to the future of AI. What you're seeing is real — and it's just the beginning...'"
                          : "Write your script here...\n\nExample: 'Welcome to Beryl, where the future of AI meets human creativity...'"
                        }
                        style={{width:"100%",minHeight:140,background:"#151520",border:"1px solid #222",borderRadius:10,color:"#d8d8d8",fontSize:13,lineHeight:1.7,padding:"12px 14px",resize:"vertical",fontFamily:"inherit"}}
                      />

                      {script.length>0 && (
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span style={{background:"#0e1624",border:"1px solid #1e3a5f",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#60a5fa"}}>~{Math.ceil(script.split(" ").length*.4)}s duration</span>
                          <span style={{background:"#0e0e16",border:"1px solid #1e1e2a",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#555"}}>{script.split(" ").filter(Boolean).length} words</span>
                        </div>
                      )}

                      {storyboard && segments.length>0 && (
                        <div>
                          <div style={{fontSize:11,color:"#888",marginBottom:8}}>📋 Segments ({segments.length})</div>
                          <div style={{maxHeight:180,overflow:"auto",display:"flex",flexDirection:"column",gap:6}}>
                            {segments.map((seg,i)=>(
                              <div key={seg.id} style={{display:"flex",gap:10,background:"#151520",borderRadius:8,padding:"9px 12px",border:"1px solid #1e1e2a",alignItems:"flex-start"}}>
                                <div style={{width:22,height:22,borderRadius:"50%",background:`${ctx.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:ctx.color,fontWeight:700,flexShrink:0}}>{i+1}</div>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:12,color:"#d8d8d8",lineHeight:1.5}}>{seg.text}</div>
                                  <div style={{display:"flex",gap:8,marginTop:4}}>
                                    <span style={{fontSize:10,color:"#555"}}>~{seg.duration}s</span>
                                    <select value={seg.emotion} onChange={e=>setSegments(p=>p.map(s=>s.id===seg.id?{...s,emotion:e.target.value}:s))}
                                      style={{fontSize:10,background:"#1a1a24",border:"1px solid #222",borderRadius:4,color:"#888",padding:"1px 4px"}}>
                                      {EMOTIONS.map(em=><option key={em}>{em}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{display:"flex",alignItems:"center",gap:10,background:"#151520",borderRadius:10,padding:"10px 14px",border:"1px solid #1e1e2a"}}>
                        <span>🎭</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:500,color:"#d8d8d8"}}>Multi-Voice Casting</div>
                          <div style={{fontSize:10,color:"#555"}}>Different voices for different speakers</div>
                        </div>
                        <div onClick={()=>setMultiVoice(v=>!v)} style={{width:36,height:20,borderRadius:10,background:multiVoice?ctx.color:"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"all .2s",cursor:"pointer"}}>
                          <div style={{position:"absolute",top:2,left:multiVoice?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                        </div>
                      </div>

                      {context.type==="audio" && (
                        <div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:10,padding:"12px 14px",display:"flex",gap:10}}>
                          <span style={{fontSize:18}}>💡</span>
                          <div style={{fontSize:11,color:"#4a7a4a",lineHeight:1.5}}>Since you&apos;re starting from audio, Beryl will generate a matching photorealistic character first, then animate it with your voice and script.</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step===2 && (
                    <div className="bm-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e8e8e8"}}>🎙️ Choose Her Voice</div>
                        <div style={{fontSize:11,color:"#555",marginTop:2}}>Pick from the Beryl library or clone any voice in seconds.</div>
                      </div>

                      <input className="bm-inp" value={voiceSearch} onChange={e=>setVoiceSearch(e.target.value)}
                        placeholder="🔍  Search voices — warm, sharp, energetic, corporate..."
                        style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:8,color:"#d8d8d8",fontSize:12,padding:"8px 12px",fontFamily:"inherit"}}/>

                      {clonedVoices.length>0 && (
                        <div>
                          <div style={{fontSize:10,color:"#c8a951",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>⭐ Your Cloned Voices</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            {clonedVoices.filter(v=>!voiceSearch||v.name.toLowerCase().includes(voiceSearch.toLowerCase())).map(v=>(
                              <VoiceCard key={v.id} voice={v} selected={selectedVoice.id===v.id} onSelect={()=>setSelectedVoice(v)} color={ctx.color}/>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Beryl Voice Library</div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {allVoices.filter(v=>v.source==="preset").map(v=>(
                            <VoiceCard key={v.id} voice={v} selected={selectedVoice.id===v.id} onSelect={()=>setSelectedVoice(v)} color={ctx.color}/>
                          ))}
                        </div>
                      </div>

                      <div style={{height:1,background:"#1e1e2a"}}/>
                      <div style={{fontSize:13,fontWeight:600,color:"#e8e8e8"}}>⚡ Quick Voice Clone</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
                          onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleAudioUpload(f);}}
                          onClick={()=>audioRef.current?.click()}
                          style={{background:dragOver?"rgba(59,130,246,.1)":"#0e0e16",border:`2px dashed ${dragOver?"#3b82f6":"#222"}`,borderRadius:12,padding:"18px 14px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                          <div style={{fontSize:26,marginBottom:6}}>🎙️</div>
                          <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8",marginBottom:3}}>Upload Audio</div>
                          <div style={{fontSize:10,color:"#444"}}>mp3, wav, m4a · even 10s works</div>
                          <input ref={audioRef} type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleAudioUpload(f);}}/>
                        </div>
                        <div style={{background:"#0e0e16",border:"1px solid #1e1e2a",borderRadius:12,padding:"14px"}}>
                          <div style={{fontSize:22,marginBottom:6,textAlign:"center"}}>🎬</div>
                          <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8",marginBottom:8,textAlign:"center"}}>Clone from YouTube</div>
                          <input className="bm-inp" value={ytLink} onChange={e=>setYtLink(e.target.value)} placeholder="Paste YouTube URL..."
                            style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:11,padding:"6px 10px",fontFamily:"inherit",marginBottom:5}}/>
                          <input className="bm-inp" value={ytTimestamp} onChange={e=>setYtTimestamp(e.target.value)} placeholder="Timestamp e.g. 3:45 (optional)"
                            style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:11,padding:"6px 10px",fontFamily:"inherit",marginBottom:8}}/>
                          <button className="bm" onClick={handleCloneYT} disabled={!ytLink||cloneStatus==="cloning"}
                            style={{width:"100%",padding:"7px",borderRadius:7,background:ytLink?"#3b82f6":"#1a1a24",color:ytLink?"#fff":"#444",fontSize:11,fontWeight:600}}>
                            {cloneStatus==="cloning"?"⏳ Cloning...":"Clone Voice"}
                          </button>
                        </div>
                      </div>
                      {cloneStatus==="cloning" && <div style={{display:"flex",alignItems:"center",gap:10,background:"#0a1a2f",border:"1px solid #1e3a5f",borderRadius:8,padding:"9px 14px"}}>
                        <div className="bm-spin" style={{width:14,height:14,border:"2px solid #3b82f6",borderTopColor:"transparent",borderRadius:"50%"}}/>
                        <span style={{fontSize:12,color:"#60a5fa"}}>Analyzing vocal patterns...</span>
                      </div>}
                      {cloneStatus==="done" && <div style={{display:"flex",alignItems:"center",gap:10,background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:8,padding:"9px 14px"}}>
                        <span>✅</span><span style={{fontSize:12,color:"#4ade80"}}>Voice cloned! Auto-saved to your library.</span>
                      </div>}

                      <div style={{display:"flex",alignItems:"center",gap:10,background:"#151520",borderRadius:10,padding:"10px 14px",border:"1px solid #1e1e2a"}}>
                        <span>🌍</span>
                        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500,color:"#d8d8d8"}}>Auto-Dub to Another Language</div><div style={{fontSize:10,color:"#555"}}>Translate + re-voice automatically</div></div>
                        <div onClick={()=>setAutoDub(v=>!v)} style={{width:36,height:20,borderRadius:10,background:autoDub?ctx.color:"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"all .2s",cursor:"pointer"}}>
                          <div style={{position:"absolute",top:2,left:autoDub?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                        </div>
                      </div>
                      {autoDub && <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {LANGUAGES.map(l=>(
                          <button key={l} className="bm" onClick={()=>setLanguage(l)} style={{padding:"4px 12px",borderRadius:6,fontSize:11,background:language===l?ctx.color:"#1a1a24",color:language===l?"#fff":"#555",border:`1px solid ${language===l?ctx.color:"#222"}`}}>{l}</button>
                        ))}
                      </div>}
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step===3 && (
                    <div className="bm-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e8e8e8"}}>🎨 Style & Export</div>
                        <div style={{fontSize:11,color:"#555",marginTop:2}}>Final polish before we make your masterpiece.</div>
                      </div>

                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Lip-Sync Quality</div>
                        <div style={{display:"flex",gap:8}}>
                          {(["natural","precise","exaggerated"] as const).map(q=>(
                            <button key={q} className="bm" onClick={()=>setLipSync(q)} style={{flex:1,padding:"9px 6px",borderRadius:8,fontSize:11,fontWeight:500,
                              background:lipSync===q?`${ctx.color}18`:"#151520",border:`1px solid ${lipSync===q?ctx.color:"#222"}`,color:lipSync===q?ctx.color:"#555"}}>
                              <div style={{fontSize:16,marginBottom:3}}>{q==="natural"?"🌊":q==="precise"?"🎯":"💥"}</div>
                              <div style={{textTransform:"capitalize"}}>{q}</div>
                              <div style={{fontSize:9,color:"#444",marginTop:2}}>{q==="natural"?"Realistic flow":q==="precise"?"Perfect sync":"Dramatic"}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Delivery Style</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {STYLES.map(s=>(
                            <button key={s} className="bm" onClick={()=>setStyle(s)} style={{padding:"5px 12px",borderRadius:6,fontSize:11,background:style===s?`${ctx.color}18`:"#151520",border:`1px solid ${style===s?ctx.color:"#222"}`,color:style===s?ctx.color:"#555"}}>{s}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Export Preset</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                          {EXPORT_PRESETS.map(p=>(
                            <div key={p.id} className="bm-export" onClick={()=>setExportPreset(p.id)} style={{background:exportPreset===p.id?"rgba(200,169,81,.1)":"#151520",border:`1px solid ${exportPreset===p.id?"#c8a951":"#1e1e2a"}`,borderRadius:8,padding:"10px",cursor:"pointer"}}>
                              <div style={{fontSize:16,marginBottom:3}}>{p.icon}</div>
                              <div style={{fontSize:11,fontWeight:600,color:"#d8d8d8"}}>{p.label}</div>
                              <div style={{fontSize:9,color:"#444",marginTop:1}}>{p.spec}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Make It Bang summary */}
                      {makeitbang && bangOpts.length>0 && (
                        <div style={{background:"linear-gradient(135deg,#1a1200,#201800)",border:"1px solid #f59e0b44",borderRadius:10,padding:"12px 14px"}}>
                          <div style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginBottom:8}}>💥 Make It Bang — {bangOpts.length} enhancement{bangOpts.length>1?"s":""} active</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {bangOpts.map(id=>{const o=BANG_OPTIONS.find(b=>b.id===id)!;return (
                              <span key={id} style={{fontSize:10,background:"rgba(245,158,11,.15)",border:"1px solid #f59e0b44",borderRadius:5,padding:"3px 9px",color:"#f59e0b"}}>{o.icon} {o.label}</span>
                            );})}
                          </div>
                        </div>
                      )}

                      {/* Batch option */}
                      <div style={{display:"flex",alignItems:"center",gap:10,background:"#151520",borderRadius:10,padding:"10px 14px",border:"1px solid #1e1e2a"}}>
                        <span style={{fontSize:16}}>⚡</span>
                        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500,color:"#d8d8d8"}}>Batch Berylize</div><div style={{fontSize:10,color:"#555"}}>Apply this exact workflow to all items in your gallery</div></div>
                        <input type="checkbox" style={{accentColor:ctx.color,width:14,height:14}}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{padding:"12px 24px",borderTop:"1px solid #1e1e2a",background:"#0e0e16",flexShrink:0}}>
          {berylizing && (
            <div style={{marginBottom:10}}>
              <div style={{height:5,background:"#1a1a24",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div className="bm-prog-bar" style={{height:"100%",width:`${berylProgress}%`,transition:"width .3s ease",borderRadius:3}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:"#c8a951"}}>
                  ✨ {berylProgress<30?"Generating voice...":berylProgress<60?"Syncing lips...":berylProgress<85?"Applying motion...":"Rendering final output..."}
                </span>
                <span style={{fontSize:11,color:"#555"}}>{Math.round(berylProgress)}%</span>
              </div>
            </div>
          )}
          {berylDone && (
            <div style={{marginBottom:10,background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🎉</span>
              <span style={{fontSize:13,color:"#4ade80",fontWeight:500}}>Your masterpiece is ready! Check the gallery.</span>
              <button className="bm" onClick={onClose} style={{marginLeft:"auto",background:"#22c55e",color:"#fff",borderRadius:6,padding:"5px 14px",fontSize:11,fontWeight:600}}>View Result →</button>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {phase==="build" && step>1 && !berylDone && (
              <button className="bm" onClick={()=>setStep(s=>(s-1) as 1|2|3)} style={{padding:"10px 18px",borderRadius:10,background:"#1a1a24",border:"1px solid #2a2a3a",color:"#888",fontSize:13}}>← Back</button>
            )}

            <div style={{flex:1}}/>

            {!berylDone && phase==="workflows" && (
              <button className="bm" onClick={()=>setPhase("build")} style={{
                padding:"12px 36px",borderRadius:10,fontSize:13,fontWeight:700,
                background:`linear-gradient(135deg,${ctx.color},${ctx.color}cc)`,color:"#fff",
                boxShadow:`0 4px 20px ${ctx.color}55`,
              }}>
                Continue with {workflow?.title||"this workflow"} →
              </button>
            )}

            {!berylDone && phase==="build" && (
              <>
                {step<3
                  ? <button className="bm" onClick={()=>setStep(s=>(s+1) as 1|2|3)} disabled={!canProceed} style={{
                      padding:"11px 28px",borderRadius:10,background:canProceed?ctx.color:"#1a1a24",color:canProceed?"#fff":"#444",fontSize:13,fontWeight:600,
                      boxShadow:canProceed?`0 4px 16px ${ctx.color}44`:"none",
                    }}>Continue →</button>
                  : <button className={`bm${berylizing?" bm-pulse":""}`} onClick={handleBerylize} disabled={berylizing} style={{
                      padding:"12px 36px",borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:.3,
                      background:"linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",backgroundSize:"200% auto",color:"#0c0c0f",
                      boxShadow:"0 4px 28px rgba(200,169,81,.6)",
                    }}>
                      {berylizing?"✨ Berylizing...":"✨ Generate Final Masterpiece"}
                    </button>
                }
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceCard({ voice, selected, onSelect, color }: { voice:Voice; selected:boolean; onSelect:()=>void; color:string }) {
  return (
    <div className="bm-voice" onClick={onSelect} style={{background:selected?`${color}12`:"#151520",border:`1px solid ${selected?color:"#222"}`,borderRadius:10,padding:"10px 14px",minWidth:100,textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:4}}>{voice.emoji}</div>
      <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8"}}>{voice.name}</div>
      {voice.source==="cloned" && <div style={{fontSize:9,color:"#c8a951",marginTop:2}}>✦ Cloned</div>}
      <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
        {voice.tags.slice(0,2).map(t=><span key={t} style={{fontSize:8,background:"#1a1a24",borderRadius:3,padding:"1px 5px",color:"#444"}}>{t}</span>)}
      </div>
      {selected && <div style={{fontSize:9,color,marginTop:4,fontWeight:600}}>✓ Selected</div>}
    </div>
  );
}
