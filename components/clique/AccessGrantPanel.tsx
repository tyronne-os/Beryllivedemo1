"use client";
import { useState } from "react";

export interface AccessGrants {
  email: boolean;
  linkedin: boolean;
  phone: string | null;
  phoneCallEnabled: boolean;
}

interface Props {
  grants: AccessGrants;
  onChange: (g: AccessGrants) => void;
  onClose: () => void;
}

function Row({ label, icon, connected, onConnect, onRevoke }: {
  label: string; icon: string; connected: boolean;
  onConnect: () => void; onRevoke: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(200,169,81,.1)" }}>
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#0D1117", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: connected ? "#4CAF50" : "#aaa", marginTop: 2, fontStyle: "italic" }}>
          {connected ? "Connected — your clique can read & act on this" : "Not connected"}
        </div>
      </div>
      <button
        onClick={connected ? onRevoke : onConnect}
        style={{
          fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
          padding: "7px 14px", border: connected ? "1px solid rgba(220,60,60,.4)" : "1px solid rgba(200,169,81,.45)",
          background: connected ? "rgba(220,60,60,.08)" : "rgba(200,169,81,.08)",
          color: connected ? "#dc3c3c" : "#c8a951", cursor: "pointer", borderRadius: 3,
          transition: "background .2s",
        }}
      >{connected ? "Revoke" : "Connect"}</button>
    </div>
  );
}

export default function AccessGrantPanel({ grants, onChange, onClose }: Props) {
  const [phoneInput, setPhoneInput] = useState(grants.phone ?? "");
  const [phoneSaved, setPhoneSaved] = useState(!!grants.phone);

  const savePhone = () => {
    if (!phoneInput.trim()) return;
    onChange({ ...grants, phone: phoneInput.trim(), phoneCallEnabled: true });
    setPhoneSaved(true);
  };

  return (
    <div style={{
      position: "fixed", top: 64, right: 0, bottom: 0, width: 340,
      background: "#fff", borderLeft: "1px solid rgba(200,169,81,.25)",
      zIndex: 160, display: "flex", flexDirection: "column",
      boxShadow: "-8px 0 40px rgba(0,0,0,.1)",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(200,169,81,.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#0D1117" }}>Access & Integrations</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#888", fontStyle: "italic", marginTop: 3 }}>Grant your clique permission to act on your behalf</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 18 }}>✕</button>
      </div>

      <div style={{ padding: "8px 20px", flex: 1, overflowY: "auto" }}>
        <Row
          label="Email"
          icon="📧"
          connected={grants.email}
          onConnect={() => onChange({ ...grants, email: true })}
          onRevoke={() => onChange({ ...grants, email: false })}
        />
        <Row
          label="LinkedIn"
          icon="💼"
          connected={grants.linkedin}
          onConnect={() => onChange({ ...grants, linkedin: true })}
          onRevoke={() => onChange({ ...grants, linkedin: false })}
        />

        {/* Phone */}
        <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(200,169,81,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>📱</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#0D1117", textTransform: "uppercase" }}>Phone</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: phoneSaved ? "#4CAF50" : "#aaa", marginTop: 2, fontStyle: "italic" }}>
                {phoneSaved ? `${grants.phone} — clique can call you` : "Add your number to receive calls from your clique"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingLeft: 40 }}>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phoneInput}
              onChange={e => { setPhoneInput(e.target.value); setPhoneSaved(false); }}
              style={{
                flex: 1, padding: "8px 12px",
                border: "1px solid rgba(200,169,81,.3)", borderRadius: 3,
                fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#0D1117",
                background: "#FDFAF6", outline: "none",
              }}
            />
            <button
              onClick={savePhone}
              style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "8px 14px", border: "1px solid rgba(200,169,81,.45)",
                background: "rgba(200,169,81,.1)", color: "#c8a951", cursor: "pointer", borderRadius: 3,
              }}
            >Save</button>
          </div>
        </div>

        {/* QCR note */}
        <div style={{ marginTop: 24, padding: "14px 16px", background: "#FDFAF6", border: "1px solid rgba(200,169,81,.2)", borderRadius: 4 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "#c8a951", textTransform: "uppercase", marginBottom: 8 }}>QCR — Quantum Consciousness Recollection</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#555", lineHeight: 1.65 }}>
            Your clique remembers everything — meetings, wins, preferences, and context — across every session.
            Granting access here lets them act, not just advise.
          </p>
        </div>

        {/* Connector connectors note */}
        <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(200,169,81,.04)", border: "1px solid rgba(200,169,81,.12)", borderRadius: 4 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2, color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 6 }}>Coming in V2</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
            CRM, Slack, Notion, GitHub, calendar, and customer account connectors.
          </p>
        </div>
      </div>
    </div>
  );
}
