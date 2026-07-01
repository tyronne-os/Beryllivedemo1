import Link from "next/link";

const FOOTER_LINKS: [string, string][] = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["API", "/api-docs"],
  ["Contact", "/contact"],
];

export default function Footer() {
  return (
    <footer style={{background:"#E8DCC8",padding:"24px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(26,95,122,.15)"}}>
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:"#1a5f7a",letterSpacing:2}}>
          Beryl<span className="logo-live">Live</span>
        </div>
        <div style={{fontSize:11,fontStyle:"italic",color:"#1a5f7a",marginTop:2}}>Built for believers. Forged in panic. Deployed with conviction.</div>
      </div>
      <div style={{display:"flex",gap:24}}>
        {FOOTER_LINKS.map(([label, href]) => (
          <Link key={label} href={href} style={{fontSize:11,color:"#888",textDecoration:"none",letterSpacing:1,fontFamily:"'Cinzel',serif",textTransform:"uppercase"}}>{label}</Link>
        ))}
      </div>
      <div style={{fontSize:12,color:"#888"}}>© 2026 Beryl AI Labs</div>
    </footer>
  );
}
