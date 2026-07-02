"use client";
import { useEffect, useState } from "react";

const CODE = "2440";
const SESSION_KEY = "beryl_access_granted";

export default function AccessGate() {
  const [visible, setVisible] = useState(false);
  const [input, setInput]     = useState("");
  const [shake, setShake]     = useState(false);
  const [wrong, setWrong]     = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) !== "1") {
      setVisible(true);
    }
  }, []);

  function handleDigit(d: string) {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    if (next.length === 4) {
      if (next === CODE) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setVisible(false);
      } else {
        setShake(true);
        setWrong(true);
        setTimeout(() => { setShake(false); setInput(""); setWrong(false); }, 800);
      }
    }
  }

  function handleClear() { setInput(""); setWrong(false); }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg,#020101 0%,#0a0604 55%,#020101 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel',serif",
    }}>
      <style>{`
        @keyframes ag-shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes ag-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-10px)} 40%,80%{transform:translateX(10px)} }
        @keyframes ag-pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes ag-glow    { 0%,100%{box-shadow:0 0 24px rgba(200,169,81,.18)} 50%{box-shadow:0 0 52px rgba(200,169,81,.45)} }
        .ag-key:hover { background:rgba(200,169,81,.12) !important; border-color:rgba(200,169,81,.5) !important; }
        .ag-key:active { transform:scale(.93); }
      `}</style>

      {/* Fleur-de-lis subtle field */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", opacity:.06 }} aria-hidden="true">
        {Array.from({length:8}).map((_,r) => (
          <div key={r} style={{ display:"flex", justifyContent:"space-around", paddingLeft: r%2 ? 52:0 }}>
            {Array.from({length:10}).map((_,c) => (
              <span key={c} style={{ fontSize:36, color:"#c8a951", lineHeight:"90px", display:"block" }}>⚜</span>
            ))}
          </div>
        ))}
      </div>

      {/* Logo */}
      <div style={{
        fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, letterSpacing:4,
        background:"linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
        backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        backgroundClip:"text", animation:"ag-shimmer 4s linear infinite", marginBottom:10,
      }}>BERYL LIVE</div>

      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontStyle:"italic", color:"rgba(255,255,255,.3)", marginBottom:48, letterSpacing:1 }}>
        Private Access · Authorized Users Only
      </div>

      {/* Dot display */}
      <div
        style={{
          display:"flex", gap:18, marginBottom:36,
          animation: shake ? "ag-shake .6s ease" : "none",
        }}
      >
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:16, height:16, borderRadius:"50%",
            background: i < input.length
              ? (wrong ? "#dc3c3c" : "linear-gradient(135deg,#c8a951,#f5e070)")
              : "rgba(255,255,255,.12)",
            border: `1px solid ${i < input.length ? (wrong ? "rgba(220,60,60,.6)" : "rgba(200,169,81,.5)") : "rgba(255,255,255,.18)"}`,
            transition:"background .15s, border-color .15s",
            boxShadow: i < input.length && !wrong ? "0 0 10px rgba(200,169,81,.4)" : "none",
          }} />
        ))}
      </div>

      {/* Keypad */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,72px)", gap:10 }}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, idx) => {
          if (k === "") return <div key={idx} />;
          return (
            <button
              key={idx}
              className="ag-key"
              onClick={() => k === "⌫" ? handleClear() : handleDigit(k)}
              style={{
                width:72, height:72, borderRadius:10,
                border:"1px solid rgba(200,169,81,.2)",
                background:"rgba(200,169,81,.05)",
                color: k === "⌫" ? "rgba(200,169,81,.5)" : "#fff",
                fontSize: k === "⌫" ? 20 : 22, fontWeight:600,
                fontFamily:"'Cinzel',serif",
                cursor:"pointer", transition:"background .15s, border-color .15s, transform .1s",
                animation:"ag-glow 4s ease-in-out infinite",
              }}
            >{k}</button>
          );
        })}
      </div>

      {wrong && (
        <div style={{ marginTop:24, fontFamily:"'Cormorant Garamond',serif", fontSize:14, fontStyle:"italic", color:"#dc3c3c" }}>
          Incorrect code. Try again.
        </div>
      )}

      <div style={{ position:"absolute", bottom:28, fontSize:10, letterSpacing:2, color:"rgba(255,255,255,.12)", textTransform:"uppercase" }}>
        Beryl AI Labs · Berylize.com
      </div>
    </div>
  );
}
