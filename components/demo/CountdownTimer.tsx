"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer({totalSeconds=180,onWarning,onEnd}:{totalSeconds?:number;onWarning?:()=>void;onEnd?:()=>void}) {
  const [secs,setSecs]=useState(totalSeconds); const [warned,setWarned]=useState(false);
  useEffect(()=>{
    const t=setInterval(()=>{
      setSecs(p=>{
        if(p<=1){clearInterval(t);onEnd?.();return 0;}
        if(p===30&&!warned){setWarned(true);onWarning?.();}
        return p-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[onEnd,onWarning,warned]);

  const m=Math.floor(secs/60); const s=secs%60; const pct=(secs/totalSeconds)*100; const warn=secs<=30;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:42,fontWeight:700,color:warn?"#c8a951":"#E8DCC8",letterSpacing:4,transition:"color .5s"}}>{m}:{s.toString().padStart(2,"0")}</div>
      <div style={{width:"100%",height:3,background:"rgba(232,220,200,0.1)",marginTop:10,borderRadius:2}}>
        <div style={{height:"100%",width:`${pct}%`,background:warn?"#c8a951":"#4CAF50",borderRadius:2,transition:"width 1s linear,background .5s"}}/>
      </div>
      <div style={{fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:2,textTransform:"uppercase",color:"rgba(232,220,200,0.4)",marginTop:8}}>{warn?"Session ending soon":"Session remaining"}</div>
    </div>
  );
}
