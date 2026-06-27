"use client";
import Link from "next/link";

export default function Manifesto() {
  return (
    <section style={{background:"#0D1117",padding:"56px 32px",position:"relative",overflow:"hidden",textAlign:"center"}}>
      <div style={{position:"absolute",top:-30,left:10,fontFamily:"'Cormorant Garamond',serif",fontSize:280,color:"rgba(76,175,80,.05)",lineHeight:1,pointerEvents:"none",userSelect:"none"}}>&ldquo;</div>
      <div style={{maxWidth:640,margin:"0 auto",position:"relative"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:600,color:"#E8DCC8",marginBottom:18,letterSpacing:1}}>The End of the Chatbox</div>
        <p style={{fontSize:17,lineHeight:1.8,color:"rgba(232,220,200,.75)",marginBottom:14,fontFamily:"'Cormorant Garamond',serif"}}>
          Text-based AI was a stopgap. A compromise. A conversation through frosted glass. Beryl Live is the first platform built from the ground up for face-to-face AI — where presence, tone, and identity aren&apos;t afterthoughts. They are the product.
        </p>
        <p style={{fontSize:17,lineHeight:1.8,color:"rgba(232,220,200,.75)",marginBottom:24,fontFamily:"'Cormorant Garamond',serif"}}>
          Every character in the Amanda Squad is a living digital soul — not software. Trained to listen, respond, and connect at a level that text can never reach.
        </p>
        <div style={{marginBottom:28}}>
          {["Sub-180ms Latency","RunwayML Powered","Voice Cloning","12 Characters","Emotion-Aware"].map(tag=>(
            <span key={tag} style={{display:"inline-block",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase",padding:"5px 12px",border:"1px solid rgba(76,175,80,.4)",color:"#4CAF50",margin:4}}>{tag}</span>
          ))}
        </div>
        <Link href="/demo">
          <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"1.5px",padding:"13px 28px",background:"#4CAF50",color:"#fff",border:"none",cursor:"pointer",textTransform:"uppercase",transition:"all .2s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="#1a5f7a"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="#4CAF50"}}>
            Begin Face to Face
          </button>
        </Link>
      </div>
    </section>
  );
}
