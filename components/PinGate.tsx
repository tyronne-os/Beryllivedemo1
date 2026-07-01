"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";

const CORRECT = "2440";

interface Props {
  children: ReactNode;
}

export default function PinGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits]     = useState(["", "", "", ""]);
  const [shake, setShake]       = useState(false);
  const [hint, setHint]         = useState("");
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem("bos_unlocked") === "1") setUnlocked(true);
      } catch { /* storage blocked */ }
    }
  }, []);

  useEffect(() => {
    if (!unlocked) setTimeout(() => refs[0].current?.focus(), 80);
  }, [unlocked]);

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs[i + 1].current?.focus();
    if (next.every(x => x !== "")) {
      const entered = next.join("");
      if (entered === CORRECT) {
        try { sessionStorage.setItem("bos_unlocked", "1"); } catch { /* */ }
        setUnlocked(true);
      } else {
        setShake(true);
        setHint("Incorrect code.");
        setTimeout(() => {
          setShake(false);
          setHint("");
          setDigits(["", "", "", ""]);
          refs[0].current?.focus();
        }, 700);
      }
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh", background: "#030201",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 0, position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes gold-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes gate-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        @keyframes gate-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(200,169,81,0); }
          50%      { box-shadow: 0 0 0 14px rgba(200,169,81,.06); }
        }
        .pin-input:focus { border-color: #c8a951 !important; box-shadow: 0 0 0 3px rgba(200,169,81,.18) !important; outline: none; }
      `}</style>

      {/* Gold grid */}
      <div style={{ position:"absolute", inset:0, opacity:.025, backgroundImage:"linear-gradient(rgba(200,169,81,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,81,1) 1px,transparent 1px)", backgroundSize:"64px 64px", pointerEvents:"none" }} />

      {/* Shield / BOS mark */}
      <div style={{ marginBottom: 32, textAlign:"center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          border: "2px solid rgba(200,169,81,.35)",
          background: "rgba(200,169,81,.06)",
          display: "flex", alignItems:"center", justifyContent:"center",
          margin: "0 auto 16px",
          animation: "gate-glow 3s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 26 }}>⚜</span>
        </div>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 4,
          textTransform: "uppercase", color: "rgba(200,169,81,.5)",
        }}>Beryl Operating System</div>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(200,169,81,.2)",
        borderRadius: 12, padding: "40px 48px",
        textAlign: "center", maxWidth: 360, width: "90%",
        animation: shake ? "gate-shake .5s ease" : "none",
      }}>
        <div style={{
          fontFamily: "'Cinzel Decorative','Cinzel',serif",
          fontSize: 20, fontWeight: 900, letterSpacing: 2,
          background: "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "gold-shimmer 4s linear infinite",
          marginBottom: 8,
        }}>Restricted Access</div>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
          color: "rgba(255,255,255,.4)", fontStyle: "italic",
          lineHeight: 1.6, marginBottom: 32,
        }}>
          Enter your 4-digit BOS code to continue.
        </p>

        {/* PIN inputs */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 20 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              className="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 52, height: 60, textAlign: "center",
                fontSize: 24, fontFamily: "'Cinzel',serif",
                background: "rgba(255,255,255,.05)",
                border: `1px solid ${shake ? "rgba(220,60,60,.6)" : "rgba(200,169,81,.25)"}`,
                borderRadius: 8, color: "#f5e070",
                transition: "border-color .15s, box-shadow .15s",
                caretColor: "transparent",
              }}
            />
          ))}
        </div>

        {hint && (
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
            color: "#dc3c3c", textTransform: "uppercase", marginBottom: 8,
          }}>{hint}</div>
        )}

        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
          color: "rgba(255,255,255,.18)", fontStyle: "italic", marginTop: 8,
        }}>
          Authorized personnel only.
        </div>
      </div>

      <div style={{
        marginTop: 32, fontFamily: "'Cinzel',serif", fontSize: 8,
        letterSpacing: 3, color: "rgba(200,169,81,.2)", textTransform: "uppercase",
      }}>© 2026 Beryl AI Labs</div>
    </div>
  );
}
