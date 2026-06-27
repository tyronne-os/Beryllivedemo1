"use client";
import { useState } from "react";

export default function DemoOverlay({onSubmit}:{onSubmit:(name:string,email:string)=>void}) {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [loading,setLoading]=useState(false);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); if(!name.trim()||!email.trim()) return;
    setLoading(true);
    try { await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email})}); } catch {}
    onSubmit(name,email);
  };

  const inp:React.CSSProperties={width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(232,220,200,0.25)",color:"#E8DCC8",fontSize:16,fontFamily:"'Cormorant Garamond',serif",outline:"none",marginBottom:14};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,5,3,0.93)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0D1117",border:"1px solid rgba(232,220,200,0.15)",padding:"48px 40px",maxWidth:440,width:"90%",textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#4CAF50",marginBottom:16}}>Live Session · Eve</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:600,color:"#E8DCC8",marginBottom:10}}>Meet Eve.</h2>
        <p style={{fontSize:15,color:"rgba(232,220,200,0.65)",lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif",marginBottom:32}}>
          You have 3 minutes with the most advanced live AI presence ever built. Tell her your name — she will remember everything.
        </p>
        <form onSubmit={submit}>
          <input type="text" placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)} required style={inp}/>
          <input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp}/>
          <button type="submit" disabled={loading} style={{width:"100%",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"2px",textTransform:"uppercase",padding:"15px 0",background:loading?"#888":"#c8a951",color:"#0D1117",border:"none",cursor:loading?"default":"pointer",marginTop:6}}>
            {loading?"Connecting...":"Begin Session →"}
          </button>
        </form>
        <p style={{fontSize:11,color:"rgba(232,220,200,0.3)",marginTop:20,fontFamily:"'Cormorant Garamond',serif"}}>No credit card · Session ends at 3:00 · No spam</p>
      </div>
    </div>
  );
}

