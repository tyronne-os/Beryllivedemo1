"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
interface Scene {
  id: string; index: number; title: string; description: string; location: string;
  camera: string; emotion: string; colorGrade: string;
  status: "pending"|"generating"|"ready"|"error";
  videoUrl?: string; thumbnail?: string;
}
interface StitchResult {
  filmTitle: string; narrativeArc: string; playlist: unknown[];
  editorial: { colorConsistency?: {grade:string;rationale:string}; pacing?: {overallTempo:string;note:string}; filmNote?: string };
  totalScenes: number; estimatedRuntime: string; status: string;
}
interface ProjectState {
  title: string; style: "photorealistic"|"pixar"|"anime";
  tier: "preview"|"production"|"premium"|"ultra";
  phase: "idle"|"screenplay"|"storyboard"|"generating"|"stitching"|"complete";
  scenes: Scene[]; characters: {id:string;name:string;description:string}[];
  progress: number;
  audioUrl?: string;
  referenceImageUrl?: string;
  stitchResult?: StitchResult;
}

const TIER_INFO = {
  preview:    { model:"Wan2.2-S2V-14B",   maxSec:600,  maxLabel:"10 min",  free:true,  audio:"Audio-driven (give it audio → synced video)" },
  production: { model:"Wan2.2-S2V-14B",   maxSec:600,  maxLabel:"10 min",  free:true,  audio:"Audio-driven (give it audio → synced video)" },
  premium:    { model:"Seedance 2.0 T2V",  maxSec:15,   maxLabel:"15 sec",  free:false, audio:"Native audio+video (text-to-video)" },
  ultra:      { model:"Seedance 2.5 T2V",  maxSec:30,   maxLabel:"30 sec",  free:false, audio:"Native audio+video (text-to-video)" },
};

const EMOTION_COLORS: Record<string,string> = {
  Tension:"#c8a951",Urgency:"#dc3c3c",Shock:"#ff6b6b",
  Fear:"#8b4513","Fear / Determination":"#dc3c3c",Reckoning:"#4a9ab5",Devastation:"#6b4f8b",
};

// ── Component ──────────────────────────────────────────────────────────────
// ── Voice orb state ────────────────────────────────────────────────────────
type VoiceState = "idle"|"connecting"|"listening"|"speaking"|"error";

export default function MatineeStudio() {
  const [project, setProject] = useState<ProjectState>({
    title:"Untitled Production", style:"photorealistic", tier:"preview",
    phase:"idle", scenes:[], characters:[], progress:0,
  });
  const [activeScene, setActiveScene] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"scenes"|"characters"|"settings">("scenes");
  const [generating, setGenerating] = useState(false);

  // ── Voice agent state ──────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<{role:"user"|"vera";text:string}[]>([]);
  const [orbLevel, setOrbLevel] = useState(0);
  const [sceneBuilding, setSceneBuilding] = useState<string|null>(null); // title of scene being queued
  const [stitching, setStitching] = useState(false);
  const pcRef = useRef<RTCPeerConnection|null>(null);
  const dcRef = useRef<RTCDataChannel|null>(null);
  const audioElRef = useRef<HTMLAudioElement|null>(null);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const animFrameRef = useRef<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  // Keep a ref to project so async handlers always see latest state
  const projectRef = useRef(project);
  useEffect(()=>{ projectRef.current = project; },[project]);

  useEffect(()=>{ transcriptEndRef.current?.scrollIntoView({behavior:"smooth"}); },[transcript]);

  const startLevelLoop = useCallback((analyser: AnalyserNode)=>{
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const loop = ()=>{
      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
      setOrbLevel(avg/255);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  },[]);

  const stopSession = useCallback(()=>{
    cancelAnimationFrame(animFrameRef.current);
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    setOrbLevel(0);
    setVoiceState("idle");
  },[]);

  // ── Tool: generate_scene ───────────────────────────────────────────────────
  const handleGenerateScene = useCallback(async(args: {
    sceneNumber: number; title: string; description: string;
    mood: string; cameraWork?: string; colorGrade?: string; location?: string;
  }, callId: string)=>{
    const sceneId = `scene-${Date.now()}`;
    const newScene: Scene = {
      id: sceneId,
      index: args.sceneNumber - 1,
      title: args.title,
      description: args.description,
      location: args.location ?? "Unknown",
      camera: args.cameraWork ?? "cinematic",
      emotion: args.mood,
      colorGrade: args.colorGrade ?? "cinematic",
      status: "generating",
    };

    setSceneBuilding(args.title);
    setProject(p=>({ ...p, scenes: [...p.scenes, newScene], phase:"generating" }));

    // Send function result back to Vera immediately (non-blocking)
    const dc = dcRef.current;
    if(dc?.readyState==="open"){
      dc.send(JSON.stringify({
        type:"conversation.item.create",
        item:{
          type:"function_call_output",
          call_id: callId,
          output: JSON.stringify({ success:true, sceneId, message:`Scene "${args.title}" queued for generation.` }),
        },
      }));
      dc.send(JSON.stringify({ type:"response.create" }));
    }

    // Fire generation API
    try {
      const p = projectRef.current;
      const body: Record<string,unknown> = {
        prompt: args.description,
        style: p.style,
        tier: p.tier,
        duration: 10,
      };
      if(p.tier==="preview"||p.tier==="production"){
        body.referenceImageUrl = p.referenceImageUrl;
        body.audioUrl = p.audioUrl;
      }
      const res = await fetch("/api/matinee/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setProject(p=>({
        ...p,
        scenes: p.scenes.map(s=>s.id===sceneId
          ? {...s, status: data.videoUrl?"ready":"error", videoUrl: data.videoUrl}
          : s
        ),
      }));
      setActiveScene(prev=>prev); // keep selection
    } catch {
      setProject(p=>({
        ...p,
        scenes: p.scenes.map(s=>s.id===sceneId ? {...s,status:"error"} : s),
      }));
    }
    setSceneBuilding(null);
  },[]);

  // ── Tool: request_stitch ───────────────────────────────────────────────────
  const handleRequestStitch = useCallback(async(args: {
    filmTitle: string; narrativeArc: string; genre?: string;
  }, callId: string)=>{
    const dc = dcRef.current;
    if(dc?.readyState==="open"){
      dc.send(JSON.stringify({
        type:"conversation.item.create",
        item:{
          type:"function_call_output",
          call_id: callId,
          output: JSON.stringify({ success:true, message:"Auto-stitch agent is assembling your film now." }),
        },
      }));
      dc.send(JSON.stringify({ type:"response.create" }));
    }

    setStitching(true);
    setProject(p=>({...p, title: args.filmTitle, phase:"stitching"}));

    try {
      const p = projectRef.current;
      const res = await fetch("/api/matinee/stitch", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          scenes: p.scenes,
          filmTitle: args.filmTitle,
          narrativeArc: args.narrativeArc,
          genre: args.genre,
          style: p.style,
        }),
      });
      const data = await res.json();
      setProject(prev=>({...prev, stitchResult: data, phase:"complete"}));
    } catch {
      setProject(p=>({...p, phase:"complete"}));
    }
    setStitching(false);
  },[]);

  const startSession = useCallback(async()=>{
    if(voiceState!=="idle") { stopSession(); return; }
    setVoiceState("connecting");
    try {
      const tokenRes = await fetch("/api/matinee/realtime-token", { method:"POST" });
      if(!tokenRes.ok) throw new Error("token fetch failed");
      const { token } = await tokenRes.json();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      pc.ontrack = (e)=>{
        audioEl.srcObject = e.streams[0];
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(e.streams[0]);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;
        startLevelLoop(analyser);
        setVoiceState("speaking");
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      // Accumulate function call args across streaming deltas
      const pendingCalls: Record<string,{name:string;args:string}> = {};

      dc.onmessage = (e)=>{
        try {
          const ev = JSON.parse(e.data);

          if(ev.type==="conversation.item.input_audio_transcription.completed")
            setTranscript(t=>[...t,{role:"user",text:ev.transcript}]);
          if(ev.type==="response.audio_transcript.done")
            setTranscript(t=>[...t,{role:"vera",text:ev.transcript}]);
          if(ev.type==="input_audio_buffer.speech_started") setVoiceState("listening");
          if(ev.type==="response.audio.started") setVoiceState("speaking");
          if(ev.type==="response.audio.done") setVoiceState("listening");

          // Tool call accumulation
          if(ev.type==="response.output_item.added" && ev.item?.type==="function_call"){
            pendingCalls[ev.item.call_id] = { name: ev.item.name, args:"" };
          }
          if(ev.type==="response.function_call_arguments.delta" && ev.call_id){
            if(pendingCalls[ev.call_id]) pendingCalls[ev.call_id].args += ev.delta;
          }
          if(ev.type==="response.function_call_arguments.done" && ev.call_id){
            const call = pendingCalls[ev.call_id];
            if(!call) return;
            let args: Record<string,unknown> = {};
            try { args = JSON.parse(ev.arguments ?? call.args); } catch {}
            delete pendingCalls[ev.call_id];

            if(call.name==="generate_scene")
              handleGenerateScene(args as Parameters<typeof handleGenerateScene>[0], ev.call_id);
            if(call.name==="request_stitch")
              handleRequestStitch(args as Parameters<typeof handleRequestStitch>[0], ev.call_id);
          }
        } catch {}
      };
      dc.onopen = ()=>setVoiceState("listening");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        {
          method:"POST",
          headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/sdp" },
          body: offer.sdp,
        }
      );
      if(!sdpRes.ok) throw new Error("SDP exchange failed");
      await pc.setRemoteDescription({ type:"answer", sdp: await sdpRes.text() });

    } catch(err) {
      console.error("Realtime session error:", err);
      setVoiceState("error");
      stopSession();
    }
  },[voiceState,stopSession,startLevelLoop,handleGenerateScene,handleRequestStitch]);

  useEffect(()=>()=>stopSession(),[stopSession]);

  // Generation progress simulator
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

  const saveToVault = useCallback(async()=>{
    const p = projectRef.current;
    const sr = p.stitchResult;
    await fetch("/api/matinee/gallery", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        title: p.title,
        filmTitle: sr?.filmTitle ?? p.title,
        sceneCount: p.scenes.length,
        tier: p.tier,
        style: p.style,
        narrativeArc: sr?.narrativeArc,
        estimatedRuntime: sr?.estimatedRuntime,
        colorGrade: sr?.editorial?.colorConsistency?.grade,
        editorialNote: sr?.editorial?.filmNote,
        videoUrl: p.scenes.find(s=>s.status==="ready")?.videoUrl,
      }),
    });
  },[]);

  const startGeneration = ()=>{
    if(generating) return;
    setGenerating(true);
    setProject(p=>({...p,phase:"generating",progress:0}));
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

        /* ── VOICE ORB ── */
        @keyframes stitch-scan{0%{left:-100%}100%{left:200%}}
        @keyframes orb-idle{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
        @keyframes ring-breathe{0%,100%{transform:scale(1);opacity:.25}50%{transform:scale(1.18);opacity:.08}}
        @keyframes ring-pulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
        @keyframes vera-label{0%,100%{opacity:.4}50%{opacity:.9}}
        @keyframes transcript-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

        .orb-core{
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%,
            rgba(76,175,80,.9) 0%, rgba(27,94,32,.85) 45%, rgba(5,20,5,.95) 100%);
          box-shadow:
            0 0 40px rgba(76,175,80,.4),
            0 0 80px rgba(76,175,80,.15),
            inset 0 1px 0 rgba(180,255,180,.2);
          transition:transform .1s ease-out,box-shadow .15s ease;
          position:relative;
        }
        .orb-core.speaking{
          box-shadow:
            0 0 60px rgba(168,230,168,.6),
            0 0 120px rgba(76,175,80,.3),
            inset 0 1px 0 rgba(220,255,220,.3);
          background:radial-gradient(circle at 35% 35%,
            rgba(168,230,168,.95) 0%, rgba(76,175,80,.85) 45%, rgba(10,30,10,.95) 100%);
        }
        .orb-ring{
          position:absolute;border-radius:50%;border:1px solid rgba(76,175,80,.35);
          top:50%;left:50%;transform:translate(-50%,-50%);
          animation:ring-breathe 3s ease-in-out infinite;
        }
        .orb-ring.pulse{animation:ring-pulse 1.2s ease-out infinite;}
        .orb-ring.speaking{border-color:rgba(168,230,168,.45);}

        .transcript-bubble-vera{
          background:rgba(220,60,60,.08);border:1px solid rgba(220,60,60,.15);
          padding:8px 12px;border-radius:12px 12px 12px 2px;margin-right:15%;
          animation:transcript-in .3s ease;
        }
        .transcript-bubble-user{
          background:rgba(200,169,81,.08);border:1px solid rgba(200,169,81,.15);
          padding:8px 12px;border-radius:12px 12px 2px 12px;margin-left:15%;
          animation:transcript-in .3s ease;
        }

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(200,169,81,.3);border-radius:2px}

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
            {sceneBuilding && (
              <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"#c8a951",animation:"pulse-dot 1s ease-in-out infinite"}}>
                ● Queuing "{sceneBuilding}"…
              </span>
            )}
            <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:10,color:"rgba(232,220,200,.3)"}}>
              {project.scenes.filter(s=>s.status==="ready").length}/{project.scenes.length} scenes ready
            </span>
            <button onClick={startGeneration} disabled={generating||stitching} style={{
              fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",
              padding:"8px 20px",background:(generating||stitching)?"#333":"linear-gradient(135deg,#1a4a1a,#2d7a2d,#4CAF50)",
              color:(generating||stitching)?"#666":"#fff",border:"none",cursor:(generating||stitching)?"default":"pointer",
              transition:"opacity .2s",animation:generating?"gen-blink 1s ease-in-out infinite":"none",
            }}>
              {stitching?"◈ Assembling…":generating?"● Generating…":"⬤ Start Production"}
            </button>
            {project.phase==="complete" && (
              <button onClick={saveToVault} style={{
                fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",
                padding:"8px 16px",background:"rgba(200,169,81,.1)",
                border:"1px solid rgba(200,169,81,.3)",color:"#c8a951",cursor:"pointer",
              }}>
                ⊞ Save to Vault
              </button>
            )}
            <Link href="/matinee/gallery" style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(76,175,80,.6)",textDecoration:"none",textTransform:"uppercase"}}>
              Gallery →
            </Link>
            <Link href="/matinee" style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(232,220,200,.4)",textDecoration:"none",textTransform:"uppercase"}}>
              ← Back
            </Link>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        {(project.phase==="generating"||project.phase==="stitching") && (
          <div style={{height:2,background:"rgba(255,255,255,.05)",position:"relative",overflow:"hidden"}}>
            <div style={{
              position:"absolute",left:0,top:0,height:"100%",
              width: project.phase==="stitching"?"100%":`${project.progress}%`,
              background: project.phase==="stitching"
                ? "linear-gradient(to right,#1a4a1a,#4CAF50,#a8e6a8,#4CAF50)"
                : "linear-gradient(to right,#1a4a1a,#2d7a2d,#4CAF50,#2d7a2d)",
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

            {/* ── SIDE A: VERA — VOICE DIRECTOR ── */}
            <div style={{
              borderRight:"1px solid rgba(255,255,255,.06)",
              display:"flex",flexDirection:"column",background:"rgba(6,4,10,.95)",
            }}>
              {/* Panel header */}
              <div style={{
                padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"rgba(4,3,8,.98)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{display:"flex",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
                  </div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:"rgba(232,220,200,.6)",textTransform:"uppercase",marginLeft:4}}>
                    Vera · Director · Side A
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{
                    width:6,height:6,borderRadius:"50%",
                    background:voiceState==="error"?"#ff4444":voiceState==="idle"?"rgba(255,255,255,.2)":"#28c840",
                    boxShadow:voiceState==="listening"||voiceState==="speaking"?"0 0 8px #28c840":"none",
                    animation:voiceState==="connecting"?"pulse-dot 0.6s ease-in-out infinite":"none",
                  }}/>
                  <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,
                    color:voiceState==="error"?"#ff4444":voiceState==="idle"?"rgba(255,255,255,.3)":voiceState==="connecting"?"#c8a951":"#28c840"}}>
                    GPT-4o Realtime ·{" "}
                    {voiceState==="idle"?"Offline":voiceState==="connecting"?"Connecting…":voiceState==="listening"?"Listening":voiceState==="speaking"?"Vera Speaking":"Error"}
                  </span>
                </div>
              </div>

              {/* ── ORB AREA ── */}
              <div style={{
                flex:"0 0 auto",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                padding:"40px 20px 28px",
                background:"radial-gradient(ellipse at 50% 60%, rgba(10,50,10,.45) 0%, transparent 70%)",
                position:"relative",
              }}>
                {/* Outer ambient glow rings */}
                {[180,148,116].map((sz,i)=>(
                  <div key={i} className={`orb-ring${voiceState==="speaking"?" speaking":""}`} style={{
                    width:sz+orbLevel*60,height:sz+orbLevel*60,
                    animationDelay:`${i*0.8}s`,
                    animationDuration:`${3+i*0.4}s`,
                    opacity: voiceState==="idle"?0.08:0.18-i*0.04,
                  }}/>
                ))}

                {/* Pulse ring — fires when speaking */}
                {voiceState==="speaking" && [0,1].map(i=>(
                  <div key={i} className="orb-ring pulse speaking" style={{
                    width:94,height:94,
                    animationDelay:`${i*0.6}s`,
                    animationDuration:"1.4s",
                  }}/>
                ))}

                {/* ── THE ORB ── */}
                <button
                  onClick={startSession}
                  className={`orb-core${voiceState==="speaking"?" speaking":""}`}
                  style={{
                    width:90,height:90,
                    transform:`scale(${1+orbLevel*0.18})`,
                    animation:voiceState==="idle"?"orb-idle 4s ease-in-out infinite":"none",
                    cursor:"pointer",border:"none",outline:"none",flexShrink:0,
                    zIndex:2,position:"relative",
                  }}
                >
                  {/* Inner highlight */}
                  <div style={{
                    position:"absolute",top:"18%",left:"22%",
                    width:"30%",height:"22%",borderRadius:"50%",
                    background:"rgba(255,255,255,.25)",filter:"blur(4px)",
                  }}/>
                  {/* State icon */}
                  <div style={{
                    position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:voiceState==="idle"?20:18,
                    color:"rgba(255,255,255,.85)",
                  }}>
                    {voiceState==="idle"?"▶":voiceState==="connecting"?"…":voiceState==="listening"?"◉":voiceState==="speaking"?"♪":"✕"}
                  </div>
                </button>

                {/* Name + state label */}
                <div style={{textAlign:"center",marginTop:20,zIndex:2}}>
                  <div style={{
                    fontFamily:"'Cinzel Decorative',serif",fontSize:15,fontWeight:700,
                    background:"linear-gradient(135deg,#1b5e20,#4CAF50,#a8e6a8)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    backgroundClip:"text",letterSpacing:3,
                    animation:"vera-label 3s ease-in-out infinite",
                  }}>VERA</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,
                    color:"rgba(232,220,200,.35)",textTransform:"uppercase",marginTop:4}}>
                    Award-Winning Cinematographer
                  </div>
                  <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,
                    color:"rgba(232,220,200,.2)",marginTop:6,letterSpacing:1}}>
                    {voiceState==="idle"?"Click orb to connect":
                     voiceState==="connecting"?"Opening secure channel…":
                     voiceState==="listening"?"She's listening…":
                     voiceState==="speaking"?"Vera is speaking…":
                     "Tap to reconnect"}
                  </div>
                </div>
              </div>

              {/* ── TRANSCRIPT scroll ── */}
              <div style={{
                flex:1,overflowY:"auto",padding:"12px 16px",
                display:"flex",flexDirection:"column",gap:8,minHeight:0,
                borderTop:"1px solid rgba(255,255,255,.04)",
              }}>
                {transcript.length===0 && (
                  <div style={{
                    flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,
                    color:"rgba(232,220,200,.15)",textAlign:"center",lineHeight:2,
                    textTransform:"uppercase",
                  }}>
                    Conversation transcript<br/>appears here
                  </div>
                )}
                {transcript.map((t,i)=>(
                  <div key={i} className={t.role==="vera"?"transcript-bubble-vera":"transcript-bubble-user"}>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,letterSpacing:1,
                      color:t.role==="vera"?"rgba(220,60,60,.6)":"rgba(200,169,81,.5)",
                      marginBottom:4,textTransform:"uppercase"}}>
                      {t.role==="vera"?"Vera":"You"}
                    </div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,220,200,.8)",lineHeight:1.7}}>
                      {t.text}
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef}/>
              </div>

              {/* Footer — voice hint */}
              <div style={{padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,.05)",background:"rgba(4,3,8,.98)"}}>
                <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(232,220,200,.2)",letterSpacing:1,textAlign:"center"}}>
                  {voiceState==="idle"
                    ?"Voice-powered · GPT-4o Realtime · Click orb to start"
                    :"Speak naturally — Vera will guide your production"}
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
                ) : project.phase==="stitching" ? (
                  <div style={{textAlign:"center",padding:"40px"}}>
                    <div style={{width:48,height:48,borderRadius:"50%",border:"2px solid rgba(76,175,80,.3)",
                      borderTopColor:"#4CAF50",margin:"0 auto 20px",
                      animation:"scan-v 1s linear infinite"}}/>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#4CAF50",letterSpacing:2,marginBottom:8}}>
                      Auto-Stitch Agent Running
                    </div>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:9,color:"rgba(232,220,200,.4)",letterSpacing:1,lineHeight:2}}>
                      Analysing scenes · Designing editorial cuts<br/>
                      Calculating transitions · Building film playlist
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:"center",padding:"40px"}}>
                    <div style={{fontSize:32,marginBottom:16,opacity:.3}}>🎬</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(232,220,200,.3)",letterSpacing:2,lineHeight:1.8}}>
                      {voiceState==="idle"
                        ? <>Connect to Vera and describe<br/>your first scene to begin.</>
                        : <>Tell Vera what you want to film —<br/>she'll build it automatically.</>}
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

              {/* ── STITCH RESULT ── */}
              {project.stitchResult && (
                <div style={{
                  borderTop:"1px solid rgba(76,175,80,.2)",
                  background:"rgba(20,40,20,.6)",
                  padding:"12px 16px",
                  maxHeight:160,overflowY:"auto",
                }}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:11,
                      background:"linear-gradient(135deg,#2d7a2d,#4CAF50,#a8e6a8)",
                      WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                      letterSpacing:2}}>
                      ◈ FILM ASSEMBLED · {project.stitchResult.totalScenes} SCENES
                    </div>
                    <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(76,175,80,.6)"}}>
                      {project.stitchResult.estimatedRuntime}
                    </span>
                  </div>
                  {project.stitchResult.editorial?.colorConsistency && (
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(232,220,200,.45)",lineHeight:1.7,marginBottom:6}}>
                      <span style={{color:"rgba(76,175,80,.7)"}}>COLOR GRADE</span>{" "}
                      {project.stitchResult.editorial.colorConsistency.grade}
                    </div>
                  )}
                  {project.stitchResult.editorial?.pacing && (
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:8,color:"rgba(232,220,200,.45)",lineHeight:1.7,marginBottom:6}}>
                      <span style={{color:"rgba(76,175,80,.7)"}}>PACING</span>{" "}
                      {project.stitchResult.editorial.pacing.overallTempo} — {project.stitchResult.editorial.pacing.note}
                    </div>
                  )}
                  {project.stitchResult.editorial?.filmNote && (
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(232,220,200,.55)",
                      lineHeight:1.75,borderTop:"1px solid rgba(76,175,80,.1)",paddingTop:8,marginTop:4,
                      fontStyle:"italic"}}>
                      "{project.stitchResult.editorial.filmNote}"
                    </div>
                  )}
                </div>
              )}

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
