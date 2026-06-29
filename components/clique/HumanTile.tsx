"use client";
import { useEffect, useRef } from "react";
import { HumanParticipant } from "@/lib/clique-participants";

/**
 * A human participant tile — the proof that Clique mixes real people and AI
 * in one room. Local user shows a mirrored webcam; remote teammates show their
 * LiveKit track, or a clean initials-avatar when their camera is off.
 */
export default function HumanTile({
  human, size = "md",
}: {
  human: HumanParticipant;
  size?: "md" | "lg";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dim = size === "lg" ? 200 : 168;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = human.stream;
      if (human.stream) videoRef.current.play().catch(() => {});
    }
  }, [human.stream]);

  const showVideo = human.camOn && human.stream;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: dim, height: dim,
        borderRadius: 10,
        background: "#0f0a05",
        border: human.isLocal
          ? "3px solid rgba(200,169,81,.7)"
          : "2px solid rgba(255,255,255,.14)",
        boxShadow: human.isLocal
          ? "0 0 0 5px rgba(200,169,81,.1), 0 8px 30px rgba(0,0,0,.2)"
          : "0 6px 22px rgba(0,0,0,.16)",
        position: "relative", overflow: "hidden", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Live webcam / remote track */}
        <video
          ref={videoRef}
          autoPlay playsInline muted={human.isLocal}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
            transform: human.isLocal ? "scaleX(-1)" : "none",
            display: showVideo ? "block" : "none",
          }}
        />

        {/* Camera-off avatar */}
        {!showVideo && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: dim * 0.42, height: dim * 0.42, borderRadius: "50%",
              background: `linear-gradient(135deg,${human.color}cc,${human.color}66)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Cinzel',serif", fontSize: dim * 0.16, fontWeight: 700,
              color: "#0a0604", letterSpacing: 1,
              boxShadow: `0 0 24px ${human.color}44`,
            }}>{human.initials}</div>
            {human.connection === "connecting" && (
              <span style={{
                fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(200,169,81,.5)",
              }}>Connecting…</span>
            )}
            {human.connection === "invited" && (
              <span style={{
                fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(255,255,255,.35)",
              }}>Invited</span>
            )}
          </div>
        )}

        {/* HUMAN badge — top-left */}
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 2,
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(255,255,255,.12)", backdropFilter: "blur(6px)",
          borderRadius: 4, padding: "3px 7px",
          border: "1px solid rgba(255,255,255,.18)",
        }}>
          <span style={{ fontSize: 9 }}>👤</span>
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: 1.5,
            textTransform: "uppercase", color: "rgba(255,255,255,.75)",
          }}>{human.isHost ? "Host" : "Human"}</span>
        </div>

        {/* Live dot — top-right when connected with cam */}
        {human.connection === "connected" && (
          <div style={{
            position: "absolute", top: 9, right: 9, zIndex: 2,
            width: 8, height: 8, borderRadius: "50%", background: "#4CAF50",
            boxShadow: "0 0 8px #4CAF50",
          }} />
        )}

        {/* Muted badge — bottom-right */}
        {!human.micOn && (
          <div style={{
            position: "absolute", bottom: 8, right: 8, zIndex: 2,
            background: "#dc3c3c", borderRadius: "50%",
            width: 22, height: 22, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 10,
          }}>🔇</div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 600,
          color: "#0D1117", letterSpacing: 1,
        }}>{human.name}</div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
          color: "#888", fontStyle: "italic", marginTop: 2,
        }}>{human.role}</div>
      </div>
    </div>
  );
}
