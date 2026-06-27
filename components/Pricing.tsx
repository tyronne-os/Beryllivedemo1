"use client";
import Link from "next/link";

const TIERS = [
  {
    name:"Studio", price:"$19", period:"/month · billed monthly", minutes:"600", hrs:"10 hrs · competitors give 50 min",
    color:"rgba(255,255,255,.03)", border:"rgba(255,255,255,.08)", nameColor:"#888",
    features:["3 characters from the Squad","720p HD streaming","Sub-180ms latency","1 concurrent session","Standard voice library","Community support","Embed on 1 domain"],
    cta:"Get Started", ctaBg:"transparent", ctaColor:"#E8DCC8", ctaBorder:"rgba(232,220,200,.3)",
  },
  {
    name:"Professional", price:"$99", period:"/month · billed monthly", minutes:"2,000", hrs:"33 hrs · Anam gives 5 at $199",
    color:"rgba(26,95,122,.15)", border:"rgba(26,95,122,.4)", nameColor:"#1a5f7a",
    features:["Full Squad — all characters","1080p Full HD streaming","Sub-150ms latency","3 concurrent sessions","Voice cloning — 1 custom voice","Custom avatar — 1 slot","Priority email support","Embed on 3 domains","Analytics dashboard"],
    cta:"Get Started", ctaBg:"rgba(26,95,122,.5)", ctaColor:"#fff", ctaBorder:"#1a5f7a",
  },
  {
    name:"Studio Pro", price:"$299", period:"/month · billed monthly", minutes:"6,000", hrs:"100 hrs · nobody else comes close",
    color:"rgba(76,175,80,.1)", border:"#4CAF50", nameColor:"#4CAF50", popular:true,
    features:["Full Squad + 3 custom avatars","4K Ultra HD streaming","Sub-120ms latency","10 concurrent sessions","3 custom voice clones","Emotion & personality tuning","Webhook & API access","Unlimited domains","Priority 12hr support SLA","Advanced analytics + exports"],
    cta:"Start Free Trial", ctaBg:"#4CAF50", ctaColor:"#fff", ctaBorder:"#4CAF50",
  },
  {
    name:"Enterprise", price:"Custom", period:"pricing · annual contract", minutes:"Unlimited", hrs:"Dedicated GPU cluster. Your traffic only.",
    color:"rgba(13,17,23,.9)", border:"rgba(232,220,200,.15)", nameColor:"#E8DCC8", crown:true,
    features:["White-label — your brand","Dedicated GPU infrastructure","Sub-100ms SLA guaranteed","Unlimited concurrent sessions","Unlimited custom avatars & voices","HIPAA / SOC2 compliance","On-premise deployment option","Dedicated success manager","1hr SLA emergency support","Custom LLM integration"],
    cta:"Contact Sales", ctaBg:"transparent", ctaColor:"#E8DCC8", ctaBorder:"rgba(232,220,200,.4)",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{position:"relative",width:"100%",overflow:"hidden",background:"#0D1117",padding:"72px 20px 88px"}}>
      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 2px;
          align-items: stretch;
        }
        .pricing-compare {
          display: inline-flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: repeat(2,1fr) !important;
            gap: 8px !important;
          }
        }
        @media (max-width: 540px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .pricing-compare { gap: 10px !important; }
        }
      `}</style>

      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(76,175,80,.12),transparent 60%)",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:14}}>Beryl Live · Pricing</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:"#fff",marginBottom:14}}>
            More hours. Less cost.<br/><span style={{color:"#4CAF50"}}>No compromise.</span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(14px,2vw,18px)",color:"rgba(232,220,200,.7)",maxWidth:560,margin:"0 auto 20px",lineHeight:1.7}}>
            Competitors charge per-minute and cap your sessions. Beryl Live runs on our own GPU infrastructure — we pass those savings to you.
          </p>
          <div className="pricing-compare" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",padding:"10px 20px"}}>
            {[["Anam: 250 min free","#666"],["Simli: 50 min free","#666"],["HeyGen: 10 min premium","#666"],["Beryl: See below ↓","#4CAF50"]].map(([t,c])=>(
              <span key={t} style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:1,color:c,textTransform:"uppercase"}}>{t}</span>
            ))}
          </div>
        </div>

        <div className="pricing-grid">
          {TIERS.map(tier=>(
            <div key={tier.name} style={{background:tier.color,border:`${tier.popular?"2px":"1px"} solid ${tier.border}`,padding:"28px 20px 32px",display:"flex",flexDirection:"column",position:"relative",transform:tier.popular?"translateY(-6px)":undefined,boxShadow:tier.popular?"0 0 40px rgba(76,175,80,.2)":undefined,transition:"all .3s",borderRadius:4}}>
              {tier.popular && <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:"#4CAF50",padding:"4px 16px",fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#fff",textTransform:"uppercase",whiteSpace:"nowrap",borderRadius:"0 0 4px 4px"}}>Most Popular</div>}
              {tier.crown && <div style={{fontSize:18,marginBottom:10}}>♛</div>}
              <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:tier.nameColor,marginBottom:16,marginTop:tier.popular?14:0}}>{tier.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(28px,3vw,42px)",fontWeight:700,color:"#fff",lineHeight:1,marginBottom:4}}>{tier.price}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#555",marginBottom:22}}>{tier.period}</div>
              <div style={{background:tier.popular?"rgba(76,175,80,.15)":"rgba(232,220,200,.06)",border:`1px solid ${tier.popular?"rgba(76,175,80,.4)":"rgba(232,220,200,.12)"}`,padding:"13px 16px",marginBottom:22,textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:700,color:tier.popular?"#4CAF50":"#E8DCC8",lineHeight:1}}>{tier.minutes}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:2,color:"#888",textTransform:"uppercase",marginTop:4}}>Minutes / Month</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:tier.popular?"#E8DCC8":"#4CAF50",marginTop:4,fontStyle:"italic"}}>{tier.hrs}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24,flex:1}}>
                {tier.features.map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(13px,1.5vw,15px)",color:tier.popular?"#fff":"rgba(232,220,200,.75)"}}>
                    <span style={{color:"#4CAF50",flexShrink:0,marginTop:1}}>✦</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/demo">
                <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"1.5px",padding:"12px",background:tier.ctaBg,color:tier.ctaColor,border:`1px solid ${tier.ctaBorder}`,cursor:"pointer",textTransform:"uppercase",width:"100%",transition:"all .2s"}}>
                  {tier.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:40,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#555",fontStyle:"italic"}}>
            All plans include 99.9% uptime SLA · No credit expiry · Minutes roll over 3 months · Cancel anytime
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,letterSpacing:2,color:"#333",textTransform:"uppercase"}}>
            Save 20% with annual billing · Volume discounts above 50K minutes
          </div>
        </div>
      </div>
    </section>
  );
}


