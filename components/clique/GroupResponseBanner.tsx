"use client";
import { useEffect, useRef, useState } from "react";
import { GRIClip, GRICategory, playClipSpeech } from "@/lib/gri";
import { CLIQUE_ROSTER } from "@/lib/clique-roster";

interface Props {
  clip: GRIClip | null;
  category: GRICategory | null;
  onDone: () => void;
}

const CATEGORY_LABEL: Record<GRICategory, string> = {
  CELEBRATION:   "🎉 The clique is celebrating with you",
  GREETING:      "👋 Your clique says good morning",
  AGREEMENT:     "✓ The room agrees",
  ENCOURAGEMENT: "💪 Your clique has your back",
  SIGN_OFF:      "✨ Until next time",
  SURPRISE:      "😲 The clique reacts",
  THINKING:      "🤔 The room is thinking",
};

export default function GroupResponseBanner({ clip, category, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!clip || !category) { setVisible(false); return; }

    setVisible(true);
    setLine("");

    // If pre-rendered audio exists, play it; otherwise use Web Speech API
    if (clip.audioUrl) {
      const audio = new Audio(clip.audioUrl);
      audio.play().catch(() => {});
      const timer = setTimeout(() => { setVisible(false); onDone(); }, clip.durationMs + 500);
      return () => { audio.pause(); clearTimeout(timer); };
    } else {
      let lineIdx = 0;
      const showLines = () => {
        if (lineIdx < clip.speechLines.length) {
          setLine(clip.speechLines[lineIdx].text);
          lineIdx++;
        }
      };
      showLines();
      const interval = setInterval(showLines, clip.durationMs / clip.speechLines.length);
      const stop = playClipSpeech(clip, () => {
        setVisible(false);
        onDone();
      });
      stopRef.current = stop;
      const timer = setTimeout(() => { setVisible(false); onDone(); }, clip.durationMs + 2000);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
        stopRef.current?.();
      };
    }
  }, [clip, category, onDone]);

  if (!visible || !clip || !category) return null;

  const featured = clip.agentIds
    .map(id => CLIQUE_ROSTER.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div style={{
      position: "fixed",
      bottom: 90, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 250,
      background: "rgba(13,9,5,.97)",
      border: "1px solid rgba(200,169,81,.45)",
      borderRadius: 12,
      padding: "16px 24px",
      minWidth: 320,
      maxWidth: 560,
      boxShadow: "0 8px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(200,169,81,.1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      animation: "gri-in .3s cubic-bezier(.34,1.56,.64,1) both",
    }}>
      <style>{`
        @keyframes gri-in {
          from { opacity:0; transform:translateX(-50%) translateY(16px) scale(.95); }
          to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes gri-portrait-pop {
          0%   { transform:scale(1); }
          50%  { transform:scale(1.1); }
          100% { transform:scale(1); }
        }
      `}</style>

      {/* Category label */}
      <div style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 10,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: "#c8a951",
      }}>{CATEGORY_LABEL[category]}</div>

      {/* Agent portraits */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {featured.map((agent, i) => agent && (
          <div key={agent.id} style={{
            width: 44, height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(200,169,81,.5)",
            flexShrink: 0,
            animation: `gri-portrait-pop .4s ease ${i * 80}ms both`,
          }}>
            <img
              src={agent.portrait}
              alt={agent.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        ))}
      </div>

      {/* Live speech line */}
      {line && (
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 15,
          color: "rgba(255,255,255,.88)",
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.5,
          margin: 0,
        }}>"{line}"</p>
      )}
    </div>
  );
}
