"use client";
import Link from "next/link";

export default function MatineeBanner() {
  return (
    <section style={{
      position:"relative",width:"100%",overflow:"hidden",
      background:"#04060a",
      borderTop:"1px solid rgba(220,60,60,.12)",
      borderBottom:"1px solid rgba(220,60,60,.12)",
    }}>
      <style>{`
        @keyframes mat-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
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

      {/* ── VIDEO HERO ── */}
      <div style={{position:"relative",width:"100%",height:360,overflow:"hidden",background:"#04060a"}}>

        {/* Letterbox bars */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:28,background:"#000",zIndex:20,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,background:"#000",zIndex:20,pointerEvents:"none"}}/>

        {/* Muted video — same source as Matinee page, no controls, no sound */}
        <video
          src="/videos/matinee-hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position:"absolute",inset:0,
            width:"100%",height:"100%",
            objectFit:"cover",
            zIndex:1,
          }}
        />

        {/* Dark cinematic overlay */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(4,6,10,.55) 0%,rgba(4,6,10,.2) 40%,rgba(4,6,10,.65) 100%)",zIndex:2,pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 100%,rgba(220,60,60,.18) 0%,transparent 65%)",zIndex:3,pointerEvents:"none"}}/>

        {/* Overlay text */}
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,animation:"mat-fade-up .9s ease both"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:6,textTransform:"uppercase",color:"rgba(220,60,60,.85)",marginBottom:10,animation:"red-pulse 2s ease-in-out infinite"}}>
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
