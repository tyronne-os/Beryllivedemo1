"use client";
import Link from "next/link";

// Static building window patterns — no Math.random() in render
const WINDOWS = [
  [1,0,1,0,0,1,1,0,1,0,1,1],[0,1,0,1,1,0,0,1,0,1,0,1],
  [1,1,0,0,1,0,1,1,0,0,1,0],[0,0,1,1,0,1,0,0,1,1,0,1],
  [1,0,0,1,1,1,0,0,1,0,0,1],[0,1,1,0,0,1,1,0,0,1,1,0],
];
const WIN_COLORS = ["rgba(255,220,80,.6)","rgba(80,160,255,.45)","rgba(255,100,80,.35)"];

const BUILDINGS = [
  {x:0,  y:52,w:62,h:148},{x:68, y:28,w:48,h:172},{x:122,y:68,w:56,h:132},
  {x:184,y:14,w:52,h:186},{x:242,y:58,w:72,h:142},{x:320,y:38,w:52,h:162},
  {x:378,y:80,w:44,h:120},{x:428,y:12,w:68,h:188},{x:502,y:48,w:58,h:152},
  {x:566,y:22,w:50,h:178},{x:622,y:72,w:66,h:128},{x:694,y:40,w:52,h:160},
  // mirror
  {x:752,y:52,w:62,h:148},{x:820,y:28,w:48,h:172},{x:874,y:68,w:56,h:132},
  {x:936,y:14,w:52,h:186},{x:994,y:58,w:72,h:142},{x:1072,y:38,w:52,h:162},
  {x:1130,y:80,w:44,h:120},{x:1180,y:12,w:68,h:188},{x:1254,y:48,w:58,h:152},
  {x:1318,y:22,w:50,h:178},{x:1374,y:72,w:66,h:128},{x:1446,y:40,w:52,h:160},
];

const FILL = ["#0d1828","#0a1220","#080e1a","#0b1525"];

export default function MatineeBanner() {
  return (
    <section style={{
      position:"relative",width:"100%",overflow:"hidden",
      background:"#04060a",
      borderTop:"1px solid rgba(220,60,60,.12)",
      borderBottom:"1px solid rgba(220,60,60,.12)",
    }}>
      <style>{`
        @keyframes road-rush  {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes car-a-move {0%{transform:translateX(0) skewX(-3deg)}40%{transform:translateX(18px) skewX(-5deg)}70%{transform:translateX(-8px) skewX(-2deg)}100%{transform:translateX(5px) skewX(-4deg)}}
        @keyframes car-b-move {0%{transform:translateX(0) skewX(-2deg)}30%{transform:translateX(-14px) skewX(-6deg)}65%{transform:translateX(10px) skewX(-3deg)}100%{transform:translateX(-6px) skewX(-4deg)}}
        @keyframes headlights {0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes spark-fly  {0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0}}
        @keyframes near-miss  {0%,100%{filter:brightness(1)}48%{filter:brightness(2.2)}52%{filter:brightness(1.8)}}
        @keyframes scan-line  {0%{top:-2px}100%{top:100%}}
        @keyframes mat-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes border-glow{0%,100%{border-color:rgba(220,60,60,.2)}50%{border-color:rgba(220,60,60,.55)}}
        @keyframes btn-ignite {0%{box-shadow:0 0 0 rgba(220,60,60,0)}50%{box-shadow:0 4px 28px rgba(220,60,60,.65)}100%{box-shadow:0 0 10px rgba(220,60,60,.3)}}
        @keyframes red-pulse  {0%,100%{opacity:.55}50%{opacity:1}}

        .mat-cta {
          display:inline-block;padding:15px 44px;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;
          font-weight:700;text-decoration:none;color:#fff;
          background:linear-gradient(135deg,#8b1a1a,#dc3c3c,#ff6060,#dc3c3c,#8b1a1a);
          border:1px solid rgba(255,96,96,.4);
          animation:btn-ignite 2s ease-in-out infinite;
          transition:transform .2s;
        }
        .mat-cta:hover{transform:translateY(-3px) scale(1.04);}
        .mat-cta-ghost {
          display:inline-block;padding:15px 44px;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;
          font-weight:600;text-decoration:none;color:rgba(232,220,200,.65);
          border:1px solid rgba(232,220,200,.2);transition:all .25s;
        }
        .mat-cta-ghost:hover{border-color:rgba(232,220,200,.55);color:#E8DCC8;}
      `}</style>

      {/* ── CINEMATIC CHASE HERO ── */}
      <div style={{position:"relative",width:"100%",height:320,overflow:"hidden",background:"#04060a"}}>

        {/* Letterbox */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:24,background:"#000",zIndex:20}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,background:"#000",zIndex:20}}/>

        {/* Scrolling city skyline */}
        <svg style={{position:"absolute",bottom:24,left:0,width:"200%",height:200,zIndex:1,animation:"road-rush 11s linear infinite"}}
          viewBox="0 0 1500 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {BUILDINGS.map((b,i)=>(
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={FILL[i%4]}/>
              {/* Static window grid from precomputed pattern */}
              {Array.from({length:Math.floor(b.h/22)}).map((_,r)=>
                Array.from({length:Math.floor(b.w/18)}).map((_,c)=>
                  WINDOWS[r%6][c%12]===1 ? (
                    <rect key={`${r}-${c}`}
                      x={b.x+3+(c*18)} y={b.y+4+(r*22)} width={8} height={11}
                      fill={WIN_COLORS[(i+r+c)%3]}/>
                  ) : null
                )
              )}
            </g>
          ))}
        </svg>

        {/* Road */}
        <div style={{position:"absolute",bottom:24,left:0,right:0,height:80,background:"linear-gradient(to bottom,#161616,#0b0b0b)",zIndex:2}}>
          <div style={{position:"absolute",top:"40%",left:0,right:0,height:3,overflow:"hidden"}}>
            <div style={{display:"flex",animation:"road-rush 0.38s linear infinite",width:"200%"}}>
              {Array.from({length:50}).map((_,i)=>(
                <div key={i} style={{width:65,height:3,background:i%2===0?"rgba(255,220,0,.72)":"transparent",flexShrink:0}}/>
              ))}
            </div>
          </div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(220,60,60,.1))"}}/>
        </div>

        {/* Car B — ahead */}
        <div style={{position:"absolute",bottom:62,left:"57%",zIndex:5,animation:"car-b-move 1.8s ease-in-out infinite, near-miss 3.6s ease-in-out infinite"}}>
          <svg viewBox="0 0 180 70" width={160} height={62} xmlns="http://www.w3.org/2000/svg">
            <path d="M10 48 Q12 28 40 22 L140 22 Q168 22 170 35 L172 48Z" fill="#182a18"/>
            <path d="M30 22 Q36 10 60 8 L120 8 Q148 8 152 22Z" fill="#102010"/>
            <path d="M38 22 Q43 12 62 10 L88 10 L90 22Z" fill="rgba(100,200,255,.3)"/>
            <path d="M92 22 L92 10 L118 10 Q138 10 144 22Z" fill="rgba(100,200,255,.3)"/>
            <rect x={8} y={34} width={13} height={9} rx={2} fill="#ff2020"/>
            <circle cx={42} cy={50} r={12} fill="#111"/><circle cx={42} cy={50} r={6} fill="#2a2a2a"/>
            <circle cx={138} cy={50} r={12} fill="#111"/><circle cx={138} cy={50} r={6} fill="#2a2a2a"/>
          </svg>
          <div style={{position:"absolute",bottom:-8,left:0,width:38,height:18,background:"radial-gradient(ellipse,rgba(255,28,28,.65),transparent 70%)",filter:"blur(6px)"}}/>
        </div>

        {/* Car A — pursuer */}
        <div style={{position:"absolute",bottom:55,left:"26%",zIndex:6,animation:"car-a-move 1.55s ease-in-out infinite"}}>
          <svg viewBox="0 0 240 96" width={240} height={96} xmlns="http://www.w3.org/2000/svg">
            <path d="M8 66 Q10 38 50 28 L190 28 Q230 28 234 48 L236 66Z" fill="#080808"/>
            <path d="M42 28 Q50 10 80 6 L160 6 Q198 6 204 28Z" fill="#050505"/>
            <path d="M54 28 Q60 12 82 8 L118 8 L120 28Z" fill="rgba(80,185,255,.26)"/>
            <path d="M122 28 L122 8 L158 8 Q182 8 192 28Z" fill="rgba(80,185,255,.26)"/>
            <rect x={214} y={44} width={20} height={12} rx={3} fill="#ffe066" style={{animation:"headlights .45s ease-in-out infinite"}}/>
            <rect x={214} y={44} width={20} height={12} rx={3} fill="rgba(255,225,80,.42)" style={{filter:"blur(7px)"}}/>
            <rect x={6} y={46} width={14} height={11} rx={2} fill="#ff1010"/>
            <circle cx={60} cy={70} r={18} fill="#0c0c0c"/><circle cx={60} cy={70} r={9} fill="#1c1c1c"/>
            <circle cx={180} cy={70} r={18} fill="#0c0c0c"/><circle cx={180} cy={70} r={9} fill="#1c1c1c"/>
            <line x1={8} y1={34} x2={-55} y2={34} stroke="rgba(255,255,255,.1)" strokeWidth={1.5}/>
            <line x1={8} y1={43} x2={-75} y2={43} stroke="rgba(255,255,255,.08)" strokeWidth={1.2}/>
            <line x1={8} y1={52} x2={-90} y2={52} stroke="rgba(255,255,255,.06)" strokeWidth={1}/>
          </svg>
          <div style={{position:"absolute",right:-100,top:22,width:120,height:36,background:"linear-gradient(to right,rgba(255,220,80,.38),transparent)",filter:"blur(9px)"}}/>
        </div>

        {/* Sparks */}
        {([
          {x:52,y:56,sx:"20px",sy:"-24px",c:"#ffcc00",d:"0s"},
          {x:53,y:59,sx:"-13px",sy:"-30px",c:"#ff8800",d:".1s"},
          {x:51,y:53,sx:"26px",sy:"-16px",c:"#fff",d:".2s"},
          {x:54,y:62,sx:"-18px",sy:"-20px",c:"#ffdd44",d:".05s"},
          {x:50,y:57,sx:"15px",sy:"-34px",c:"#ff6600",d:".15s"},
        ] as {x:number;y:number;sx:string;sy:string;c:string;d:string}[]).map((s,i)=>(
          <div key={i} style={{
            position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
            width:4,height:4,borderRadius:"50%",background:s.c,
            ["--sx" as string]:s.sx,["--sy" as string]:s.sy,
            animation:`spark-fly 0.58s ${s.d} ease-out infinite`,
            zIndex:8,filter:"blur(.4px)",
          }}/>
        ))}

        {/* Scan line */}
        <div style={{position:"absolute",left:0,right:0,height:2,background:"rgba(255,255,255,.05)",zIndex:15,animation:"scan-line 5s linear infinite"}}/>

        {/* Atmosphere */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 100%,rgba(220,60,60,.2) 0%,transparent 65%)",zIndex:3}}/>
        <div style={{position:"absolute",top:24,left:0,right:0,height:80,background:"linear-gradient(to bottom,rgba(4,6,10,.9),transparent)",zIndex:4}}/>

        {/* Overlay text */}
        <div style={{position:"absolute",top:36,left:0,right:0,textAlign:"center",zIndex:16,animation:"mat-fade-up .9s ease both"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:6,textTransform:"uppercase",color:"rgba(220,60,60,.85)",marginBottom:8,animation:"red-pulse 2s ease-in-out infinite"}}>
            ✦ Beryl AI Labs · Coming Soon ✦
          </div>
          <div style={{
            fontFamily:"'Cinzel Decorative',serif",
            fontSize:"clamp(1.5rem,3.5vw,2.8rem)",
            fontWeight:900,color:"#E8DCC8",lineHeight:1.05,
            textShadow:"0 0 55px rgba(220,60,60,.55),0 2px 28px rgba(0,0,0,.95)",
          }}>
            BERYL MATINEE
          </div>
          <div style={{
            fontFamily:"'Cinzel',serif",fontSize:"clamp(.65rem,1.3vw,.9rem)",
            letterSpacing:4,color:"rgba(220,60,60,.75)",textTransform:"uppercase",marginTop:8,
          }}>
            Enterprise AI Cinema Studio
          </div>
        </div>
      </div>

      {/* Copy + CTA */}
      <div style={{
        background:"linear-gradient(135deg,#060409,#0a0410,#060409)",
        padding:"32px 24px",textAlign:"center",
        borderTop:"1px solid rgba(220,60,60,.12)",
      }}>
        <p style={{
          fontFamily:"'Cinzel',serif",fontSize:"clamp(.8rem,1.5vw,1rem)",
          color:"rgba(232,220,200,.6)",letterSpacing:.8,lineHeight:1.9,
          maxWidth:640,margin:"0 auto 24px",
        }}>
          From a single prompt — full cinematic productions. Multi-agent director, storyboard AI,
          premium video generation, and real-time avatar guidance in one studio.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/matinee" className="mat-cta">Explore Matinee →</Link>
          <Link href="/matinee#pipeline" className="mat-cta-ghost">See the Pipeline</Link>
        </div>
      </div>
    </section>
  );
}
