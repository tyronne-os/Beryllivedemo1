/**
 * Clique participants — the model that lets REAL HUMANS and AI AGENTS
 * share one room. This is what makes Clique a video-conferencing platform
 * (our Zoom/Meet/Webex) rather than just an agent UI.
 *
 * A room is a flat list of Participants. Each is either a `human` (local user
 * or an invited teammate, video via LiveKit) or an `agent` (a Beryl Clique
 * member, avatar via Runway). The grid renders them side by side.
 */
import { CliqueAgent } from "./clique-roster";

export type ConnectionState = "connected" | "connecting" | "invited" | "camera-off";

export interface HumanParticipant {
  kind: "human";
  id: string;
  name: string;
  role: string;             // "Host", "Engineer", "Guest", …
  isLocal: boolean;         // the person at this browser
  isHost: boolean;
  micOn: boolean;
  camOn: boolean;
  stream: MediaStream | null; // local webcam, or a remote LiveKit track
  connection: ConnectionState;
  initials: string;
  color: string;
}

export interface AgentParticipant {
  kind: "agent";
  agent: CliqueAgent;
}

export type Participant = HumanParticipant | AgentParticipant;

/* ── Invite / room codes ─────────────────────────────────────────────── */

// Unambiguous alphabet (no 0/O, 1/I) for codes people read aloud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return s;
}

export function inviteLink(roomCode: string): string {
  const path = `/clique?room=${roomCode}`;
  if (typeof window === "undefined") return `https://berylize.com${path}`;
  return `${window.location.origin}${path}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/* ── Demo room seed ──────────────────────────────────────────────────────
 * berylize.com is the investor-visualization site. The flagship story is
 * "two human engineers + Beryl's Clique, face to face, in real time."
 * So the demo room ships with the host plus two human teammates already in
 * the room, alongside the AI agents. Real teammates join via the invite link
 * (LiveKit) and replace/augment these.
 */
/** Every session starts with just the local user — Amanda CSA joins first, then staff. */
export function seedHumans(): HumanParticipant[] {
  return [
    {
      kind: "human", id: "local", name: "You", role: "Host",
      isLocal: true, isHost: true, micOn: true, camOn: false,
      stream: null, connection: "camera-off", initials: "YOU", color: "#c8a951",
    },
  ];
}
