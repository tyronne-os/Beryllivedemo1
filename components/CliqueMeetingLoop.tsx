"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const AGENTS = [
  { id: "jeff",   name: "Jeff",   role: "GLM · Strategy",  img: "/characters/jeff.png",   color: "#378ADD" },
  { id: "nu",     name: "Nu",     role: "Qwen · Research", img: "/characters/nu.png",     color: "#7F77DD" },
  { id: "amanda", name: "Amanda", role: "Llama · CSA",     img: "/characters/amanda.png", color: "#D4537E" },
  { id: "india",  name: "India",  role: "Mistral · Ops",   img: "/characters/india.png",  color: "#1D9E75" },
];

export default function CliqueMeetingLoop() {
  const [speakingIdx, setSpeakingIdx] = useState(1);
  const [seconds, setSeconds] = useState(257);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const speakInterval = setInterval(() => {
      setSpeakingIdx(i => (i + 1) % AGENTS.length);
    }, 3200);
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      clearInterval(speakInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div style={{
      background: "#050810",
      borderRadius: 16,
      border: "1px solid #2a2040",
      overflow: "hidden",
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 960,
      margin: "0 auto",
    }}>

      {/* TOP BAR */}
      <div style={{
        background: "#0a0d1a",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "linear-gradient(135deg,#C9A84C,#F5D98B)",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#050810",
          }}>B</div>
          <span style={{
            fontFamily: "'Space Mono','Courier New',monospace",
            fontSize: 11, letterSpacing: 4, fontWeight: 700,
            color: "#C9A84C", textTransform: "uppercase",
          }}>Beryl · Clique</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LiveBadge />
          <span style={{
            fontFamily: "monospace", fontSize: 11, color: "#7a8aaa", letterSpacing: 1,
          }}>{`00:${mm}:${ss}`}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["settings","maximize"].map(icon => (
            <div key={icon} style={{
              width: 30, height: 30, borderRadius: 6,
              background: "#0f1430", border: "1px solid #1e2540",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#7a8aaa", fontSize: 14,
            }}>
              <i className={`ti ti-${icon}`} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {/* STAGE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "auto auto",
        gap: 3,
        background: "#030508",
        padding: 3,
      }}>
        {/* TOP ROW: Jeff | Nu */}
        <AgentPanel agent={AGENTS[0]} speaking={speakingIdx === 0} />
        <AgentPanel agent={AGENTS[1]} speaking={speakingIdx === 1} />

        {/* BOTTOM ROW: Amanda | India */}
        <AgentPanel agent={AGENTS[2]} speaking={speakingIdx === 2} />
        <AgentPanel agent={AGENTS[3]} speaking={speakingIdx === 3} />
      </div>

      {/* MARCUS CENTER STRIP */}
      <div style={{
        background: "#0a0d1a",
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          border: "2px solid #C9A84C",
          overflow: "hidden", flexShrink: 0,
          position: "relative",
        }}>
          <Image
            src="/characters/jaydian.jpg"
            alt="Jaydian"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e8d8a0", letterSpacing: 0.5 }}>Jaydian</div>
          <div style={{ fontSize: 10, color: "#C9A84C88", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
            Host · Beryl AI Labs
          </div>
        </div>
        <SpeakingWave active={true} color="#C9A84C" />
        <div style={{
          background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 4, padding: "3px 10px",
          fontSize: 10, color: "#C9A84C", letterSpacing: 1.5, textTransform: "uppercase",
        }}>Speaking</div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        background: "#0a0d1a",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[
            { icon: "microphone", active: true },
            { icon: "video", active: true },
            { icon: "screen-share", active: false },
            { icon: "message", active: false },
          ].map(({ icon, active }) => (
            <div key={icon} style={{
              width: 36, height: 36, borderRadius: 8,
              background: active ? "rgba(201,168,76,0.1)" : "#0f1430",
              border: `1px solid ${active ? "rgba(201,168,76,0.4)" : "#1e2540"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: active ? "#C9A84C" : "#8090b8", fontSize: 16,
            }}>
              <i className={`ti ti-${icon}`} aria-hidden="true" />
            </div>
          ))}
          <div style={{
            width: 44, height: 36, borderRadius: 8,
            background: "#3a0a0a", border: "1px solid rgba(255,60,60,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ff5c5c", fontSize: 16,
          }}>
            <i className="ti ti-phone-off" aria-hidden="true" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[["4","Agents"],["28ms","Latency"],["HD","Quality"]].map(([val,lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 9, color: "#4a5a7a", textTransform: "uppercase", letterSpacing: 1, marginTop: 1 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function AgentPanel({ agent, speaking }: { agent: typeof AGENTS[0]; speaking: boolean }) {
  return (
    <div style={{
      background: "#0a0d1a",
      borderRadius: 8,
      border: `1px solid ${speaking ? "rgba(201,168,76,0.55)" : "#1e2540"}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "border-color 0.4s",
      minHeight: 200,
    }}>
      {/* Photo area */}
      <div style={{ flex: 1, position: "relative", minHeight: 160 }}>
        <Image
          src={agent.img}
          alt={agent.name}
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
        {/* Dark gradient at bottom */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(5,8,16,0.75) 100%)",
          pointerEvents: "none",
        }} />
        {/* Gold corners on speaking panel */}
        {speaking && (
          <>
            <div style={{ position:"absolute",top:7,left:7,width:14,height:14,borderTop:"2px solid #C9A84C",borderLeft:"2px solid #C9A84C" }} />
            <div style={{ position:"absolute",top:7,right:7,width:14,height:14,borderTop:"2px solid #C9A84C",borderRight:"2px solid #C9A84C" }} />
            <div style={{ position:"absolute",bottom:36,left:7,width:14,height:14,borderBottom:"2px solid #C9A84C",borderLeft:"2px solid #C9A84C" }} />
            <div style={{ position:"absolute",bottom:36,right:7,width:14,height:14,borderBottom:"2px solid #C9A84C",borderRight:"2px solid #C9A84C" }} />
          </>
        )}
        {/* Live pip */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 7, height: 7, borderRadius: "50%",
          background: speaking ? "#C9A84C" : "#44ee88",
        }} />
        {/* Speaking wave overlay */}
        {speaking && (
          <div style={{ position: "absolute", bottom: 36, right: 10 }}>
            <SpeakingWave active={true} color="#C9A84C" />
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        padding: "6px 10px",
        background: "rgba(0,0,0,0.6)",
        borderTop: `1px solid ${speaking ? "rgba(201,168,76,0.2)" : "rgba(30,37,64,0.6)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: speaking ? "#e8d8a0" : "#c8d0e8", letterSpacing: 0.5 }}>
            {agent.name}
          </div>
          <div style={{ fontSize: 9, color: speaking ? "rgba(201,168,76,0.7)" : "#5a6a8a", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {agent.role}
          </div>
        </div>
        <SignalBars full={speaking} />
      </div>
    </div>
  );
}

function SpeakingWave({ active, color }: { active: boolean; color: string }) {
  const heights = [5, 12, 7, 14, 6, 10, 4];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: active ? h : 3,
          transition: `height ${0.3 + i * 0.08}s ease-in-out`,
          animation: active ? `speakBar${i % 3} ${0.35 + i * 0.07}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
      <style>{`
        @keyframes speakBar0{from{height:4px}to{height:14px}}
        @keyframes speakBar1{from{height:7px}to{height:18px}}
        @keyframes speakBar2{from{height:5px}to{height:12px}}
      `}</style>
    </div>
  );
}

function SignalBars({ full }: { full: boolean }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
      {[4, 7, 10].map((h, i) => (
        <div key={i} style={{
          width: 3, height: h, borderRadius: 1,
          background: "#C9A84C",
          opacity: full ? 1 : i === 2 ? 0.3 : i === 1 ? 0.6 : 1,
        }} />
      ))}
    </div>
  );
}

function LiveBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      background: "#1a0505", border: "1px solid rgba(255,60,60,0.35)",
      borderRadius: 4, padding: "3px 9px",
      fontSize: 10, fontWeight: 700, color: "#ff5c5c",
      letterSpacing: 2, textTransform: "uppercase",
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%", background: "#ff3c3c",
        animation: "livePulse 1.2s ease-in-out infinite",
      }} />
      Live
      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
