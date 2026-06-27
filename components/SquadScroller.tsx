"use client";
import { useState, useRef } from "react";

const SQUAD = [
  {name:"Jamarr",role:"Creator",status:"Available",color:"#4CAF50"},
  {name:"Eve",role:"AI Architect",status:"In Session",color:"#1a5f7a"},
  {name:"Jessica",role:"Strategy",status:"Available",color:"#4CAF50"},
  {name:"Jeff",role:"Operations",status:"Offline",color:"#aaa"},
  {name:"Nu",role:"Innovation",status:"Available",color:"#4CAF50"},
  {name:"India",role:"Growth",status:"Available",color:"#4CAF50"},
  {name:"Lacara",role:"Design",status:"Available",color:"#4CAF50"},
  {name:"Terrell",role:"Analytics",status:"Available",color:"#4CAF50"},
  {name:"Brice",role:"Development",status:"Available",color:"#4CAF50"},
  {name:"Kizzy",role:"Engagement",status:"Available",color:"#4CAF50"},
  {name:"Amanda",role:"Finance",status:"Available",color:"#4CAF50"},
  {name:"Maria",role:"Relations",status:"Available",color:"#4CAF50"},
  {name:"Shelly",role:"Community",status:"Available",color:"#4CAF50"},
];

const CARD_W = 160;
const GAP = 16;
const SET_PX = SQUAD.length * (CARD_W + GAP);
// Duplicate once for seamless loop
const TRACK = [...SQUAD, ...SQUAD];

export default function SquadScroller() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Per-card error tracking via ref array (no re-render on error)
  const errRef = useRef<boolean[]>(new Array(TRACK.length).fill(false));

  const handleImgError = (i: number, imgEl: HTMLImageElement, letterEl: HTMLDivElement) => {
    errRef.current[i] = true;
    imgEl.style.display = "none";
    letterEl.style.opacity = "1";
  };

  return (
    <section id="squad" style={{padding:"52px 0 60px",background:"#FDFAF6",overflow:"hidden"}}>
      <style>{`
        @keyframes squad-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${SET_PX}px); }
        }
      `}</style>

      <div style={{textAlign:"center",marginBottom:36,padding:"0 32px"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#4CAF50",marginBottom:8}}>Beryl Live · Character Roster</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:600,color:"#0D1117"}}>
          The <span style={{color:"#1a5f7a"}}>Amanda Squad</span>
        </h2>
        <div style={{width:40,height:2,background:"#4CAF50",margin:"12px auto 0"}}/>
      </div>

      <div style={{position:"relative"}}>
        {/* Edge fades */}
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:100,background:"linear-gradient(to right,#FDFAF6,transparent)",zIndex:10,pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:100,background:"linear-gradient(to left,#FDFAF6,transparent)",zIndex:10,pointerEvents:"none"}}/>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            display:"flex",
            gap:GAP,
            width:"max-content",
            padding:"8px 0 20px",
            animation:`squad-scroll ${SQUAD.length * 2.4}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            willChange:"transform",
          }}
        >
          {TRACK.map((c, i) => {
            const isActive = i % SQUAD.length === active;
            return (
              <div
                key={i}
                onClick={() => setActive(i % SQUAD.length)}
                style={{
                  cursor:"pointer",
                  flex:`0 0 ${CARD_W}px`,
                  width:CARD_W,
                  border:`1px solid ${isActive ? "#4CAF50" : "rgba(26,95,122,0.2)"}`,
                  overflow:"hidden",
                  background:"#fff",
                  boxShadow: isActive ? "0 6px 24px rgba(76,175,80,0.2)" : "0 2px 8px rgba(0,0,0,0.05)",
                  transform: isActive ? "translateY(-6px)" : "translateY(0)",
                  transition:"transform .25s, box-shadow .25s, border-color .25s",
                }}
              >
                {/* Portrait */}
                <div style={{width:"100%",paddingTop:"125%",position:"relative",overflow:"hidden",background:"#ddd4c0"}}>
                  {/* Letter fallback — visible only if image errors */}
                  <div
                    ref={el => {
                      // stored so handleImgError can reach it
                    }}
                    id={`letter-${i}`}
                    style={{
                      position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"'Cinzel',serif",fontSize:40,fontWeight:700,color:"#1a5f7a",
                      opacity:0, // hidden by default; only shown on img error
                      transition:"opacity .2s",
                      zIndex:0,
                    }}
                  >
                    {c.name[0]}
                  </div>
                  <img
                    id={`img-${i}`}
                    src={`/characters/${c.name.toUpperCase()}_SHIELD.png`}
                    alt={c.name}
                    onError={e => {
                      const imgEl = e.currentTarget as HTMLImageElement;
                      const letterEl = document.getElementById(`letter-${i}`) as HTMLDivElement;
                      if (letterEl) { imgEl.style.display = "none"; letterEl.style.opacity = "1"; }
                    }}
                    style={{
                      position:"absolute",inset:0,width:"100%",height:"100%",
                      objectFit:"cover",objectPosition:"top center",
                      zIndex:1,
                    }}
                  />
                  {isActive && (
                    <div style={{position:"absolute",inset:0,background:"rgba(76,175,80,0.15)",zIndex:2,pointerEvents:"none"}}/>
                  )}
                </div>

                {/* Card body */}
                <div style={{padding:"10px 12px"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:"#0D1117",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.role}</div>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",marginTop:6,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:c.color,flexShrink:0,display:"inline-block"}}/>
                    <span style={{color:c.color}}>{c.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected character strip */}
      <div style={{textAlign:"center",marginTop:16,padding:"0 32px"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#1a5f7a"}}>{SQUAD[active].name}</span>
        <span style={{color:"#ccc",margin:"0 10px"}}>·</span>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#666",fontStyle:"italic"}}>{SQUAD[active].role}</span>
        <span style={{color:"#ccc",margin:"0 10px"}}>·</span>
        <span style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:SQUAD[active].color}}>{SQUAD[active].status}</span>
      </div>
    </section>
  );
}
