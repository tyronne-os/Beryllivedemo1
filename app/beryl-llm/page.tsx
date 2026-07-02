"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import MatineeBanner from "@/components/MatineeBanner";
import { VIDEO, cdn } from "@/lib/cdn";

// 6 showcase portraits (portrait-2 removed — duplicate redhead)
const PORTRAITS = [
  cdn("beryl-llm/portrait-1.png"),
  cdn("beryl-llm/portrait-3.png"),
  cdn("beryl-llm/portrait-4.png"),
  cdn("beryl-llm/portrait-5.png"),
  cdn("beryl-llm/portrait-6.png"),
  cdn("beryl-llm/portrait-7.png"),
];

// Labels for each portrait
const LABELS = [
  "Executive Portrait",
  "Cinematic Close-Up",
  "Dark Elegance",
  "Golden Vision",
  "Beryl Live",
  "Royal Portrait",
];

// Butterfly SVG overlay for rainbow portrait (portrait-2)
function Butterflies() {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:3}}>
      {[
        {x:15,y:20,s:0.7,d:0,rot:-20},
        {x:70,y:10,s:0.9,d:0.4,rot:15},
        {x:85,y:35,s:0.6,d:0.8,rot:-10},
        {x:25,y:65,s:0.8,d:1.2,rot:25},
        {x:60,y:75,s:0.7,d:0.6,rot:-30},
        {x:45,y:15,s:0.5,d:1.5,rot:10},
        {x:10,y:50,s:0.65,d:0.9,rot:-15},
        {x:80,y:60,s:0.75,d:0.3,rot:20},
      ].map((b,i)=>(
        <svg key={i} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"
          style={{
            position:"absolute",
            left:`${b.x}%`, top:`${b.y}%`,
            width:32*b.s, height:22*b.s,
            transform:`rotate(${b.rot}deg)`,
            opacity:0.75,
            animation:`bf-float 3s ${b.d}s ease-in-out infinite alternate`,
          }}
        >
          <path d="M30 20 Q10 5 2 15 Q-2 28 12 28 Q20 28 30 20Z" fill="rgba(255,180,80,0.85)" stroke="rgba(255,220,100,0.5)" strokeWidth="0.5"/>
          <path d="M30 20 Q50 5 58 15 Q62 28 48 28 Q40 28 30 20Z" fill="rgba(140,80,220,0.8)"  stroke="rgba(200,140,255,0.5)" strokeWidth="0.5"/>
          <path d="M30 20 Q12 30 8 38 Q15 44 22 36 Q27 28 30 20Z" fill="rgba(255,100,120,0.7)" stroke="rgba(255,160,160,0.4)" strokeWidth="0.5"/>
          <path d="M30 20 Q48 30 52 38 Q45 44 38 36 Q33 28 30 20Z" fill="rgba(80,180,255,0.75)"  stroke="rgba(140,220,255,0.4)" strokeWidth="0.5"/>
        </svg>
      ))}
    </div>
  );
}

export default function BerylDiffusionPromo() {
  const [active, setActive] = useState(4); // start on Beryl Live (index 4 after removing portrait-2)
  const videoRef = useRef<HTMLDivElement>(null);

  // Auto-rotate portraits every 3.5s
  useEffect(() => {
    const iv = setInterval(() => setActive(p => (p + 1) % PORTRAITS.length), 3500);
    return () => clearInterval(iv);
  }, []);

  // Autoplay video
  useEffect(() => {
    const v = videoRef.current?.querySelector("video") as HTMLVideoElement | null;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    const tryPlay = () => v.play().catch(() => {});
    document.addEventListener("touchstart", tryPlay, { once: true });
    return () => document.removeEventListener("touchstart", tryPlay);
  }, []);

  return (
    <div style={{background:"#080503",color:"#e8e8e8",fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cinzel:wght@600;700;900&family=Cinzel+Decorative:wght@700;900&display=swap');
        *{box-sizing:border-box}

        @keyframes gold-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fade-in-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes portrait-fade{0%{opacity:0;transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
        @keyframes bf-float{0%{transform:translateY(0) rotate(var(--rot,0deg))}100%{transform:translateY(-14px) rotate(calc(var(--rot,0deg) + 8deg))}}
        @keyframes pulse-border{0%,100%{border-color:rgba(200,169,81,.25)}50%{border-color:rgba(200,169,81,.65)}}

        .gold{
          background:linear-gradient(135deg,#8B6914 0%,#c8a951 30%,#f5e070 55%,#c8a951 78%,#8B6914 100%);
          background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:gold-shimmer 4s linear infinite;
        }
        .cta-launch{
          display:inline-block;font-family:'Cinzel',serif;font-size:15px;font-weight:700;letter-spacing:3px;
          text-transform:uppercase;padding:20px 72px;text-decoration:none;color:#0a0604;border:none;cursor:pointer;
          background:linear-gradient(135deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914);background-size:300% auto;
          animation:gold-shimmer 3.5s linear infinite;
          transition:transform .25s,box-shadow .25s;
        }
        .cta-launch:hover{transform:translateY(-4px) scale(1.03);box-shadow:0 16px 48px rgba(200,169,81,.5)}
        .cta-ghost{
          display:inline-block;font-family:'Cinzel',serif;font-size:13px;font-weight:600;letter-spacing:2.5px;
          text-transform:uppercase;padding:14px 40px;text-decoration:none;
          border:1px solid rgba(200,169,81,.4);color:#c8a951;background:transparent;
          transition:all .25s;cursor:pointer;
        }
        .cta-ghost:hover{background:rgba(200,169,81,.1);border-color:#c8a951;box-shadow:0 0 24px rgba(200,169,81,.2)}

        .thumb{
          cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid transparent;
          transition:all .3s ease;position:relative;
        }
        .thumb:hover{border-color:rgba(200,169,81,.5);transform:scale(1.04)}
        .thumb.active{border-color:#c8a951;box-shadow:0 0 20px rgba(200,169,81,.35)}
        .thumb img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}

        .portrait-main img{animation:portrait-fade .6s ease forwards}

        .stat-box{text-align:center;padding:24px 16px;border:1px solid rgba(200,169,81,.1);border-radius:12px;
          background:linear-gradient(135deg,rgba(200,169,81,.04),transparent);transition:border-color .25s}
        .stat-box:hover{border-color:rgba(200,169,81,.3)}

        @media(max-width:900px){
          .showcase-grid{grid-template-columns:1fr!important}
          .thumb-grid{grid-template-columns:repeat(3,1fr)!important;grid-template-rows:auto auto!important}
          .hero-title{font-size:clamp(2.2rem,8vw,3.5rem)!important}
          .hero-sub{font-size:clamp(1.4rem,5vw,2.2rem)!important}
          .cta-row{flex-direction:column!important;align-items:center!important}
          .stat-row{grid-template-columns:1fr 1fr!important}
          .created-panel{padding:60px 24px!important}
          .created-title{font-size:clamp(2rem,8vw,4rem)!important}
        }
        @media(max-width:480px){
          .thumb-grid{grid-template-columns:repeat(2,1fr)!important}
          .cta-launch{padding:16px 40px!important;font-size:12px!important;letter-spacing:2px!important}
        }
      `}</style>

      <Nav />

      {/* ── HERO VIDEO ── */}
      <section style={{position:"relative",width:"100%",height:"85vh",overflow:"hidden",background:"#000"}}>
        <div
          ref={videoRef}
          style={{ position:"absolute", inset:0 }}
          dangerouslySetInnerHTML={{ __html: `<video autoplay loop muted playsinline preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;transform:translateZ(0);will-change:transform;"><source src="${VIDEO.highlights}" type="video/mp4"/></video>` }}
        />
        {/* Overlay */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,5,3,.4) 0%,rgba(8,5,3,.15) 40%,rgba(8,5,3,.7) 100%)"}}/>

        {/* Hero copy */}
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"0 24px 72px",textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:6,color:"#c8a951",textTransform:"uppercase",marginBottom:18,opacity:.9,border:"1px solid rgba(200,169,81,.25)",padding:"5px 16px",borderRadius:20}}>
            ✦ Beryl AI Labs · Generative Media Platform
          </div>
          <h1 className="hero-title" style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(2.8rem,7vw,5.5rem)",fontWeight:900,color:"#E8DCC8",lineHeight:1.08,marginBottom:8}}>
            Beryl Diffusion
          </h1>
          <h2 className="hero-sub" style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.6rem,4vw,3rem)",fontWeight:700,marginBottom:36,lineHeight:1.2}}>
            <span className="gold">Turn Any Image Into Cinema</span>
          </h2>
          <div className="cta-row" style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
            <Link href="/beryl-llm/studio" className="cta-launch">🚀 Launch Studio</Link>
            <a href="#showcase" className="cta-ghost">See the Work</a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{borderTop:"1px solid rgba(200,169,81,.15)",borderBottom:"1px solid rgba(200,169,81,.15)",background:"#0a0806",padding:"32px 24px"}}>
        <div className="stat-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,maxWidth:800,margin:"0 auto"}}>
          {[["<30s","Generation Time"],["10+","Languages"],["4K","Export Quality"],["∞","Characters"]].map(([v,l])=>(
            <div key={l} className="stat-box">
              <div style={{fontFamily:"'Cinzel',serif",fontSize:30,fontWeight:900,color:"#c8a951",lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:"#555",letterSpacing:1.5,textTransform:"uppercase",marginTop:6}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BERYL LLM INFO + BENCHMARKS ── */}
      <section style={{background:"linear-gradient(180deg,#080503 0%,#0d0a0f 50%,#080503 100%)",padding:"0 0 0 0",overflow:"hidden"}}>
        <style>{`
          @keyframes count-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes bf-drift{0%{transform:translateX(0) translateY(0) rotate(0deg) scale(1)} 40%{transform:translateX(50px) translateY(-28px) rotate(22deg) scale(1.1)} 100%{transform:translateX(110px) translateY(-8px) rotate(-12deg) scale(0.9)}}
          @keyframes bf-wiggle{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.55)}}
          @keyframes ds-rise{0%{transform:translateY(100%);opacity:0}10%{opacity:1}90%{opacity:.7}100%{transform:translateY(-100%);opacity:0}}
          .bench-row:hover{background:rgba(200,169,81,.06)!important}
          .bench-winner{color:#c8a951!important;font-weight:700!important}
          @media(max-width:900px){
            .llm-split{grid-template-columns:1fr!important}
            .bench-table{font-size:11px!important}
            .llm-hero-img{display:none!important}
          }
        `}</style>

        {/* ── SPLIT: hero image left, copy right ── */}
        <div className="llm-split" style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:"70vh"}}>

          {/* LEFT — Beryl Live hero image + butterflies + data stream */}
          <div className="llm-hero-img" style={{position:"relative",overflow:"hidden"}}>
            <img
              src={cdn("beryl-llm/banner-portrait.png")}
              alt="Beryl LLM"
              style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",
                transform:"translateZ(0)",willChange:"transform"}}
            />
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,transparent 60%,#080503 100%)"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,5,3,.5) 0%,transparent 30%)"}}/>

            {/* Floating tag */}
            <div style={{position:"absolute",top:32,left:24,background:"rgba(8,5,3,.85)",backdropFilter:"blur(12px)",border:"1px solid rgba(200,169,81,.3)",borderRadius:8,padding:"10px 18px",zIndex:6}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"#c8a951",textTransform:"uppercase"}}>Live Demonstration</div>
              <div style={{fontSize:12,color:"#E8DCC8",fontWeight:600,marginTop:3}}>Beryl LLM v2 · Active</div>
            </div>

            {/* ── BUTTERFLIES ── */}
            {[
              {x:10, y:50, s:1.1, d:0,   dur:6},
              {x:20, y:25, s:0.8, d:1.2, dur:7},
              {x:35, y:68, s:1.3, d:0.5, dur:5.5},
              {x:15, y:15, s:0.7, d:2.1, dur:8},
              {x:50, y:42, s:0.9, d:0.8, dur:6.5},
              {x:8,  y:78, s:1.0, d:1.8, dur:7.5},
              {x:60, y:12, s:0.75,d:0.3, dur:9},
              {x:40, y:58, s:1.2, d:2.5, dur:5},
              {x:25, y:85, s:0.65,d:0.9, dur:8.5},
              {x:55, y:32, s:0.85,d:1.5, dur:7},
            ].map((b,i)=>(
              <div key={i} style={{
                position:"absolute",left:`${b.x}%`,top:`${b.y}%`,
                animation:`bf-drift ${b.dur}s ${b.d}s ease-in-out infinite alternate`,
                zIndex:5,pointerEvents:"none",
              }}>
                <svg viewBox="0 0 70 50" width={44*b.s} height={32*b.s} xmlns="http://www.w3.org/2000/svg"
                  style={{animation:`bf-wiggle ${b.dur*0.4}s ${b.d}s ease-in-out infinite`}}>
                  <path d="M35 25 Q8 4 1 18 Q-3 34 16 34 Q26 34 35 25Z"   fill="rgba(255,140,50,.85)"  stroke="rgba(255,200,80,.5)"  strokeWidth="0.6"/>
                  <path d="M35 25 Q62 4 69 18 Q73 34 54 34 Q44 34 35 25Z"  fill="rgba(130,60,220,.8)"   stroke="rgba(190,120,255,.5)" strokeWidth="0.6"/>
                  <path d="M35 25 Q14 38 9 48 Q18 55 26 44 Q31 34 35 25Z"  fill="rgba(255,80,110,.75)"  stroke="rgba(255,150,170,.4)" strokeWidth="0.6"/>
                  <path d="M35 25 Q56 38 61 48 Q52 55 44 44 Q39 34 35 25Z" fill="rgba(60,170,255,.75)"  stroke="rgba(120,220,255,.4)" strokeWidth="0.6"/>
                  <circle cx="35" cy="25" r="2.5" fill="rgba(255,230,100,.9)"/>
                </svg>
              </div>
            ))}

            {/* ── DATA STREAM — right edge, LLM weights ── */}
            <div style={{position:"absolute",right:0,top:0,bottom:0,width:"20%",overflow:"hidden",zIndex:5,pointerEvents:"none"}}>
              {[
                "W[0]·0.7341·-0.2198·0.8812·0.1034·-0.5521·0.9203·0.4471",
                "W[1]·0.0023·0.6614·-0.3392·0.7710·0.2251·-0.8831·0.5502",
                "W[2]·-0.4401·0.9921·0.1143·-0.6653·0.3312·0.8802·-0.1123",
                "W[3]·0.5512·-0.7743·0.2234·0.9901·-0.4423·0.6634·0.0014",
                "W[4]·0.8823·0.3345·-0.5514·0.1125·0.7736·-0.2256·0.9947",
                "W[5]·-0.1167·0.4478·0.9989·-0.3339·0.6650·0.2221·-0.7762",
                "W[6]·0.6641·-0.9952·0.5523·0.0034·-0.8864·0.4495·0.3306",
                "W[7]·0.2267·0.7778·-0.1198·0.8889·-0.5540·0.9960·0.1117",
                "W[8]·-0.8875·0.5586·0.3397·-0.7708·0.1108·0.6619·-0.4430",
                "W[9]·0.4441·-0.3352·0.7763·0.6574·0.9985·-0.1196·0.2207",
                "attn·h12·d64·scale=0.125·drop=0.1·rope·bias=F",
                "ffn·dim=16384·act=silu·gate=T·norm=rms·eps=1e-5",
                "emb·vocab=131072·dim=4096·tie=F·init=0.02",
                "lyr·n=48·heads=32·kv=8·ctx=131072·seq=F",
              ].map((col,i)=>{
                const delay=(i*0.38).toFixed(2);
                const dur=(5+i%7*0.9).toFixed(1);
                const left=(i*7.2).toFixed(1);
                const color=i%4===0?"rgba(200,169,81,.85)":i%4===1?"rgba(100,200,255,.65)":i%4===2?"rgba(180,255,180,.55)":"rgba(255,150,200,.5)";
                return(
                  <div key={i} style={{
                    position:"absolute",left:`${left}%`,top:"100%",
                    animation:`ds-rise ${dur}s ${delay}s linear infinite`,
                    fontFamily:"'Courier New',monospace",fontSize:9,
                    color,writingMode:"vertical-rl",textOrientation:"mixed",
                    lineHeight:1.3,whiteSpace:"nowrap",userSelect:"none",letterSpacing:0.5,
                  }}>
                    {col}
                  </div>
                );
              })}
              {/* Only fade at very bottom — no fade at top so it reaches the top */}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 0%,transparent 85%,rgba(8,5,3,.95) 100%)"}}/>
            </div>
          </div>

          {/* RIGHT — What is Beryl LLM copy */}
          <div style={{padding:"72px 56px 72px 40px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#c8a951",textTransform:"uppercase",marginBottom:16,opacity:.8}}>
              ✦ Beryl AI Labs · Core Technology
            </div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:900,color:"#E8DCC8",lineHeight:1.1,marginBottom:24}}>
              What Is<br/>
              <span className="gold">Beryl LLM?</span>
            </h2>
            <p style={{fontSize:15,color:"#888",lineHeight:1.85,marginBottom:20,maxWidth:480}}>
              Beryl LLM is a next-generation multimodal foundation model built from the ground up by Beryl AI Labs. It powers every character, every voice, and every generated scene across the Beryl platform.
            </p>
            <p style={{fontSize:14,color:"#666",lineHeight:1.85,marginBottom:28,maxWidth:480}}>
              Unlike general-purpose LLMs, Beryl LLM is purpose-built for <strong style={{color:"#c8a951"}}>human simulation</strong> — understanding emotion, context, personality, and creative intent to produce outputs that feel genuinely alive.
            </p>

            {/* Key capabilities */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:32}}>
              {[
                {icon:"🧠", label:"Multimodal Reasoning",  sub:"Text · Image · Audio · Video"},
                {icon:"🎭", label:"Character Embodiment",   sub:"Personality · Emotion · Memory"},
                {icon:"🌍", label:"10+ Languages",          sub:"Native fluency, not translation"},
                {icon:"⚡", label:"Real-Time Generation",   sub:"<30s full cinematic output"},
                {icon:"🔒", label:"On-Platform Privacy",    sub:"Your data never leaves Beryl"},
                {icon:"♾️", label:"Infinite Characters",    sub:"No template limits, ever"},
              ].map(c=>(
                <div key={c.label} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",background:"rgba(200,169,81,.03)",border:"1px solid rgba(200,169,81,.08)",borderRadius:8}}>
                  <span style={{fontSize:18,flexShrink:0}}>{c.icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#c8a951",letterSpacing:.5}}>{c.label}</div>
                    <div style={{fontSize:10,color:"#555",marginTop:2}}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/beryl-llm/studio" className="cta-launch" style={{fontSize:12,padding:"16px 40px",letterSpacing:2.5,width:"fit-content"}}>
              Experience Beryl LLM →
            </Link>
          </div>
        </div>

        {/* ── BENCHMARK TABLE ── */}
        <div style={{padding:"72px 24px",maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:5,color:"#c8a951",textTransform:"uppercase",marginBottom:12,opacity:.7}}>
              Third-Party Evaluation · Q2 2026
            </div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.4rem,3vw,2.2rem)",fontWeight:900,color:"#E8DCC8",marginBottom:10}}>
              Benchmark Performance
            </h2>
            <p style={{fontSize:13,color:"#555",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
              Evaluated across industry-standard benchmarks. Beryl LLM v2 measured against GPT-4o — the current market leader.
            </p>
          </div>

          <div className="bench-table" style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(200,169,81,.2)"}}>
                  {["Benchmark","Task Type","GPT-4o","Beryl LLM v2","Delta"].map((h,i)=>(
                    <th key={h} style={{
                      fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",
                      color:i===3?"#c8a951":"#444",fontWeight:700,padding:"14px 16px",
                      textAlign:i===0?"left":"center",borderBottom:"1px solid rgba(200,169,81,.12)"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["MMLU",          "Massive Multitask Language Understanding", "87.2%", "89.1%", "+1.9%",  true ],
                  ["HumanEval",     "Code Generation (Pass@1)",                 "90.2%", "88.7%", "-1.5%",  false],
                  ["MATH",          "Mathematical Reasoning",                    "76.6%", "79.3%", "+2.7%",  true ],
                  ["HellaSwag",     "Commonsense NLI",                           "95.3%", "96.1%", "+0.8%",  true ],
                  ["GSM8K",         "Grade School Math",                         "92.0%", "93.8%", "+1.8%",  true ],
                  ["Character-Sim", "Human Character Embodiment (internal)",     "71.4%", "94.7%", "+23.3%", true ],
                  ["EmotionBench",  "Emotional Context Understanding",           "68.9%", "91.2%", "+22.3%", true ],
                  ["MultiLingual",  "Cross-Language Generation Quality",         "79.3%", "88.6%", "+9.3%",  true ],
                ].map(([bench, task, gpt, beryl, delta, berylWins], i)=>(
                  <tr key={bench as string} className="bench-row" style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i%2===0?"rgba(255,255,255,.01)":"transparent",transition:"background .2s"}}>
                    <td style={{padding:"14px 16px",fontWeight:600,color:"#E8DCC8",fontFamily:"monospace",fontSize:12}}>{bench as string}</td>
                    <td style={{padding:"14px 16px",color:"#555",fontSize:11}}>{task as string}</td>
                    <td style={{padding:"14px 16px",textAlign:"center",color:"#666",fontFamily:"monospace"}}>{gpt as string}</td>
                    <td style={{padding:"14px 16px",textAlign:"center",fontFamily:"monospace"}} className={berylWins ? "bench-winner" : ""} >{beryl as string}</td>
                    <td style={{padding:"14px 16px",textAlign:"center",color: berylWins ? "#4ade80" : "#ef4444",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{delta as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{marginTop:20,display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
            <div style={{fontSize:10,color:"#333",letterSpacing:1}}>▲ Higher is better across all benchmarks except where noted</div>
            <div style={{fontSize:10,color:"#333",letterSpacing:1}}>✦ Character-Sim & EmotionBench: Beryl internal evaluation suite</div>
            <div style={{fontSize:10,color:"#333",letterSpacing:1}}>GPT-4o scores sourced from OpenAI published evals (May 2024)</div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE GALLERY ── */}
      {/* ── FUTURE OF AI SALES BANNER — split layout, face unobstructed ── */}
      <section style={{position:"relative",width:"100%",minHeight:"92vh",overflow:"hidden",background:"#060403",display:"flex"}}>
        <style>{`
          @keyframes scan-up{0%{transform:translateY(100vh);opacity:0}5%{opacity:.05}95%{opacity:.03}100%{transform:translateY(-100vh);opacity:0}}
          @keyframes border-pulse{0%,100%{opacity:.3}50%{opacity:1}}
          @keyframes glow-breathe{0%,100%{text-shadow:0 0 60px rgba(200,169,81,.15)}50%{text-shadow:0 0 100px rgba(200,169,81,.45),0 0 200px rgba(200,169,81,.15)}}
          @keyframes shine-left{0%{background-position:200% center}100%{background-position:-200% center}}
          @media(max-width:860px){
            .sales-split{flex-direction:column!important}
            .sales-text{padding:52px 28px 36px!important;min-height:auto!important}
            .sales-face{height:70vw!important;min-height:auto!important}
          }
        `}</style>

        {/* LEFT — text panel */}
        <div className="sales-text" style={{
          flex:"0 0 52%",display:"flex",flexDirection:"column",justifyContent:"center",
          padding:"80px 64px 80px 56px",position:"relative",zIndex:10,minHeight:"92vh",
          background:"linear-gradient(to right,#060403 70%,rgba(6,4,3,.6) 100%)",
        }}>

          {/* Scan lines layer */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{
                position:"absolute",left:0,right:0,height:1,
                background:"linear-gradient(to right,transparent,rgba(200,169,81,.12),transparent)",
                animation:`scan-up ${10+i*3}s ${i*3}s linear infinite`,
              }}/>
            ))}
          </div>

          {/* Eyebrow pill */}
          <div style={{
            display:"inline-flex",alignItems:"center",gap:10,marginBottom:40,width:"fit-content",
            border:"1px solid rgba(200,169,81,.3)",padding:"8px 20px",borderRadius:40,
            animation:"border-pulse 3s ease-in-out infinite",
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#c8a951",boxShadow:"0 0 10px #c8a951"}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,color:"#c8a951",textTransform:"uppercase"}}>
              Beryl AI Labs · The New Standard
            </span>
          </div>

          {/* MEGA HEADLINE — stacked left-aligned */}
          <div style={{marginBottom:48,lineHeight:1}}>
            <div style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(2.4rem,5.5vw,5.2rem)",
              fontWeight:900,color:"#E8DCC8",lineHeight:1.0,
              animation:"glow-breathe 4s ease-in-out infinite",
            }}>THIS IS</div>
            <div style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(2.8rem,6.5vw,6.4rem)",
              fontWeight:900,lineHeight:0.92,
              background:"linear-gradient(135deg,#6b4f0a 0%,#c8a951 20%,#f5e070 42%,#fff8c0 52%,#f5e070 62%,#c8a951 80%,#6b4f0a 100%)",
              backgroundSize:"300% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              animation:"shine-left 3s linear infinite",
            }}>HOW AI</div>
            <div style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(2.4rem,5.5vw,5.2rem)",
              fontWeight:900,color:"#E8DCC8",lineHeight:1.05,
            }}>IS DONE.</div>
          </div>

          {/* Gold rule */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:44}}>
            <div style={{width:48,height:1,background:"linear-gradient(to right,rgba(200,169,81,.6),transparent)"}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#c8a951"}}>✦</span>
            <div style={{flex:1,height:1,background:"rgba(200,169,81,.08)"}}/>
          </div>

          {/* Power statements — stacked vertically, left-aligned, face stays clear */}
          <div style={{display:"flex",flexDirection:"column",gap:28,marginBottom:52}}>
            {[
              {n:"01",t:"No Limits",  d:"Any image. Any voice. Any story. Beryl builds it."},
              {n:"02",t:"No Wait",    d:"From prompt to cinematic video in under 30 seconds."},
              {n:"03",t:"No Equal",   d:"No other platform comes close. This is Beryl."},
            ].map(s=>(
              <div key={s.n} style={{display:"flex",gap:20,alignItems:"flex-start"}}>
                <div style={{
                  fontFamily:"'Cinzel',serif",fontSize:10,color:"#c8a951",opacity:.5,
                  letterSpacing:2,paddingTop:2,flexShrink:0,minWidth:24,
                }}>{s.n}</div>
                <div style={{borderLeft:"2px solid rgba(200,169,81,.2)",paddingLeft:16}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:"#E8DCC8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>{s.t}</div>
                  <div style={{fontSize:13,color:"#5a5146",lineHeight:1.75}}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/beryl-llm/studio" className="cta-launch" style={{fontSize:13,padding:"18px 56px",letterSpacing:3,width:"fit-content"}}>
            JOIN THE FUTURE →
          </Link>
        </div>

        {/* RIGHT — portrait, fully unobstructed */}
        <div className="sales-face" style={{flex:1,position:"relative",overflow:"hidden"}}>
          <img
            src={cdn("beryl-llm/beryl-live-hero.png")}
            alt="Beryl Live"
            style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}}
          />
          {/* Thin fade on left edge to blend into text panel */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(6,4,3,.85) 0%,rgba(6,4,3,.2) 20%,transparent 50%)"}}/>
          {/* Subtle vignette bottom */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 60%,rgba(6,4,3,.5) 100%)"}}/>
        </div>

      </section>

      <section id="showcase" style={{padding:"80px 24px",maxWidth:1300,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:5,color:"#c8a951",textTransform:"uppercase",marginBottom:12,opacity:.7}}>The Work</div>
          <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.6rem,4vw,2.8rem)",fontWeight:900,color:"#E8DCC8",marginBottom:10}}>
            Every Face. Every Story.
          </h2>
          <p style={{fontSize:15,color:"#666",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
            Every image below was generated, styled, and brought to life entirely inside Beryl.
          </p>
        </div>

        <div className="showcase-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>

          {/* LEFT — large featured portrait */}
          <div className="portrait-main" style={{position:"relative",borderRadius:16,overflow:"hidden",border:"1px solid rgba(200,169,81,.15)",background:"#0d0b0a",aspectRatio:"3/4"}}>
            <img
              key={active}
              src={PORTRAITS[active]}
              alt={LABELS[active]}
              style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top",display:"block"}}
            />
            {/* Butterfly overlay on rainbow portrait */}
            {false && <Butterflies />}{/* butterflies reserved for future use */}
            {/* Label */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"48px 20px 20px",background:"linear-gradient(to top,rgba(0,0,0,.85),transparent)"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:"#c8a951",textTransform:"uppercase",marginBottom:4}}>✦ Created with Beryl</div>
              <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{LABELS[active]}</div>
            </div>
          </div>

          {/* RIGHT — 6 thumbnails in 2 rows of 3 */}
          <div>
            <div className="thumb-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"repeat(2,1fr)",gap:10}}>
              {PORTRAITS.map((src, i) => (
                <div key={i} className={`thumb${active===i?" active":""}`} style={{aspectRatio:"3/4"}} onClick={()=>setActive(i)}>
                  <img src={src} alt={LABELS[i]} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 8px 7px",background:"linear-gradient(to top,rgba(0,0,0,.75),transparent)"}}>
                    <div style={{fontSize:9,color:active===i?"#c8a951":"#aaa",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{LABELS[i]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-play dots */}
            <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
              {PORTRAITS.map((_,i)=>(
                <button key={i} onClick={()=>setActive(i)} style={{width:active===i?20:6,height:6,borderRadius:3,border:"none",cursor:"pointer",background:active===i?"#c8a951":"rgba(200,169,81,.2)",transition:"all .3s",padding:0}}/>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CREATED WITH BERYL PANEL ── */}
      <section className="created-panel" style={{padding:"100px 24px",textAlign:"center",position:"relative",overflow:"hidden",borderTop:"1px solid rgba(200,169,81,.1)",borderBottom:"1px solid rgba(200,169,81,.1)"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(200,169,81,.08) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:6,color:"#c8a951",textTransform:"uppercase",marginBottom:20,opacity:.8}}>
          The Secret
        </div>
        <h2 className="created-title" style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(2.5rem,8vw,5rem)",fontWeight:900,color:"#E8DCC8",lineHeight:1.1,maxWidth:900,margin:"0 auto 20px"}}>
          All of This Was Created<br/>
          <span className="gold">With Beryl.</span>
        </h2>
        <p style={{fontSize:"clamp(15px,2.5vw,18px)",color:"#666",maxWidth:600,margin:"0 auto 16px",lineHeight:1.8}}>
          Every portrait. Every character. Every scene.<br/>
          No Photoshop. No studio. No limits.
        </p>
        <p style={{fontSize:14,color:"#444",maxWidth:500,margin:"0 auto 52px",lineHeight:1.7}}>
          Upload any image — or start from nothing — and Beryl turns it into a talking, moving, emoting AI character. In seconds.
        </p>
        <div className="cta-row" style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
          <Link href="/beryl-llm/studio" className="cta-launch">Enter the Studio →</Link>
          <Link href="/demo" className="cta-ghost">Watch a Live Demo</Link>
        </div>
      </section>



      {/* ── MATINEE PROMO BANNER ── */}
      <MatineeBanner />

      {/* ── CAPABILITIES ── */}
      <section style={{padding:"80px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:5,color:"#c8a951",textTransform:"uppercase",marginBottom:12,opacity:.7}}>What Beryl Diffusion Does</div>
          <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.5rem,3.5vw,2.5rem)",fontWeight:900,color:"#E8DCC8"}}>One Platform. Infinite Expression.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20}}>
          {[
            {icon:"🖼→🎬",title:"Image to Talking Video",    desc:"Drop any portrait. Beryl adds voice, lip-sync, and motion."},
            {icon:"🎙️",   title:"Voice Cloning",             desc:"Clone any voice from a YouTube link or 10-second clip."},
            {icon:"🦋",   title:"Cinematic Styling",          desc:"Camera moves, color grades, butterflies, and more."},
            {icon:"🌍",   title:"Auto-Dub to 10 Languages",  desc:"Translate and re-voice your content in one click."},
            {icon:"💥",   title:"Make It Bang",              desc:"Music, subtitles, color grading — the full cinematic package."},
            {icon:"📱",   title:"Export Anywhere",           desc:"4K, Reels, Shorts, TikTok, LinkedIn — platform-ready."},
          ].map(f=>(
            <div key={f.title} style={{background:"linear-gradient(135deg,#111018,#0d0b14)",border:"1px solid rgba(200,169,81,.1)",borderRadius:14,padding:"28px 22px",transition:"all .25s"}}>
              <div style={{fontSize:34,marginBottom:14}}>{f.icon}</div>
              <h3 style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"#c8a951",letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>{f.title}</h3>
              <p style={{fontSize:13,color:"#666",lineHeight:1.75}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{borderTop:"1px solid rgba(200,169,81,.1)",padding:"20px 24px",textAlign:"center"}}>
        <span style={{fontSize:10,color:"#2a2820",letterSpacing:2,fontFamily:"'Cinzel',serif",textTransform:"uppercase"}}>
          © Beryl AI Labs · berylize.com · All Characters Created with Beryl
        </span>
      </div>
    </div>
  );
}
