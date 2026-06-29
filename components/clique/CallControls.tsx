"use client";

interface Props {
  mic: boolean;
  cam: boolean;
  onMic: () => void;
  onCam: () => void;
  onEnd: () => void;
  onNotes: () => void;
  onChat: () => void;
  onAccess: () => void;
  onCallMe: () => void;
  onInvite: () => void;
  isScribeActive: boolean;
  hasPhone: boolean;
}

function Btn({ label, icon, onClick, active, danger, dim }: {
  label: string; icon: string; onClick: () => void;
  active?: boolean; danger?: boolean; dim?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        padding: "9px 14px",
        background: danger
          ? "rgba(220,60,60,.12)"
          : active
            ? "rgba(200,169,81,.18)"
            : "rgba(255,255,255,.05)",
        border: danger
          ? "1px solid rgba(220,60,60,.4)"
          : active
            ? "1px solid rgba(200,169,81,.55)"
            : "1px solid rgba(200,169,81,.12)",
        borderRadius: 8, cursor: "pointer",
        transition: "background .2s, border-color .2s",
        minWidth: 52, opacity: dim ? 0.45 : 1,
      }}
    >
      <span style={{ fontSize: 17 }}>{icon}</span>
      <span style={{
        fontFamily: "'Cinzel',serif", fontSize: 7,
        letterSpacing: 1.5, textTransform: "uppercase",
        color: danger ? "#dc3c3c" : active ? "#c8a951" : "rgba(200,169,81,.55)",
        whiteSpace: "nowrap",
      }}>{label}</span>
    </button>
  );
}

export default function CallControls({
  mic, cam, onMic, onCam, onEnd, onNotes, onChat, onAccess, onCallMe, onInvite, isScribeActive, hasPhone,
}: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, padding: "14px 20px",
      background: "rgba(13,9,5,.97)",
      borderTop: "1px solid rgba(200,169,81,.15)",
      flexWrap: "wrap",
    }}>
      <Btn label={mic ? "Mic On" : "Muted"}    icon={mic ? "🎤" : "🔇"} onClick={onMic}     active={mic} />
      <Btn label={cam ? "Cam On" : "Cam Off"}  icon={cam ? "📹" : "📷"} onClick={onCam}     active={cam} />
      <Btn label="Invite"                        icon="➕"               onClick={onInvite}  active />
      <Btn label="Chat"                          icon="💬"               onClick={onChat} />
      <Btn label={isScribeActive ? "Scribe ●" : "Scribe"} icon="📝"     onClick={onNotes}    active={isScribeActive} />
      <Btn label="Access"                        icon="🔑"               onClick={onAccess} />
      <Btn label="Call Me"                       icon="📞"               onClick={onCallMe}   active={hasPhone} />

      {/* Spacer */}
      <div style={{ flex: 1, minWidth: 16 }} />

      <Btn label="End Call" icon="⬛" onClick={onEnd} danger />
    </div>
  );
}
