"use client";
import { useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Voice {
  id: string;
  name: string;
  emoji: string;
  tags: string[];
  source: "preset" | "cloned";
  createdAt?: string;
}

interface StorySegment {
  id: string;
  text: string;
  duration: number; // seconds
  emotion: string;
}

interface BerylizeModalProps {
  image: string;
  prompt: string;
  onClose: () => void;
  onBerylize: (config: BerylizeConfig) => void;
}

export interface BerylizeConfig {
  script: string;
  voiceId: string;
  lipSyncQuality: "natural" | "precise" | "exaggerated";
  style: string;
  segments: StorySegment[];
  language: string;
  exportPreset: string;
}

// ── Preset voice library ───────────────────────────────────────────────────
const PRESET_VOICES: Voice[] = [
  { id:"v_kizzy",   name:"Kizzy",   emoji:"👑", tags:["warm","confident","professional"], source:"preset" },
  { id:"v_eve",     name:"Eve",     emoji:"🤖", tags:["sharp","clear","technical"],       source:"preset" },
  { id:"v_amanda",  name:"Amanda",  emoji:"💼", tags:["corporate","polished","calm"],     source:"preset" },
  { id:"v_india",   name:"India",   emoji:"🌟", tags:["energetic","youthful","bright"],   source:"preset" },
  { id:"v_jessica", name:"Jessica", emoji:"🎯", tags:["strategic","direct","powerful"],   source:"preset" },
];

const EMOTIONS = ["Neutral","Confident","Warm","Excited","Serious","Playful","Empathetic","Commanding"];
const STYLES   = ["Professional","Warm & Personal","Energetic","Authoritative","Conversational","Cinematic"];
const LANGUAGES = ["English","Spanish","French","Mandarin","Arabic","Portuguese","German","Japanese"];
const EXPORT_PRESETS = [
  { id:"instagram", label:"Instagram Reel", icon:"📱", spec:"9:16 · 60s max · 1080p" },
  { id:"youtube",   label:"YouTube Short",  icon:"▶",  spec:"9:16 · 60s · 1080p" },
  { id:"linkedin",  label:"LinkedIn",       icon:"💼", spec:"16:9 · 10min · 1080p" },
  { id:"tiktok",    label:"TikTok",         icon:"🎵", spec:"9:16 · 3min · 1080p" },
  { id:"web",       label:"Web / Embed",    icon:"🌐", spec:"16:9 · unlimited · 4K" },
  { id:"raw",       label:"Raw Export",     icon:"📁", spec:"Any ratio · unlimited · 4K" },
];

function uid() { return Math.random().toString(36).slice(2,9); }

// ── Component ──────────────────────────────────────────────────────────────
export default function BerylizeModal({ image, prompt, onClose, onBerylize }: BerylizeModalProps) {
  const [step, setStep]                   = useState<1|2|3>(1);
  const [script, setScript]               = useState("");
  const [segments, setSegments]           = useState<StorySegment[]>([]);
  const [storyboardMode, setStoryboardMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]);
  const [clonedVoices, setClonedVoices]   = useState<Voice[]>([]);
  const [ytLink, setYtLink]               = useState("");
  const [ytTimestamp, setYtTimestamp]     = useState("");
  const [voiceSearch, setVoiceSearch]     = useState("");
  const [lipSync, setLipSync]             = useState<"natural"|"precise"|"exaggerated">("precise");
  const [style, setStyle]                 = useState(STYLES[0]);
  const [language, setLanguage]           = useState(LANGUAGES[0]);
  const [exportPreset, setExportPreset]   = useState(EXPORT_PRESETS[0].id);
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [multiVoice, setMultiVoice]       = useState(false);
  const [autoDub, setAutoDub]             = useState(false);
  const [consistency, setConsistency]     = useState(95);
  const [cloneStatus, setCloneStatus]     = useState<"idle"|"cloning"|"done">("idle");
  const [berylizing, setBerylizing]       = useState(false);
  const [berylProgress, setBerylProgress] = useState(0);
  const [berylDone, setBerylDone]         = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Auto-segment script
  const autoSegment = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.map(s => ({
      id: uid(),
      text: s.trim(),
      duration: Math.max(2, Math.ceil(s.trim().split(" ").length * 0.4)),
      emotion: "Neutral",
    }));
  };

  const handleScriptChange = (val: string) => {
    setScript(val);
    if (storyboardMode) setSegments(autoSegment(val));
  };

  const handleCloneYoutube = () => {
    if (!ytLink.trim()) return;
    setCloneStatus("cloning");
    setTimeout(() => {
      const newVoice: Voice = {
        id: `v_yt_${uid()}`,
        name: `YT Clone ${clonedVoices.length+1}`,
        emoji: "🎬",
        tags: ["youtube","cloned","custom"],
        source: "cloned",
        createdAt: new Date().toLocaleDateString(),
      };
      setClonedVoices(prev => [newVoice, ...prev]);
      setSelectedVoice(newVoice);
      setCloneStatus("done");
      setYtLink("");
      setTimeout(() => setCloneStatus("idle"), 3000);
    }, 2000);
  };

  const handleAudioUpload = (file: File) => {
    setCloneStatus("cloning");
    setTimeout(() => {
      const newVoice: Voice = {
        id: `v_up_${uid()}`,
        name: file.name.replace(/\.[^.]+$/,"").slice(0,22),
        emoji: "🎙️",
        tags: ["uploaded","cloned","custom"],
        source: "cloned",
        createdAt: new Date().toLocaleDateString(),
      };
      setClonedVoices(prev => [newVoice, ...prev]);
      setSelectedVoice(newVoice);
      setCloneStatus("done");
      setTimeout(() => setCloneStatus("idle"), 3000);
    }, 1800);
  };

  const handleBerylize = () => {
    if (!script.trim()) return;
    setBerylizing(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setBerylDone(true);
        setBerylizing(false);
      }
      setBerylProgress(Math.min(p, 100));
    }, 220);
    onBerylize({ script, voiceId: selectedVoice.id, lipSyncQuality: lipSync, style, segments, language, exportPreset });
  };

  const allVoices = [...clonedVoices, ...PRESET_VOICES].filter(v =>
    !voiceSearch || v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    v.tags.some(t => t.includes(voiceSearch.toLowerCase()))
  );

  const stepLabel = ["", "Script & Story", "Voice & Sound", "Style & Export"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <style>{`
        .bm-btn{transition:all .15s ease;cursor:pointer;border:none;outline:none}
        .bm-btn:hover{opacity:.85}
        .bm-voice:hover{border-color:#3b82f6!important;background:#13131f!important}
        .bm-voice{transition:all .15s ease;cursor:pointer}
        .bm-export:hover{border-color:#c8a951!important}
        .bm-export{transition:all .15s ease;cursor:pointer}
        .bm-inp:focus{outline:none;border-color:#3b82f6!important}
        .bm-inp{transition:border-color .15s ease}
        .bm-progress{transition:width .3s ease}
        @keyframes bm-pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,81,.5)}50%{box-shadow:0 0 0 10px rgba(200,169,81,0)}}
        .bm-pulse{animation:bm-pulse 1.8s ease-in-out infinite}
        @keyframes bm-spin{to{transform:rotate(360deg)}}
        .bm-spin{animation:bm-spin 1s linear infinite}
        @keyframes bm-slide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .bm-slide{animation:bm-slide .25s ease}
        .bm-drop{transition:all .2s ease}
      `}</style>

      <div style={{
        background:"#111118",borderRadius:20,border:"1px solid #1e1e2a",
        width:"100%",maxWidth:960,maxHeight:"92vh",display:"flex",flexDirection:"column",
        overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,.8)",
      }}>

        {/* ── HEADER ── */}
        <div style={{padding:"20px 28px 0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>✨</span>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:"#e8e8e8",letterSpacing:.2}}>Berylize This Creation</div>
                <div style={{fontSize:11,color:"#555",marginTop:1}}>Add Voice & Motion with One Flow — no technical knowledge needed</div>
              </div>
            </div>
            <button className="bm-btn" onClick={onClose} style={{background:"#1a1a24",border:"1px solid #2a2a3a",borderRadius:8,color:"#666",width:32,height:32,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>

          {/* Step indicator */}
          <div style={{display:"flex",alignItems:"center",gap:0,margin:"16px 0 0"}}>
            {[1,2,3].map((s,i)=>(
              <div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:0}}>
                <div onClick={()=> !berylizing && setStep(s as 1|2|3)} style={{
                  display:"flex",alignItems:"center",gap:7,cursor:"pointer",
                  padding:"8px 14px",borderRadius:8,
                  background: step===s ? "rgba(59,130,246,.15)" : "transparent",
                  border: step===s ? "1px solid rgba(59,130,246,.3)" : "1px solid transparent",
                  flexShrink:0,
                }}>
                  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,
                    background: step>s ? "#22c55e" : step===s ? "#3b82f6" : "#1a1a24",
                    color:"#fff",border:`1px solid ${step>s?"#22c55e":step===s?"#3b82f6":"#2a2a3a"}`,
                  }}>{step>s?"✓":s}</div>
                  <span style={{fontSize:12,fontWeight:step===s?600:400,color:step===s?"#d8d8d8":"#555"}}>{stepLabel[s]}</span>
                </div>
                {i<2 && <div style={{flex:1,height:1,background:step>s?"#22c55e":"#1e1e2a",margin:"0 4px"}}/>}
              </div>
            ))}
          </div>
          <div style={{height:1,background:"#1e1e2a",marginTop:16}}/>
        </div>

        {/* ── BODY ── */}
        <div style={{flex:1,overflow:"auto",padding:28,display:"flex",gap:24}}>

          {/* Left: preview */}
          <div style={{width:200,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Your creation</div>
            <div style={{borderRadius:12,overflow:"hidden",border:"1px solid #1e1e2a",background:"#0e0e16",aspectRatio:"3/4"}}>
              <img src={image} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
            <div style={{fontSize:9,color:"#444",lineHeight:1.5,fontStyle:"italic"}}>
              "{prompt.slice(0,80)}{prompt.length>80?"...":""}"
            </div>

            {/* Consistency meter */}
            <div style={{background:"#0e0e16",borderRadius:10,border:"1px solid #1e1e2a",padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Character Consistency</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:5,background:"#1a1a24",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${consistency}%`,height:"100%",background:`linear-gradient(90deg,${consistency>85?"#22c55e":consistency>60?"#f59e0b":"#ef4444"},${consistency>85?"#4ade80":"#fbbf24"})`,borderRadius:3}}/>
                </div>
                <span style={{fontSize:11,fontWeight:600,color:consistency>85?"#22c55e":"#f59e0b"}}>{consistency}%</span>
              </div>
              <div style={{fontSize:9,color:"#444",marginTop:4}}>Beryl LLM reference lock active</div>
              <input type="range" min={60} max={100} value={consistency} onChange={e=>setConsistency(+e.target.value)}
                style={{width:"100%",marginTop:6,accentColor:"#3b82f6",cursor:"pointer"}}/>
            </div>
          </div>

          {/* Right: steps */}
          <div style={{flex:1,minWidth:0}}>

            {/* ── STEP 1: Script ── */}
            {step===1 && (
              <div className="bm-slide" style={{display:"flex",flexDirection:"column",gap:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,color:"#e8e8e8"}}>✍️ What should she say?</div>
                    <div style={{fontSize:11,color:"#555",marginTop:2}}>Write your script below. We'll handle the timing automatically.</div>
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <div onClick={()=>{ setStoryboardMode(!storyboardMode); if(!storyboardMode&&script) setSegments(autoSegment(script)); }}
                      style={{width:36,height:20,borderRadius:10,background:storyboardMode?"#3b82f6":"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"background .2s",cursor:"pointer"}}>
                      <div style={{position:"absolute",top:2,left:storyboardMode?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                    </div>
                    <span style={{fontSize:11,color:"#666"}}>Storyboard mode</span>
                  </label>
                </div>

                <textarea className="bm-inp" value={script} onChange={e=>handleScriptChange(e.target.value)}
                  placeholder="Paste your script here or write what you want her to say...&#10;&#10;Example: 'Welcome to Beryl, where the future of AI meets human creativity. Today I want to show you something that will change how you think about content creation...'"
                  style={{
                    width:"100%",minHeight:160,background:"#151520",border:"1px solid #222",borderRadius:10,
                    color:"#d8d8d8",fontSize:13,lineHeight:1.7,padding:"14px 16px",resize:"vertical",
                    fontFamily:"inherit",
                  }}
                />

                {script.length>0 && (
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <div style={{background:"#0e1624",border:"1px solid #1e3a5f",borderRadius:8,padding:"5px 12px",fontSize:11,color:"#60a5fa"}}>
                      ~{Math.ceil(script.split(" ").length * 0.4)}s estimated duration
                    </div>
                    <div style={{background:"#0e0e16",border:"1px solid #1e1e2a",borderRadius:8,padding:"5px 12px",fontSize:11,color:"#555"}}>
                      {script.split(" ").filter(Boolean).length} words
                    </div>
                  </div>
                )}

                {/* Tip */}
                <div style={{background:"#0a1a0a",border:"1px solid #1a2e1a",borderRadius:10,padding:"10px 14px",display:"flex",gap:10}}>
                  <span style={{fontSize:16,flexShrink:0}}>💡</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#4ade80",marginBottom:2}}>Pro tip</div>
                    <div style={{fontSize:11,color:"#4a6a4a",lineHeight:1.5}}>Break long scripts into short paragraphs for better pacing. Each paragraph becomes a separate segment with natural pauses. Use "..." for dramatic pauses.</div>
                  </div>
                </div>

                {/* Storyboard segments */}
                {storyboardMode && segments.length>0 && (
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:10}}>📋 Storyboard Segments ({segments.length})</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflow:"auto"}}>
                      {segments.map((seg,i)=>(
                        <div key={seg.id} style={{display:"flex",gap:10,background:"#151520",borderRadius:8,padding:"10px 12px",border:"1px solid #1e1e2a",alignItems:"flex-start"}}>
                          <div style={{width:24,height:24,borderRadius:"50%",background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#60a5fa",fontWeight:700,flexShrink:0}}>{i+1}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,color:"#d8d8d8",lineHeight:1.5}}>{seg.text}</div>
                            <div style={{display:"flex",gap:8,marginTop:5}}>
                              <span style={{fontSize:10,color:"#555"}}>~{seg.duration}s</span>
                              <select value={seg.emotion} onChange={e=>setSegments(prev=>prev.map(s=>s.id===seg.id?{...s,emotion:e.target.value}:s))}
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

                {/* Multi-voice casting */}
                <div style={{display:"flex",alignItems:"center",gap:10,background:"#151520",borderRadius:10,padding:"10px 14px",border:"1px solid #1e1e2a"}}>
                  <span style={{fontSize:14}}>🎭</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#d8d8d8"}}>Multi-Voice Casting</div>
                    <div style={{fontSize:10,color:"#555"}}>Use different voices for different speakers in your script</div>
                  </div>
                  <div onClick={()=>setMultiVoice(!multiVoice)}
                    style={{width:36,height:20,borderRadius:10,background:multiVoice?"#3b82f6":"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"background .2s",cursor:"pointer"}}>
                    <div style={{position:"absolute",top:2,left:multiVoice?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Voice ── */}
            {step===2 && (
              <div className="bm-slide" style={{display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#e8e8e8"}}>🎙️ Choose Her Voice</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>Pick a preset or clone any voice in seconds.</div>
                </div>

                {/* Search */}
                <input className="bm-inp" value={voiceSearch} onChange={e=>setVoiceSearch(e.target.value)}
                  placeholder="🔍  Search voices by name or style (warm, sharp, energetic...)"
                  style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:8,color:"#d8d8d8",fontSize:12,padding:"9px 12px",fontFamily:"inherit"}}/>

                {/* Cloned voices */}
                {clonedVoices.length>0 && (
                  <div>
                    <div style={{fontSize:11,color:"#c8a951",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>⭐ Your Cloned Voices</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {clonedVoices.filter(v=>!voiceSearch||v.name.toLowerCase().includes(voiceSearch.toLowerCase())).map(v=>(
                        <VoiceCard key={v.id} voice={v} selected={selectedVoice.id===v.id} onSelect={()=>setSelectedVoice(v)}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset voices */}
                <div>
                  <div style={{fontSize:11,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Beryl Voice Library</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {PRESET_VOICES.filter(v=>!voiceSearch||v.name.toLowerCase().includes(voiceSearch.toLowerCase())||v.tags.some(t=>t.includes(voiceSearch.toLowerCase()))).map(v=>(
                      <VoiceCard key={v.id} voice={v} selected={selectedVoice.id===v.id} onSelect={()=>setSelectedVoice(v)}/>
                    ))}
                  </div>
                </div>

                <div style={{height:1,background:"#1e1e2a"}}/>

                {/* Clone voice section */}
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#e8e8e8",marginBottom:12}}>⚡ Quick Voice Clone</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

                    {/* Upload */}
                    <div
                      onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                      onDragLeave={()=>setDragOver(false)}
                      onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleAudioUpload(f);}}
                      onClick={()=>audioInputRef.current?.click()}
                      className="bm-drop"
                      style={{
                        background:dragOver?"rgba(59,130,246,.1)":"#0e0e16",
                        border:`2px dashed ${dragOver?"#3b82f6":"#222"}`,
                        borderRadius:12,padding:"20px 14px",textAlign:"center",cursor:"pointer",
                      }}>
                      <div style={{fontSize:28,marginBottom:6}}>🎙️</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8",marginBottom:4}}>Upload Voice Sample</div>
                      <div style={{fontSize:10,color:"#444",lineHeight:1.5}}>Drag & drop any .mp3, .wav, or .m4a<br/>Even 10 seconds works great</div>
                      <input ref={audioInputRef} type="file" accept="audio/*" style={{display:"none"}}
                        onChange={e=>{const f=e.target.files?.[0];if(f)handleAudioUpload(f);}}/>
                    </div>

                    {/* YouTube clone */}
                    <div style={{background:"#0e0e16",border:"1px solid #1e1e2a",borderRadius:12,padding:"16px 14px"}}>
                      <div style={{fontSize:28,marginBottom:6,textAlign:"center"}}>🎬</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8",marginBottom:8,textAlign:"center"}}>Clone from YouTube</div>
                      <input className="bm-inp" value={ytLink} onChange={e=>setYtLink(e.target.value)}
                        placeholder="Paste YouTube URL..."
                        style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:11,padding:"7px 10px",fontFamily:"inherit",marginBottom:6}}/>
                      <input className="bm-inp" value={ytTimestamp} onChange={e=>setYtTimestamp(e.target.value)}
                        placeholder="Timestamp e.g. 3:45 (optional)"
                        style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:11,padding:"7px 10px",fontFamily:"inherit",marginBottom:8}}/>
                      <button className="bm-btn" onClick={handleCloneYoutube} disabled={!ytLink||cloneStatus==="cloning"}
                        style={{width:"100%",padding:"8px",borderRadius:7,background:ytLink?"#3b82f6":"#1a1a24",color:ytLink?"#fff":"#444",fontSize:11,fontWeight:600}}>
                        {cloneStatus==="cloning"?"⏳ Cloning...":"Clone Voice"}
                      </button>
                    </div>
                  </div>

                  {/* Clone feedback */}
                  {cloneStatus==="cloning" && (
                    <div style={{display:"flex",alignItems:"center",gap:10,background:"#0a1a2f",border:"1px solid #1e3a5f",borderRadius:8,padding:"10px 14px",marginTop:10}}>
                      <div className="bm-spin" style={{width:16,height:16,border:"2px solid #3b82f6",borderTopColor:"transparent",borderRadius:"50%"}}/>
                      <span style={{fontSize:12,color:"#60a5fa"}}>Analyzing vocal patterns and cloning voice...</span>
                    </div>
                  )}
                  {cloneStatus==="done" && (
                    <div style={{display:"flex",alignItems:"center",gap:10,background:"#0a1a0a",border:"1px solid #1a2e1a",borderRadius:8,padding:"10px 14px",marginTop:10}}>
                      <span style={{fontSize:16}}>✅</span>
                      <span style={{fontSize:12,color:"#4ade80"}}>Voice cloned successfully! Auto-saved to your library.</span>
                    </div>
                  )}
                </div>

                {/* Auto-dub */}
                <div style={{display:"flex",alignItems:"center",gap:10,background:"#151520",borderRadius:10,padding:"10px 14px",border:"1px solid #1e1e2a"}}>
                  <span style={{fontSize:14}}>🌍</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#d8d8d8"}}>Auto-Dub to Another Language</div>
                    <div style={{fontSize:10,color:"#555"}}>Keep her voice, translate your script automatically</div>
                  </div>
                  <div onClick={()=>setAutoDub(!autoDub)}
                    style={{width:36,height:20,borderRadius:10,background:autoDub?"#3b82f6":"#1a1a24",border:"1px solid #2a2a3a",position:"relative",transition:"background .2s",cursor:"pointer"}}>
                    <div style={{position:"absolute",top:2,left:autoDub?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                  </div>
                </div>
                {autoDub && (
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingLeft:4}}>
                    {LANGUAGES.map(lang=>(
                      <button key={lang} className="bm-btn" onClick={()=>setLanguage(lang)} style={{
                        padding:"5px 14px",borderRadius:6,fontSize:11,
                        background:language===lang?"#3b82f6":"#1a1a24",
                        color:language===lang?"#fff":"#555",
                        border:`1px solid ${language===lang?"#3b82f6":"#222"}`,
                      }}>{lang}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Style & Export ── */}
            {step===3 && (
              <div className="bm-slide" style={{display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#e8e8e8"}}>🎨 Style & Export</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>Final touches before we Berylize it.</div>
                </div>

                {/* Lip sync quality */}
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Lip-Sync Quality</div>
                  <div style={{display:"flex",gap:8}}>
                    {(["natural","precise","exaggerated"] as const).map(q=>(
                      <button key={q} className="bm-btn" onClick={()=>setLipSync(q)} style={{
                        flex:1,padding:"10px 8px",borderRadius:8,fontSize:11,fontWeight:500,textTransform:"capitalize",
                        background:lipSync===q?"rgba(59,130,246,.18)":"#151520",
                        border:`1px solid ${lipSync===q?"#3b82f6":"#222"}`,
                        color:lipSync===q?"#93c5fd":"#555",
                      }}>
                        <div style={{fontSize:18,marginBottom:3}}>{q==="natural"?"🌊":q==="precise"?"🎯":"💥"}</div>
                        {q}
                        <div style={{fontSize:9,color:"#444",marginTop:2}}>{q==="natural"?"Realistic flow":q==="precise"?"Perfect sync":"Dramatic effect"}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery style */}
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Delivery Style</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {STYLES.map(s=>(
                      <button key={s} className="bm-btn" onClick={()=>setStyle(s)} style={{
                        padding:"6px 14px",borderRadius:6,fontSize:11,
                        background:style===s?"rgba(200,169,81,.18)":"#151520",
                        border:`1px solid ${style===s?"#c8a951":"#222"}`,
                        color:style===s?"#c8a951":"#555",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Export presets */}
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8}}>Smart Export Preset</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {EXPORT_PRESETS.map(p=>(
                      <div key={p.id} className="bm-export" onClick={()=>setExportPreset(p.id)} style={{
                        background:exportPreset===p.id?"rgba(200,169,81,.1)":"#151520",
                        border:`1px solid ${exportPreset===p.id?"#c8a951":"#1e1e2a"}`,
                        borderRadius:8,padding:"10px 10px",cursor:"pointer",
                      }}>
                        <div style={{fontSize:18,marginBottom:4}}>{p.icon}</div>
                        <div style={{fontSize:11,fontWeight:600,color:"#d8d8d8"}}>{p.label}</div>
                        <div style={{fontSize:9,color:"#444",marginTop:2}}>{p.spec}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced */}
                <div>
                  <button className="bm-btn" onClick={()=>setShowAdvanced(!showAdvanced)}
                    style={{display:"flex",alignItems:"center",gap:6,background:"none",color:"#555",fontSize:11,padding:0,textDecoration:"underline"}}>
                    {showAdvanced?"▲ Hide":"▼ Show"} Advanced Settings
                  </button>
                  {showAdvanced && (
                    <div style={{marginTop:12,background:"#0e0e16",borderRadius:10,border:"1px solid #1e1e2a",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
                      {[
                        {label:"Voice Evolution (pitch drift over clip)",title:"voice-evo"},
                        {label:"Emotional Timeline (intensity ramp)",title:"emo-time"},
                        {label:"Batch Berylize (apply to all gallery images)",title:"batch"},
                      ].map(opt=>(
                        <label key={opt.title} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                          <input type="checkbox" style={{accentColor:"#3b82f6",width:14,height:14}}/>
                          <span style={{fontSize:12,color:"#888"}}>{opt.label}</span>
                        </label>
                      ))}
                      <div>
                        <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>Seed (for reproducibility)</div>
                        <input className="bm-inp" type="number" defaultValue={42} style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:12,padding:"7px 10px"}}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ACTION BAR ── */}
        <div style={{padding:"14px 28px",borderTop:"1px solid #1e1e2a",background:"#0e0e16",flexShrink:0}}>
          {/* Generate progress */}
          {berylizing && (
            <div style={{marginBottom:12}}>
              <div style={{height:4,background:"#1a1a24",borderRadius:2,overflow:"hidden",marginBottom:6}}>
                <div className="bm-progress" style={{height:"100%",background:"linear-gradient(90deg,#c8a951,#f5e070,#c8a951)",backgroundSize:"200% 100%",width:`${berylProgress}%`}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:"#c8a951"}}>✨ Berylizing... generating voice, syncing lips, rendering motion</span>
                <span style={{fontSize:11,color:"#555"}}>{Math.round(berylProgress)}%</span>
              </div>
            </div>
          )}
          {berylDone && (
            <div style={{marginBottom:12,background:"#0a1a0a",border:"1px solid #1a2e1a",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🎉</span>
              <span style={{fontSize:13,color:"#4ade80",fontWeight:500}}>Your talking video is ready! Check the gallery.</span>
              <button className="bm-btn" onClick={onClose} style={{marginLeft:"auto",background:"#22c55e",color:"#fff",borderRadius:6,padding:"5px 14px",fontSize:11,fontWeight:600}}>View Result →</button>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Step nav */}
            {step>1 && !berylDone && (
              <button className="bm-btn" onClick={()=>setStep(s=>(s-1) as 1|2|3)} style={{
                padding:"11px 20px",borderRadius:10,background:"#1a1a24",border:"1px solid #2a2a3a",color:"#888",fontSize:13,
              }}>← Back</button>
            )}

            <div style={{flex:1}}/>

            {!berylDone && (
              <>
                <button className="bm-btn" style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:"1px solid #2a2a3a",color:"#555",fontSize:12}}>
                  💾 Save Voice
                </button>
                <button className="bm-btn" style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:"1px solid #2a2a3a",color:"#555",fontSize:12}}>
                  👁 Preview
                </button>

                {step<3
                  ? <button className="bm-btn" onClick={()=>setStep(s=>(s+1) as 1|2|3)} disabled={step===1&&!script.trim()} style={{
                      padding:"11px 28px",borderRadius:10,background:step===1&&!script.trim()?"#1a1a24":"#3b82f6",
                      color:step===1&&!script.trim()?"#444":"#fff",fontSize:13,fontWeight:600,
                      boxShadow:step===1&&!script.trim()?"none":"0 4px 16px rgba(59,130,246,.4)",
                    }}>
                      Continue →
                    </button>
                  : <button className={`bm-btn${berylizing?" bm-pulse":""}`} onClick={handleBerylize} disabled={berylizing||!script.trim()} style={{
                      padding:"12px 32px",borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:.3,
                      background:berylizing?"linear-gradient(135deg,#78350f,#c8a951)":"linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
                      backgroundSize:"200% auto",color:"#0c0c0f",
                      boxShadow:"0 4px 24px rgba(200,169,81,.5)",
                    }}>
                      {berylizing?"✨ Berylizing...":"✨ Berylize Now!"}
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

// ── Voice Card sub-component ───────────────────────────────────────────────
function VoiceCard({ voice, selected, onSelect }: { voice: Voice; selected: boolean; onSelect: () => void }) {
  return (
    <div className="bm-voice" onClick={onSelect} style={{
      background:selected?"rgba(59,130,246,.12)":"#151520",
      border:`1px solid ${selected?"#3b82f6":"#222"}`,
      borderRadius:10,padding:"10px 14px",minWidth:110,textAlign:"center",
    }}>
      <div style={{fontSize:22,marginBottom:4}}>{voice.emoji}</div>
      <div style={{fontSize:12,fontWeight:600,color:"#d8d8d8"}}>{voice.name}</div>
      {voice.source==="cloned" && (
        <div style={{fontSize:9,color:"#c8a951",marginTop:2}}>✦ Cloned</div>
      )}
      <div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
        {voice.tags.slice(0,2).map(t=>(
          <span key={t} style={{fontSize:8,background:"#1a1a24",borderRadius:3,padding:"1px 5px",color:"#444"}}>{t}</span>
        ))}
      </div>
      {selected && <div style={{fontSize:9,color:"#3b82f6",marginTop:4,fontWeight:600}}>✓ Selected</div>}
    </div>
  );
}
