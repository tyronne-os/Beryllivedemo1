"use client";
import Link from "next/link";

const TIERS = [
  {
    name:"Studio", price:"$19", period:"/month · billed monthly", minutes:"600", hrs:"10 hrs · competitors give 50 min",
    color:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)", nameColor:"#888",
    features:["3 characters from the Squad","720p HD streaming","Sub-180ms latency","1 concurrent session","Standard voice library","Community support","Embed on 1 domain"],
    cta:"Get Started", ctaBg:"transparent", ctaColor:"#E8DCC8", ctaBorder:"rgba(232,220,200,0.3)",
  },
  {
    name:"Professional", price:"$99", period:"/month · billed monthly", minutes:"2,000", hrs:"33 hrs · Anam gives 5 at $199",
    color:"rgba(26,95,122,0.15)", border:"rgba(26,95,122,0.4)", nameColor:"#1a5f7a",
    features:["Full Squad — all 12 characters","1080p Full HD streaming","Sub-150ms latency","3 concurrent sessions","Voice cloning — 1 custom voice","Custom avatar — 1 slot","Priority email support","Embed on 3 domains","Analytics dashboard"],
    cta:"Get Started", ctaBg:"rgba(26,95,122,0.5)", ctaColor:"#fff", ctaBorder:"#1a5f7a",
  },
  {
    name:"Studio Pro", price:"$299", period:"/month · billed monthly", minutes:"6,000", hrs:"100 hrs · nobody else comes close",
    color:"rgba(76,175,80,0.1)", border:"#4CAF50", nameColor:"#4CAF50", popular:true,
    features:["Full Squad + 3 custom avatars","4K Ultra HD streaming","Sub-120ms latency","10 concurrent sessions","3 custom voice clones","Emotion & personality tuning","Webhook & API access","Unlimited domains","Priority 12hr support SLA","Advanced analytics + exports"],
    cta:"Start Free Trial", ctaBg:"#4CAF50", ctaColor:"#fff", ctaBorder:"#4CAF50",
  },
  {
    name:"Enterprise", price:"Custom", period:"pricing · annual contract", minutes:"Unlimited", hrs:"Dedicated GPU cluster. Your traffic only.",
    color:"rgba(13,17,23,0.9)", border:"rgba(232,220,200,0.15)", nameColor:"#E8DCC8", crown:true,
    features:["White-label — your brand, zero Beryl","Dedicated GPU infrastructure","Sub-100ms SLA guaranteed","Unlimited concurrent sessions","Unlimited custom avatars & voices","HIPAA / SOC2 compliance","On-premise deployment option","Dedicated success manager","1hr SLA emergency support","Custom LLM integration"],
    cta:"Contact Sales", ctaBg:"transparent", ctaColor:"#E8DCC8", ctaBorder:"rgba(232,220,200,0.4)",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{position:"relative",width:"100%",overflow:"hidden",background:"#0D1117",padding:"80px 32px 96px"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(76,175,80,0.12),transparent 60%)",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#4CAF50",marginBottom:14}}>Beryl Live · Pricing</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:700,color:"#fff",marginBottom:16}}>
            More hours. Less cost.<br/><span style={{color:"#4CAF50"}}>No compromise.</span>
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"rgba(232,220,200,0.7)",maxWidth:580,margin:"0 auto 24px",lineHeight:1.7}}>
            Competitors charge per-minute and cap your sessions. Beryl Live runs on our own GPU infrastructure — we pass those savings to you and beat every hour limit on the market.
          </p>
          <div style={{display:"inline-flex",gap:24,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",padding:"12px 28px",flexWrap:"wrap",justifyContent:"center"}}>
            {[["Anam: 250 min free","#666"],["Simli: 50 min free","#666"],["HeyGen: 10 min premium","#666"],["Beryl: See below ↓","#4CAF50"]].map(([t,c])=>(
              <span key={t} style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:1,color:c,textTransform:"uppercase"}}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,alignItems:"stretch"}}>
          {TIERS.map(tier=>(
            <div key={tier.name} style={{background:tier.color,border:`${tier.popular?"2px":"1px"} solid ${tier.border}`,padding:"36px 28px 40px",display:"flex",flexDirection:"column",position:"relative",transform:tier.popular?"translateY(-8px)":undefined,boxShadow:tier.popular?"0 0 40px rgba(76,175,80,0.2)":undefined,transition:"all .3s"}}>
              {tier.popular && <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:"#4CAF50",padding:"5px 20px",fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"#fff",textTransform:"uppercase",whiteSpace:"nowrap"}}>Most Popular</div>}
              {tier.crown && <div style={{fontSize:20,marginBottom:12}}>♛</div>}
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:tier.nameColor,marginBottom:20,marginTop:tier.popular?16:0}}>{tier.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:42,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:6}}>{tier.price}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#555",marginBottom:28}}>{tier.period}</div>
              <div style={{background:tier.popular?"rgba(76,175,80,0.15)":"rgba(232,220,200,0.06)",border:`1px solid ${tier.popular?"rgba(76,175,80,0.4)":"rgba(232,220,200,0.12)"}`,padding:"16px 20px",marginBottom:28,textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:32,fontWeight:700,color:tier.popular?"#4CAF50":"#E8DCC8",lineHeight:1}}>{tier.minutes}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,color:"#888",textTransform:"uppercase",marginTop:4}}>Minutes / Month</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:tier.popular?"#E8DCC8":"#4CAF50",marginTop:6,fontStyle:"italic"}}>{tier.hrs}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32,flex:1}}>
                {tier.features.map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"flex-start",gap:10,fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:tier.popular?"#fff":"rgba(232,220,200,0.75)"}}>
                    <span style={{color:"#4CAF50",flexShrink:0,marginTop:2}}>✦</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/demo">
                <button style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"1.5px",padding:"13px",background:tier.ctaBg,color:tier.ctaColor,border:`1px solid ${tier.ctaBorder}`,cursor:"pointer",textTransform:"uppercase",width:"100%",transition:"all .2s"}}>
                  {tier.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:48,display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#555",fontStyle:"italic"}}>
            All plans include 99.9% uptime SLA · No credit expiry · Minutes roll over for 3 months · Cancel anytime
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,color:"#333",textTransform:"uppercase"}}>
            Save 20% with annual billing · Volume discounts above 50K minutes
          </div>
        </div>
      </div>
    </section>
  );
}
