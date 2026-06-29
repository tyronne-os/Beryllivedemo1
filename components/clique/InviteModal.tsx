"use client";
import { useState } from "react";
import { inviteLink } from "@/lib/clique-participants";

/**
 * Invite real humans into the Clique room — the flow that turns Clique into
 * a true video-conferencing platform. Share the link; teammates join the same
 * room as the AI agents, live.
 */
export default function InviteModal({
  roomCode, onClose,
}: {
  roomCode: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = inviteLink(roomCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,.55)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 10, padding: 30,
        width: "100%", maxWidth: 440,
        border: "1px solid rgba(200,169,81,.3)",
        boxShadow: "0 20px 80px rgba(0,0,0,.3)",
      }}>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase", color: "#0D1117", marginBottom: 8,
        }}>Invite Humans to the Room</div>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#666",
          fontStyle: "italic", lineHeight: 1.6, marginBottom: 24,
        }}>
          Share this link and your teammates join face-to-face — in the same room
          as your AI clique. Real people, real agents, one live conversation.
        </p>

        {/* Room code */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
            textTransform: "uppercase", color: "#c8a951", marginBottom: 8,
          }}>Room Code</div>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 30, fontWeight: 700,
            letterSpacing: 8, color: "#0D1117", textAlign: "center",
            padding: "12px 0", background: "#FDFAF6", borderRadius: 6,
            border: "1px solid rgba(200,169,81,.2)",
          }}>{roomCode}</div>
        </div>

        {/* Shareable link */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 18, alignItems: "stretch",
        }}>
          <input
            readOnly value={link}
            onFocus={e => e.currentTarget.select()}
            style={{
              flex: 1, padding: "11px 12px",
              border: "1px solid rgba(200,169,81,.3)", borderRadius: 6,
              fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#555",
              background: "#FDFAF6", overflow: "hidden", textOverflow: "ellipsis",
            }}
          />
          <button onClick={copy} style={{
            padding: "0 18px",
            fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap",
            background: copied
              ? "rgba(76,175,80,.15)"
              : "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
            border: copied ? "1px solid rgba(76,175,80,.5)" : "none",
            color: copied ? "#2e7d32" : "#0a0604", cursor: "pointer", borderRadius: 6,
          }}>{copied ? "✓ Copied" : "Copy"}</button>
        </div>

        {/* Share targets */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {[
            { label: "Email",   icon: "📧", href: `mailto:?subject=Join my Clique&body=Join my Beryl Clique meeting: ${encodeURIComponent(link)}` },
            { label: "Message", icon: "💬", href: `sms:?body=Join my Beryl Clique: ${encodeURIComponent(link)}` },
          ].map(s => (
            <a key={s.label} href={s.href} style={{
              flex: 1, textAlign: "center", padding: "10px",
              border: "1px solid rgba(200,169,81,.25)", borderRadius: 6,
              textDecoration: "none",
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1.5,
              textTransform: "uppercase", color: "#888",
            }}>{s.icon} {s.label}</a>
          ))}
        </div>

        <div style={{
          padding: "12px 14px", background: "rgba(200,169,81,.05)",
          border: "1px solid rgba(200,169,81,.15)", borderRadius: 6,
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#999",
            fontStyle: "italic", lineHeight: 1.6, margin: 0,
          }}>
            🔒 Humans join over LiveKit (encrypted WebRTC). Your AI agents stay
            live in the same room — everyone sees and hears each other in real time.
          </p>
        </div>
      </div>
    </div>
  );
}
