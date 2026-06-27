"use client";
import { useState, useRef, useCallback } from "react";
import BerylizeModal, { type BerylizeConfig, type BerylizeContext } from "@/components/BerylizeModal";
import Nav from "@/components/Nav";
import { VIDEO } from "@/lib/cdn";

// ── Types ──────────────────────────────────────────────────────────────────
type Tab = "image" | "video" | "audio";
type Filter = "all" | "favorited" | "downloaded" | "4k";
type AspectRatio = "1:1" | "4:3" | "16:9" | "9:16";
type GenStatus = "idle" | "queued" | "generating" | "done";

interface GeneratedItem {
  id: string;
  src: string;
  prompt: string;
  type: Tab;
  favorited: boolean;
  downloaded: boolean;
  is4k: boolean;
  timestamp: number;
}

const DEMO_GALLERY: GeneratedItem[] = [
  { id:"g1", src:"/characters/KIZZY_SHIELD.png",   prompt:"Photorealistic portrait, studio lighting", type:"image", favorited:true,  downloaded:false, is4k:true,  timestamp: Date.now()-120000 },
  { id:"g2", src:"/characters/EVE_SHIELD.png",     prompt:"AI architect, overhead sofa view",         type:"image", favorited:false, downloaded:true,  is4k:false, timestamp: Date.now()-90000  },
  { id:"g3", src:"/characters/AMANDA_SHIELD.png",  prompt:"Finance executive, dramatic light",        type:"image", favorited:false, downloaded:false, is4k:true,  timestamp: Date.now()-60000  },
  { id:"g4", src:"/characters/JESSICA_SHIELD.png", prompt:"Strategy lead, cinematic closeup",         type:"image", favorited:true,  downloaded:true,  is4k:false, timestamp: Date.now()-45000  },
  { id:"g5", src:"/characters/INDIA_SHIELD.png",   prompt:"Growth director, editorial style",         type:"image", favorited:false, downloaded:false, is4k:true,  timestamp: Date.now()-30000  },
  { id:"g6", src:"/characters/MARIA_SHIELD.png",   prompt:"Relations, golden hour portrait",          type:"image", favorited:false, downloaded:false, is4k:false, timestamp: Date.now()-15000  },
];

const MODELS = ["Beryl LLM v2", "Beryl Portrait XL", "Nano Banana 2", "Beryl Cinematic", "Beryl Flash"];
const ASPECTS: AspectRatio[] = ["1:1", "4:3", "16:9", "9:16"];
const NAV_ICONS = [
  { id:"apps",       label:"Apps",       d:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { id:"custom",     label:"Custom",     d:"M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id:"studio",     label:"Studio",     d:"M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { id:"agent",      label:"Agent",      d:"M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" },
  { id:"recents",    label:"Recents",    d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id:"projects",   label:"Projects",   d:"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { id:"workflow",   label:"Workflow",   d:"M13 10V3L4 14h7v7l9-11h-7z" },
  { id:"characters", label:"Characters", d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function BerylDiffusion() {
  const [activeTab, setActiveTab]       = useState<Tab>("image");
  const [activeNav, setActiveNav]       = useState("studio");
  const [filter, setFilter]             = useState<Filter>("all");
  const [prompt, setPrompt]             = useState("");
  const [negPrompt, setNegPrompt]       = useState("");
  const [showNeg, setShowNeg]           = useState(false);
  const [aspect, setAspect]             = useState<AspectRatio>("16:9");
  const [model, setModel]               = useState(MODELS[0]);
  const [cfgScale, setCfgScale]         = useState(7);
  const [steps, setSteps]               = useState(30);
  const [refStrength, setRefStrength]   = useState(0.75);
  const [videoDuration, setVideoDuration] = useState(4);
  const [credits, setCredits]           = useState(6937);
  const [tokenCount, setTokenCount]     = useState(117);
  const [genStatus, setGenStatus]       = useState<GenStatus>("idle");
  const [genProgress, setGenProgress]   = useState(0);
  const [gallery, setGallery]           = useState<GeneratedItem[]>(DEMO_GALLERY);
  const [selected, setSelected]         = useState<GeneratedItem | null>(null);
  const [refImage, setRefImage]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredGallery = gallery.filter(g => {
    if (filter === "favorited")  return g.favorited;
    if (filter === "downloaded") return g.downloaded;
    if (filter === "4k")         return g.is4k;
    return true;
  });

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    setGenStatus("queued");
    setGenProgress(0);
    const cost = Math.floor(Math.random() * 80) + 40;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        const chars = [
          "/characters/BRICE_SHIELD.png","/characters/JAMARR_SHIELD.png",
          "/characters/TERRELL_SHIELD.png","/characters/SHELLY_SHIELD.png",
          "/characters/NU_SHIELD.png","/characters/LACARA_SHIELD.png",
        ];
        const newItem: GeneratedItem = {
          id: `g${Date.now()}`,
          src: chars[Math.floor(Math.random() * chars.length)],
          prompt,
          type: activeTab,
          favorited: false,
          downloaded: false,
          is4k: steps >= 40,
          timestamp: Date.now(),
        };
        setGallery(prev => [newItem, ...prev]);
        setCredits(c => c - cost);
        setTokenCount(t => Math.min(t + Math.floor(prompt.length / 4), 5000));
        setGenStatus("done");
        setTimeout(() => setGenStatus("idle"), 2000);
      }
      setGenProgress(Math.min(p, 100));
      if (p < 100) setGenStatus("generating");
    }, 200);
  }, [prompt, activeTab, steps]);

  const toggleFavorite = (id: string) =>
    setGallery(prev => prev.map(g => g.id === id ? { ...g, favorited: !g.favorited } : g));

  const isGenerating = genStatus === "generating" || genStatus === "queued";

  // Berylize modal state
  const [berylizeTarget, setBerylizeTarget] = useState<GeneratedItem | null>(null);
  const [berylizeHistory, setBerylizeHistory] = useState<BerylizeContext[]>([]);
  const handleBerylizeConfig = useCallback((_config: BerylizeConfig) => {
    console.log("Berylize config:", _config);
    if (berylizeTarget) {
      setBerylizeHistory(prev => [{
        type: berylizeTarget.type,
        src: berylizeTarget.src,
        prompt: berylizeTarget.prompt,
        id: berylizeTarget.id,
      }, ...prev].slice(0, 12));
    }
  }, [berylizeTarget]);

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100vh",
      background:"#0c0c0f", color:"#e8e8e8",
      fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",
      overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
        .bd{transition:all .15s ease;cursor:pointer;border:none;outline:none}
        .bd:hover{opacity:.85}
        .bd-nav:hover{background:rgba(255,255,255,.08)!important;color:#fff!important}
        .bd-gallery:hover .bd-ov{opacity:1!important}
        .bd-gallery:hover{transform:scale(1.02)}
        .bd-gallery{transition:all .2s ease;cursor:pointer;position:relative;overflow:hidden}
        .bd-inp:focus{outline:none;border-color:#3b82f6!important}
        .bd-inp{transition:border-color .15s ease}
        .bd-slider{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#2a2a35;cursor:pointer;width:100%}
        .bd-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2px solid #0c0c0f}
        .pulse{animation:gpulse 1.5s ease-in-out infinite}
        @keyframes gpulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)}50%{box-shadow:0 0 0 8px rgba(59,130,246,0)}}
        .bd-prog{transition:width .3s ease}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .shimmer{background:linear-gradient(90deg,#1a1a24 25%,#252535 50%,#1a1a24 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 1s linear infinite}
        .filt:hover{background:rgba(255,255,255,.1)!important}
        .filt{transition:all .15s ease;cursor:pointer}
      `}</style>

      <Nav />

      {/* ── TOP BAR ── */}
      <div style={{display:"flex",alignItems:"center",height:52,background:"#111118",borderBottom:"1px solid #1e1e2a",padding:"0 16px",flexShrink:0,zIndex:100,gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:"#c8a951",letterSpacing:1}}>BERYL</span>
          <span style={{fontSize:11,color:"#165168",fontWeight:500,letterSpacing:2}}>DIFFUSION</span>
          <div style={{width:1,height:20,background:"#2a2a3a",marginLeft:8}}/>
        </div>

        <div style={{display:"flex",gap:2,background:"#1a1a24",borderRadius:8,padding:3}}>
          {(["image","video","audio"] as Tab[]).map(t => (
            <button key={t} className="bd" onClick={() => setActiveTab(t)} style={{
              padding:"5px 18px",borderRadius:6,background:activeTab===t?"#252535":"transparent",
              color:activeTab===t?"#e8e8e8":"#666",fontSize:13,fontWeight:500,letterSpacing:.3,
            }}>
              {t==="image"?"⬛ Image":t==="video"?"▶ Video":"♪ Audio"}
            </button>
          ))}
        </div>

        <div style={{flex:1}}/>

        <button className="bd" style={{background:"none",color:"#666",fontSize:18,padding:4}}>🔔</button>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#1a1a24",borderRadius:8,padding:"5px 12px"}}>
          <span style={{fontSize:11,color:"#666"}}>Credits</span>
          <span style={{fontSize:13,fontWeight:600,color:"#c8a951"}}>{credits.toLocaleString()}</span>
          <button className="bd" style={{background:"#3b82f6",color:"#fff",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:600,marginLeft:4}}>+ Buy</button>
        </div>
        <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#c8a951,#8B6914)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#0c0c0f"}}>B</div>
      </div>

      {/* ── BODY ── */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── ICON SIDEBAR ── */}
        <div style={{width:60,background:"#0e0e16",borderRight:"1px solid #1e1e2a",display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 0",gap:4,flexShrink:0}}>
          {NAV_ICONS.map(n => (
            <button key={n.id} className="bd bd-nav" onClick={() => setActiveNav(n.id)} title={n.label} style={{
              width:44,height:44,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
              background:activeNav===n.id?"rgba(59,130,246,.18)":"transparent",
              border:activeNav===n.id?"1px solid rgba(59,130,246,.4)":"1px solid transparent",
              color:activeNav===n.id?"#3b82f6":"#444",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.d}/>
              </svg>
              <span style={{fontSize:7,letterSpacing:.3}}>{n.label}</span>
            </button>
          ))}
        </div>

        {/* ── PROMPT PANEL ── */}
        <div style={{width:300,background:"#111118",borderRight:"1px solid #1e1e2a",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

          {/* Reference */}
          <div style={{padding:"14px 14px 0"}}>
            <div style={{fontSize:11,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Reference Image</div>
            <div style={{display:"flex",gap:8}}>
              <div onClick={() => fileRef.current?.click()} style={{
                width:78,height:78,borderRadius:8,border:"1px dashed #2a2a3a",background:refImage?"transparent":"#151520",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                cursor:"pointer",overflow:"hidden",flexShrink:0,
              }}>
                {refImage
                  ? <img src={refImage} alt="ref" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg><span style={{fontSize:9,color:"#333",marginTop:4}}>Image 1</span></>
                }
              </div>
              <button className="bd" style={{flex:1,borderRadius:8,border:"1px dashed #222",background:"#151520",color:"#444",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                Reference
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = ev => setRefImage(ev.target?.result as string); r.readAsDataURL(f); }
            }}/>
          </div>

          {/* Scrollable controls */}
          <div style={{padding:"12px 14px",flex:1,display:"flex",flexDirection:"column",gap:10,overflow:"auto"}}>
            {/* Prompt */}
            <div>
              <div style={{fontSize:11,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Prompt</div>
              <textarea className="bd-inp" value={prompt}
                onChange={e => { setPrompt(e.target.value); setTokenCount(Math.min(117+Math.floor(e.target.value.length/4),4900)); }}
                placeholder="Describe your scene — lighting, composition, character, style..."
                style={{width:"100%",minHeight:120,maxHeight:180,background:"#151520",border:"1px solid #222",borderRadius:8,color:"#d8d8d8",fontSize:12,lineHeight:1.6,padding:"10px 12px",resize:"vertical",fontFamily:"inherit"}}
              />
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <button className="bd" onClick={() => setShowNeg(!showNeg)} style={{fontSize:10,color:"#444",background:"none",padding:0,textDecoration:"underline"}}>
                  {showNeg?"Hide":"+ Negative"} prompt
                </button>
                <span style={{fontSize:10,color:tokenCount>4500?"#ef4444":"#444"}}>{tokenCount}/5000</span>
              </div>
            </div>

            {showNeg && (
              <textarea className="bd-inp" value={negPrompt} onChange={e=>setNegPrompt(e.target.value)}
                placeholder="Avoid: blurry, distorted, low quality, watermark..."
                style={{width:"100%",minHeight:70,background:"#151520",border:"1px solid #222",borderRadius:8,color:"#d8d8d8",fontSize:12,lineHeight:1.6,padding:"10px 12px",resize:"vertical",fontFamily:"inherit"}}
              />
            )}

            {/* Aspect */}
            <div>
              <div style={{fontSize:11,color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Aspect Ratio</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {ASPECTS.map(a => (
                  <button key={a} className="bd" onClick={()=>setAspect(a)} style={{
                    padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:500,
                    background:aspect===a?"#3b82f6":"#1a1a24",color:aspect===a?"#fff":"#555",
                    border:aspect===a?"1px solid #3b82f6":"1px solid #222",
                  }}>{a}</button>
                ))}
                {["1K","4K"].map(r=>(
                  <button key={r} className="bd" style={{padding:"5px 11px",borderRadius:6,fontSize:11,background:"#1a1a24",color:"#555",border:"1px solid #222"}}>{r}</button>
                ))}
              </div>
            </div>

            {/* CFG + Steps */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8}}>CFG</span>
                  <span style={{fontSize:11,color:"#d8d8d8",fontWeight:500}}>{cfgScale}</span>
                </div>
                <input type="range" min={1} max={20} value={cfgScale} onChange={e=>setCfgScale(+e.target.value)} className="bd-slider"/>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8}}>Steps</span>
                  <span style={{fontSize:11,color:"#d8d8d8",fontWeight:500}}>{steps}</span>
                </div>
                <input type="range" min={10} max={60} value={steps} onChange={e=>setSteps(+e.target.value)} className="bd-slider"/>
              </div>
            </div>

            {/* Ref strength */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8}}>Ref Strength</span>
                <span style={{fontSize:11,color:"#d8d8d8",fontWeight:500}}>{refStrength.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={refStrength} onChange={e=>setRefStrength(+e.target.value)} className="bd-slider"/>
            </div>

            {/* Video tab extras */}
            {activeTab==="video" && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div>
                  <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Duration</div>
                  <div style={{display:"flex",gap:6}}>
                    {[4,8,16].map(d=>(
                      <button key={d} className="bd" onClick={()=>setVideoDuration(d)} style={{
                        padding:"5px 14px",borderRadius:6,fontSize:11,
                        background:videoDuration===d?"#3b82f6":"#1a1a24",color:videoDuration===d?"#fff":"#555",
                        border:`1px solid ${videoDuration===d?"#3b82f6":"#222"}`,
                      }}>{d}s</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>Camera Move</div>
                  <select className="bd-inp" style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:12,padding:"7px 10px"}}>
                    <option>Static</option><option>Dolly In</option><option>Dolly Out</option>
                    <option>Pan Left</option><option>Pan Right</option><option>Orbit</option>
                  </select>
                </div>
              </div>
            )}

            {/* Audio tab extras */}
            {activeTab==="audio" && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>Voice</div>
                  <select className="bd-inp" style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:6,color:"#d8d8d8",fontSize:12,padding:"7px 10px"}}>
                    <option>Kizzy — Warm & Confident</option>
                    <option>Eve — Sharp & Clear</option>
                    <option>Amanda — Professional</option>
                    <option>Custom Upload</option>
                  </select>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:.8}}>Emotion</span>
                    <span style={{fontSize:11,color:"#d8d8d8"}}>7</span>
                  </div>
                  <input type="range" min={1} max={10} defaultValue={7} className="bd-slider"/>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  <input type="checkbox" style={{accentColor:"#3b82f6"}}/>
                  <span style={{fontSize:11,color:"#777"}}>Lip-sync with video</span>
                </label>
              </div>
            )}

            <button className="bd" style={{padding:"8px 12px",borderRadius:8,border:"1px dashed #222",background:"transparent",color:"#444",fontSize:11,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,lineHeight:1}}>+</span> Add References
            </button>
          </div>

          {/* Generate footer */}
          <div style={{padding:"12px 14px",borderTop:"1px solid #1e1e2a",background:"#0e0e16"}}>
            <select value={model} onChange={e=>setModel(e.target.value)} className="bd-inp"
              style={{width:"100%",background:"#151520",border:"1px solid #222",borderRadius:8,color:"#d8d8d8",fontSize:12,padding:"8px 12px",marginBottom:10,fontFamily:"inherit"}}>
              {MODELS.map(m=><option key={m}>{m}</option>)}
            </select>

            {isGenerating && (
              <div style={{marginBottom:8}}>
                <div style={{height:3,background:"#1a1a24",borderRadius:2,overflow:"hidden"}}>
                  <div className="bd-prog" style={{height:"100%",background:"linear-gradient(90deg,#3b82f6,#60a5fa)",width:`${genProgress}%`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                  <span style={{fontSize:10,color:"#3b82f6"}}>Generating...</span>
                  <span style={{fontSize:10,color:"#444"}}>{Math.round(genProgress)}%</span>
                </div>
              </div>
            )}
            {genStatus==="done" && <div style={{marginBottom:8,fontSize:11,color:"#22c55e",textAlign:"center"}}>✓ Complete</div>}

            <button className={`bd${isGenerating?" pulse":""}`} onClick={handleGenerate} disabled={isGenerating} style={{
              width:"100%",padding:"12px",borderRadius:10,
              background:isGenerating?"linear-gradient(135deg,#1e3a5f,#2563eb)":"linear-gradient(135deg,#2563eb,#3b82f6)",
              color:"#fff",fontSize:14,fontWeight:600,letterSpacing:.5,
              boxShadow:"0 4px 20px rgba(59,130,246,.35)",opacity:isGenerating?.8:1,
            }}>
              {genStatus==="queued"?"⏳ Queued...":genStatus==="generating"?"⚡ Generating...":"⚡ Generate"}
            </button>
            <div style={{fontSize:10,color:"#333",textAlign:"center",marginTop:5}}>{tokenCount}/5000 tokens</div>
          </div>
        </div>

        {/* ── GALLERY ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#0c0c0f"}}>

          {/* Toolbar */}
          <div style={{display:"flex",alignItems:"center",padding:"10px 20px",borderBottom:"1px solid #1a1a24",gap:10,flexShrink:0}}>
            <div style={{display:"flex",gap:2,background:"#111118",borderRadius:8,padding:3}}>
              {(["all","favorited","downloaded","4k"] as Filter[]).map(f=>(
                <button key={f} className="bd filt" onClick={()=>setFilter(f)} style={{
                  padding:"4px 14px",borderRadius:6,fontSize:11,fontWeight:500,
                  background:filter===f?"#1e1e2e":"transparent",
                  color:filter===f?"#d8d8d8":"#444",border:"none",
                }}>{f==="4k"?"4K":f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
            <div style={{flex:1}}/>
            <button className="bd" style={{background:"#111118",border:"1px solid #1e1e2a",borderRadius:6,color:"#555",padding:"6px 12px",fontSize:11}}>Filter</button>
            <button className="bd" style={{background:"#111118",border:"1px solid #1e1e2a",borderRadius:6,color:"#555",padding:"6px 12px",fontSize:11}}>↓ Export</button>
            <button
              className="bd"
              onClick={() => {
                if (!window.confirm(`Clear all ${activeTab} items from the viewer?`)) return;
                setGallery(prev => prev.filter(g => g.type !== activeTab));
                setSelected(s => s?.type === activeTab ? null : s);
              }}
              style={{background:"rgba(220,38,38,.1)",border:"1px solid rgba(220,38,38,.35)",borderRadius:6,color:"#ef4444",padding:"6px 14px",fontSize:11,fontWeight:600,letterSpacing:.3}}
            >
              ✕ Clear All
            </button>
          </div>

          {/* Grid */}
          <div style={{flex:1,overflow:"auto",padding:20}}>
            {filteredGallery.length===0 ? (
              <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                <span style={{color:"#333",fontSize:13}}>No generations yet</span>
                <span style={{color:"#252525",fontSize:11}}>Write a prompt and click Generate</span>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
                {filteredGallery.map(item=>(
                  <div key={item.id} className="bd-gallery" onClick={()=>setSelected(item)}
                    style={{borderRadius:10,overflow:"hidden",background:"#111118",border:"1px solid #1a1a24",aspectRatio:"3/4"}}>
                    <img src={item.src} alt={item.prompt}
                      style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",display:"block"}}
                      onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    <div className="bd-ov" style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 50%)",opacity:0,transition:"opacity .2s",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:8}}>
                      <div style={{fontSize:9,color:"#bbb",lineHeight:1.4,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.prompt}</div>
                      <div style={{display:"flex",gap:5}}>
                        {/* Download */}
                        <button className="bd" title="Download" onClick={e=>{e.stopPropagation();
                          const a=document.createElement("a");a.href=item.src;a.download=`beryl-${item.id}.png`;a.click();
                          setGallery(prev=>prev.map(g=>g.id===item.id?{...g,downloaded:true}:g));
                        }} style={{flex:1,background:"rgba(37,99,235,.75)",border:"1px solid rgba(59,130,246,.5)",borderRadius:6,padding:"6px 0",fontSize:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Save
                        </button>
                        {/* Share */}
                        <button className="bd" title="Share" onClick={e=>{e.stopPropagation();
                          if(navigator.share){navigator.share({title:"Beryl Diffusion",text:item.prompt,url:window.location.href});}
                          else{navigator.clipboard.writeText(window.location.href);alert("Link copied!");}
                        }} style={{flex:1,background:"rgba(16,185,129,.65)",border:"1px solid rgba(16,185,129,.4)",borderRadius:6,padding:"6px 0",fontSize:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                          Share
                        </button>
                        {/* Delete */}
                        <button className="bd" title="Delete" onClick={e=>{e.stopPropagation();
                          setGallery(prev=>prev.filter(g=>g.id!==item.id));
                          if(selected?.id===item.id) setSelected(null);
                        }} style={{flex:1,background:"rgba(220,38,38,.65)",border:"1px solid rgba(239,68,68,.4)",borderRadius:6,padding:"6px 0",fontSize:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                          Delete
                        </button>
                      </div>
                      {/* Berylize It button */}
                      <button className="bd" onClick={e=>{e.stopPropagation();setBerylizeTarget(item);setSelected(null);}}
                        style={{width:"100%",marginTop:5,padding:"7px 0",borderRadius:6,fontSize:11,fontWeight:700,letterSpacing:.3,
                          background:"linear-gradient(135deg,#78350f,#c8a951,#f5e070,#c8a951)",backgroundSize:"200% auto",
                          color:"#0c0c0f",border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                        }}>
                        ✨ Berylize It!
                      </button>
                    </div>
                    <div style={{position:"absolute",top:7,left:7,display:"flex",gap:4}}>
                      {item.is4k && <span style={{background:"rgba(200,169,81,.9)",color:"#0c0c0f",fontSize:8,fontWeight:700,padding:"2px 5px",borderRadius:3,letterSpacing:.5}}>4K</span>}
                      {item.favorited && <span style={{background:"rgba(245,158,11,.9)",color:"#0c0c0f",fontSize:9,padding:"1px 4px",borderRadius:3}}>★</span>}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="shimmer" style={{borderRadius:10,aspectRatio:"3/4",border:"1px solid #1e1e2a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
                    <div className="spin" style={{width:28,height:28,border:"3px solid #3b82f6",borderTopColor:"transparent",borderRadius:"50%"}}/>
                    <span style={{fontSize:10,color:"#3b82f6"}}>{Math.round(genProgress)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── THUMBNAIL STRIP ── */}
        <div style={{width:52,background:"#0e0e16",borderLeft:"1px solid #1e1e2a",display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px",gap:4,overflow:"auto",flexShrink:0}}>
          {gallery.slice(0,15).map((g,i)=>(
            <div key={g.id} onClick={()=>setSelected(g)} style={{
              width:40,height:40,borderRadius:5,overflow:"hidden",cursor:"pointer",
              border:`1px solid ${selected?.id===g.id?"#3b82f6":"#1e1e2a"}`,flexShrink:0,position:"relative",
            }}>
              <img src={g.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              <div style={{position:"absolute",top:1,right:1,fontSize:7,color:"#666",background:"rgba(0,0,0,.7)",borderRadius:2,padding:"0 2px"}}>{i+1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111118",borderRadius:16,border:"1px solid #1e1e2a",maxWidth:860,width:"100%",maxHeight:"90vh",overflow:"hidden",display:"flex"}}>
            <div style={{width:"58%",background:"#0e0e16",flexShrink:0}}>
              <img src={selected.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}
                onError={e=>{(e.target as HTMLImageElement).style.background="#1a1a24";}}/>
            </div>
            <div style={{flex:1,padding:24,display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
              <button onClick={()=>setSelected(null)} style={{alignSelf:"flex-end",background:"none",border:"none",color:"#555",fontSize:20,cursor:"pointer",padding:0}}>✕</button>
              <div>
                <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Prompt</div>
                <div style={{fontSize:13,color:"#bbb",lineHeight:1.6}}>{selected.prompt}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {selected.is4k && <span style={{background:"#1a1a0e",border:"1px solid #c8a951",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#c8a951"}}>4K</span>}
                <span style={{background:"#1e1e2e",border:"1px solid #2a2a3a",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#555",textTransform:"capitalize"}}>{selected.type}</span>
              </div>
              <div style={{display:"flex",gap:8,marginTop:"auto"}}>
                <button className="bd" onClick={()=>toggleFavorite(selected.id)} style={{
                  flex:1,padding:"10px",borderRadius:8,fontSize:12,fontWeight:500,
                  background:selected.favorited?"#78350f":"#1a1a24",
                  border:`1px solid ${selected.favorited?"#f59e0b":"#2a2a3a"}`,
                  color:selected.favorited?"#f59e0b":"#666",
                }}>{selected.favorited?"★ Favorited":"☆ Favorite"}</button>
                <button className="bd" style={{flex:1,padding:"10px",borderRadius:8,fontSize:12,fontWeight:500,background:"#0a1a2f",border:"1px solid #1e3a5f",color:"#60a5fa"}}>↓ Download</button>
              </div>
              <button className="bd" style={{padding:"10px",borderRadius:8,fontSize:12,fontWeight:600,background:"linear-gradient(135deg,#2563eb,#3b82f6)",color:"#fff"}}
                onClick={()=>{setPrompt(selected.prompt);setSelected(null);}}>
                ↺ Remix this generation
              </button>
              <button className="bd" style={{padding:"12px",borderRadius:8,fontSize:16,fontWeight:700,letterSpacing:.3,
                background:"linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",backgroundSize:"200% auto",color:"#0c0c0f",
                boxShadow:"0 4px 20px rgba(200,169,81,.4)",
              }} onClick={()=>{setBerylizeTarget(selected);setSelected(null);}}>
                ✨ Berylize It! — Add Voice & Motion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BERYLIZE MODAL ── */}
      {berylizeTarget && (
        <BerylizeModal
          context={{ type: berylizeTarget.type, src: berylizeTarget.src, prompt: berylizeTarget.prompt, id: berylizeTarget.id }}
          onClose={()=>setBerylizeTarget(null)}
          onBerylize={handleBerylizeConfig}
          history={berylizeHistory}
        />
      )}
    </div>
  );
}


