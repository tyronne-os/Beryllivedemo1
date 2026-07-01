"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { CliqueAgent } from "@/lib/clique-roster";
import CLSTile from "./CLSTile";

type Channel = "group" | string; // string = agent id for DMs

interface ChatMsg {
  id: string;
  role: "user" | "agent" | "system";
  agentId?: string;
  agentName?: string;
  agentColor?: string;
  text: string;
  ts: number;
}

interface Props {
  agents: CliqueAgent[];  // Amanda + joined agents
}

const AGENT_COLOR: Record<string, string> = {
  amanda: "#c8a951",
  india:  "#4CAF50",
  jeff:   "#1a8fd1",
  nu:     "#9c27b0",
};

function agentColor(id: string) {
  return AGENT_COLOR[id] ?? "#888";
}

function tsLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CliqueChat({ agents }: Props) {
  const [channel, setChannel]     = useState<Channel>("group");
  const [messages, setMessages]   = useState<Record<Channel, ChatMsg[]>>({ group: [] });
  const [draft, setDraft]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Ensure each agent has a DM channel slot
  useEffect(() => {
    setMessages(prev => {
      const next = { ...prev };
      agents.forEach(a => { if (!next[a.id]) next[a.id] = []; });
      return next;
    });
  }, [agents]);

  const currentMessages = messages[channel] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const addMsg = useCallback((ch: Channel, msg: ChatMsg) => {
    setMessages(prev => ({
      ...prev,
      [ch]: [...(prev[ch] ?? []), msg],
    }));
  }, []);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");

    const userMsg: ChatMsg = { id: uuid(), role: "user", text, ts: Date.now() };
    addMsg(channel, userMsg);

    setTyping(true);

    try {
      const history = (messages[channel] ?? []).slice(-20).map(m => ({
        role: m.role,
        agentId: m.agentId,
        agentName: m.agentName,
        text: m.text,
        ts: m.ts,
      }));

      const res = await fetch("/api/clique/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, targetId: channel, history }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      for (const r of (data.responses ?? [])) {
        setAgentTyping(r.agentName);
        await new Promise(resolve => setTimeout(resolve, 420));
        addMsg(channel, {
          id: uuid(),
          role: "agent",
          agentId: r.agentId,
          agentName: r.agentName,
          agentColor: agentColor(r.agentId),
          text: r.text,
          ts: Date.now(),
        });
        setAgentTyping(null);
        await new Promise(resolve => setTimeout(resolve, 180));
      }
    } catch (e) {
      addMsg(channel, {
        id: uuid(), role: "system",
        text: `Connection error — ${String(e)}`, ts: Date.now(),
      });
    } finally {
      setTyping(false);
      setAgentTyping(null);
    }
  }, [draft, typing, channel, messages, addMsg]);

  const activeAgent = channel !== "group" ? agents.find(a => a.id === channel) : null;
  const channelTitle = channel === "group" ? "Clique — Group" : `${activeAgent?.name ?? channel} (Private)`;

  return (
    <div style={{
      display: "flex", height: "100%", background: "#0D1117", overflow: "hidden",
    }}>
      <style>{`
        @keyframes dot-bounce {
          0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)}
        }
        @keyframes msg-in {
          from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
        }
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 220, flexShrink: 0, background: "#070B0F",
        borderRight: "1px solid rgba(200,169,81,.1)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid rgba(200,169,81,.08)",
        }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, color: "#c8a951",
          }}>CLIQUE CHAT</div>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
            color: "rgba(255,255,255,.3)", fontStyle: "italic", marginTop: 2,
          }}>Messages · Agent Framework</div>
        </div>

        {/* Group channel */}
        <div style={{ padding: "10px 10px 4px" }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
            color: "rgba(200,169,81,.45)", textTransform: "uppercase", marginBottom: 4,
          }}>Channels</div>
          <SidebarItem
            label="# Group"
            active={channel === "group"}
            unread={(messages["group"] ?? []).filter(m => m.role === "agent").length > 0}
            onClick={() => setChannel("group")}
          />
        </div>

        {/* Direct messages */}
        <div style={{ padding: "10px 10px 4px" }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 2,
            color: "rgba(200,169,81,.45)", textTransform: "uppercase", marginBottom: 6,
          }}>Direct Messages</div>
          {agents.map(a => (
            <SidebarAgentRow
              key={a.id}
              agent={a}
              active={channel === a.id}
              color={agentColor(a.id)}
              unread={(messages[a.id] ?? []).filter(m => m.role === "agent").length > 0}
              onClick={() => setChannel(a.id)}
            />
          ))}
        </div>

        {/* Framework label */}
        <div style={{ marginTop: "auto", padding: "10px 12px", borderTop: "1px solid rgba(200,169,81,.06)" }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: 1.5,
            color: "rgba(255,255,255,.18)", textTransform: "uppercase",
          }}>Powered by</div>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 10,
            color: "rgba(255,255,255,.28)", fontStyle: "italic", marginTop: 2,
          }}>Microsoft Agent Framework</div>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Channel header */}
        <div style={{
          padding: "10px 18px", borderBottom: "1px solid rgba(200,169,81,.1)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          background: "rgba(7,11,15,.8)",
        }}>
          {activeAgent ? (
            <div style={{
              width: 24, height: 24, borderRadius: "50%", overflow: "hidden",
              border: `1px solid ${agentColor(activeAgent.id)}44`,
            }}>
              <CLSTile agent={activeAgent} variant="idle_a" size={24} borderRadius="50%" />
            </div>
          ) : (
            <span style={{ fontSize: 14, color: "rgba(200,169,81,.7)" }}>#</span>
          )}
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 600,
            letterSpacing: 1, color: "#fff",
          }}>{channelTitle}</span>
          {channel === "group" && (
            <span style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
              color: "rgba(255,255,255,.3)", fontStyle: "italic",
            }}>
              — {agents.length} agents · watch them reason, jump in any time
            </span>
          )}
          {activeAgent && (
            <span style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
              color: "rgba(255,255,255,.3)", fontStyle: "italic",
            }}>
              {activeAgent.role} · private
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "14px 18px",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {currentMessages.length === 0 && (
            <div style={{
              textAlign: "center", paddingTop: 40,
              fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
              color: "rgba(255,255,255,.2)", fontStyle: "italic",
            }}>
              {channel === "group"
                ? "Send a message to get the whole team talking. You can watch them reason through it together."
                : `Start a private conversation with ${activeAgent?.name}.`}
            </div>
          )}

          {currentMessages.map((msg, i) => (
            <MessageRow key={msg.id} msg={msg} agents={agents} prevSameAuthor={
              i > 0 &&
              currentMessages[i - 1].agentId === msg.agentId &&
              currentMessages[i - 1].role === msg.role &&
              msg.ts - currentMessages[i - 1].ts < 60_000
            } />
          ))}

          {/* Agent typing indicator */}
          {agentTyping && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
              animation: "msg-in .2s ease",
            }}>
              <div style={{
                fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 1,
                color: "rgba(200,169,81,.6)",
              }}>{agentTyping}</div>
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#c8a951",
                    animation: `dot-bounce 1.2s ${j * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: "10px 16px 14px", borderTop: "1px solid rgba(200,169,81,.1)",
          background: "rgba(7,11,15,.9)", flexShrink: 0,
        }}>
          <div style={{
            display: "flex", gap: 8, alignItems: "center",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(200,169,81,.18)",
            borderRadius: 6, padding: "2px 2px 2px 14px",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
              color: "rgba(200,169,81,.5)", fontStyle: "italic", flexShrink: 0,
            }}>
              {channel === "group" ? "Group ·" : `→ ${activeAgent?.name} ·`}
            </span>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Message the team…"
              disabled={typing}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "rgba(255,255,255,.85)",
                fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
                padding: "8px 0",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={typing || !draft.trim()}
              style={{
                padding: "7px 18px", borderRadius: 5,
                background: typing || !draft.trim()
                  ? "rgba(200,169,81,.12)"
                  : "linear-gradient(110deg,#8B6914,#c8a951,#f5e070,#c8a951,#8B6914)",
                border: "none", cursor: typing || !draft.trim() ? "default" : "pointer",
                fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
                letterSpacing: 1.5,
                color: typing || !draft.trim() ? "rgba(200,169,81,.3)" : "#0a0604",
                transition: "all .18s", flexShrink: 0,
              }}
            >Send →</button>
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 10,
            color: "rgba(255,255,255,.18)", fontStyle: "italic", marginTop: 5, paddingLeft: 2,
          }}>
            Enter to send · Shift+Enter for new line · agent replies stream in sequence
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar channel item ──────────────────────────────────────────────────────
function SidebarItem({ label, active, unread, onClick }: {
  label: string; active: boolean; unread: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px", borderRadius: 4, cursor: "pointer",
        background: active ? "rgba(200,169,81,.12)" : "transparent",
        marginBottom: 2, transition: "background .15s",
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{
        fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: .5,
        color: active ? "#c8a951" : "rgba(255,255,255,.55)", flex: 1,
      }}>{label}</span>
      {unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a951" }} />}
    </div>
  );
}

// ── Sidebar DM row ────────────────────────────────────────────────────────────
function SidebarAgentRow({ agent, active, color, unread, onClick }: {
  agent: CliqueAgent; active: boolean; color: string; unread: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 8px", borderRadius: 4, cursor: "pointer",
        background: active ? "rgba(200,169,81,.1)" : "transparent",
        marginBottom: 2, transition: "background .15s",
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: "50%", overflow: "hidden",
        border: `1.5px solid ${active ? color : color + "44"}`,
        flexShrink: 0,
      }}>
        <CLSTile agent={agent} variant="idle_a" size={22} borderRadius="50%" />
      </div>
      <span style={{
        fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: .5, flex: 1,
        color: active ? "#fff" : "rgba(255,255,255,.5)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{agent.name}</span>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
        background: unread ? "#c8a951" : color + "66",
      }} />
    </div>
  );
}

// ── Individual message row ────────────────────────────────────────────────────
function MessageRow({ msg, agents, prevSameAuthor }: {
  msg: ChatMsg;
  agents: CliqueAgent[];
  prevSameAuthor: boolean;
}) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  const agent = msg.agentId ? agents.find(a => a.id === msg.agentId) : null;

  if (isSystem) {
    return (
      <div style={{
        textAlign: "center", padding: "6px 0",
        fontFamily: "'Cormorant Garamond',serif", fontSize: 11,
        color: "rgba(255,255,255,.25)", fontStyle: "italic",
      }}>{msg.text}</div>
    );
  }

  if (isUser) {
    return (
      <div style={{
        display: "flex", justifyContent: "flex-end",
        marginTop: prevSameAuthor ? 2 : 10,
        animation: "msg-in .2s ease",
      }}>
        <div style={{ maxWidth: "72%" }}>
          {!prevSameAuthor && (
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1,
              color: "rgba(255,255,255,.3)", textAlign: "right",
              marginBottom: 3, textTransform: "uppercase",
            }}>You · {tsLabel(msg.ts)}</div>
          )}
          <div style={{
            background: "rgba(200,169,81,.13)",
            border: "1px solid rgba(200,169,81,.22)",
            borderRadius: "12px 2px 12px 12px",
            padding: "8px 14px",
            fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
            color: "rgba(255,255,255,.85)", lineHeight: 1.55,
          }}>{msg.text}</div>
        </div>
      </div>
    );
  }

  // Agent message
  const color = msg.agentColor ?? agentColor(msg.agentId ?? "");

  return (
    <div style={{
      display: "flex", gap: 9, alignItems: "flex-start",
      marginTop: prevSameAuthor ? 2 : 10,
      animation: "msg-in .25s ease",
    }}>
      {/* CLS avatar — only on first of a run */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", overflow: "hidden",
        flexShrink: 0, marginTop: 2,
        border: `1.5px solid ${color}55`,
        opacity: prevSameAuthor ? 0 : 1,
        visibility: prevSameAuthor ? "hidden" : "visible",
      }}>
        {agent && <CLSTile agent={agent} variant="idle_b" size={30} borderRadius="50%" />}
      </div>
      <div style={{ flex: 1 }}>
        {!prevSameAuthor && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
              letterSpacing: 1.5, color, textTransform: "uppercase",
            }}>{msg.agentName}</span>
            <span style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 10,
              color: "rgba(255,255,255,.25)",
            }}>{tsLabel(msg.ts)}</span>
          </div>
        )}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "2px 12px 12px 12px",
          padding: "8px 14px",
          fontFamily: "'Cormorant Garamond',serif", fontSize: 14,
          color: "rgba(255,255,255,.82)", lineHeight: 1.6,
          display: "inline-block", maxWidth: "100%",
        }}>{msg.text}</div>
      </div>
    </div>
  );
}
