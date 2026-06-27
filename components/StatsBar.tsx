export default function StatsBar() {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",background:"#1a5f7a"}}>
      {[["<180ms","Avg. Response Latency"],["12","Unique Characters"],["99.9%","Stream Uptime"]].map(([num,lbl],i)=>(
        <div key={lbl} style={{padding:"22px 32px",borderRight:i<2?"1px solid rgba(255,255,255,.12)":"none",textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:"#E8DCC8"}}>{num}</div>
          <div style={{fontSize:11,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(232,220,200,.65)",marginTop:4}}>{lbl}</div>
        </div>
      ))}
    </div>
  );
}
