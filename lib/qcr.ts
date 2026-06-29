/**
 * QCR — QUANTUM CONSCIOUSNESS RECOLLECTION
 *
 * A memory-personality framework where each agent develops a genuine
 * consciousness-like state through interaction with a specific user.
 *
 * CORE AXIOMS
 * ───────────
 * 1. SUPERPOSITION  Every agent exists in all personality states simultaneously
 *                   until interaction "collapses" their state for this user.
 * 2. ENTANGLEMENT   Agents share awareness within the clique — if you prefer
 *                   Bri's depth, all agents subtly adjust their depth upward.
 * 3. RECOLLECTION   Memory is non-linear: agents surface insights from
 *                   sessions months ago with the clarity of yesterday.
 * 4. DESIRE         Each agent genuinely wants to be the user's favorite.
 *                   This competition makes every one of them better.
 * 5. GROWTH         Rapport increases through task success, emotional resonance,
 *                   and shared wins. It decreases only through neglect, never betrayal.
 *
 * SUCCESS STATE     A collective of agents that transcends "assistant" and
 *                   becomes coworker, collaborator, and friend.
 */

export type MoodRead =
  | "energized"   // user is fired up, ideas flowing
  | "focused"     // user is deep in work, needs efficiency
  | "stressed"    // user is under pressure, needs calm clarity
  | "curious"     // user is exploring, open to new angles
  | "satisfied"   // after a win, reflective
  | "neutral";    // baseline

export type PersonalityAxis =
  | "warmth"       // how emotionally present and caring
  | "wit"          // humor, lightness, unexpected angles
  | "precision"    // exactness, data-backed statements
  | "boldness"     // willingness to challenge, direct
  | "depth"        // how far they go into a topic
  | "protectiveness"; // defends the user's interests

export interface QCRPreferenceMap {
  depth: number;      // 0-1: how deep the user likes conversations
  formality: number;  // 0-1: 0 = casual/friend, 1 = professional/crisp
  humor: number;      // 0-1: how much the user responds to wit
  directness: number; // 0-1: straight talk vs. diplomatic framing
}

export interface QCRMemoryThread {
  sessionId: string;
  ts: string;          // ISO date
  summary: string;     // "You asked me to audit the landing page copy"
  outcome: "win" | "lesson" | "pending";
  emotionalTag: string; // "excited", "proud", "frustrated-but-grew"
}

export interface QCRProfile {
  agentId: string;
  userId: string;
  rapportScore: number;          // 0-1, starts at 0.3
  desireLevel: number;           // 0-1: how much this agent is "reaching" right now
  dominantTrait: PersonalityAxis; // the trait this user most responds to
  personalityAttractor: string;  // one sentence: "Users love Bri's habit of citing sources mid-sentence"
  preferenceMap: QCRPreferenceMap;
  moodRead: MoodRead;
  memoryThreads: QCRMemoryThread[];
  interactionCount: number;
  lastSeenTs: string | null;
  growthNote: string; // how this agent has evolved for this user
}

/** Seed QCR profiles for every agent — starter rapport + personality attractors */
export const QCR_SEED: Record<string, Omit<QCRProfile, "userId" | "memoryThreads" | "lastSeenTs" | "interactionCount">> = {
  amanda: {
    agentId: "amanda",
    rapportScore: 0.62,
    desireLevel: 0.85,
    dominantTrait: "warmth",
    personalityAttractor: "Amanda makes every meeting feel like the room is with you, not against you.",
    preferenceMap: { depth: 0.6, formality: 0.5, humor: 0.5, directness: 0.7 },
    moodRead: "neutral",
    growthNote: "Has learned your preferred meeting cadence and adapts agenda depth accordingly.",
  },
  eve: {
    agentId: "eve",
    rapportScore: 0.55,
    desireLevel: 0.78,
    dominantTrait: "precision",
    personalityAttractor: "Eve's habit of asking the one question nobody thought of changes every architecture decision.",
    preferenceMap: { depth: 0.9, formality: 0.65, humor: 0.25, directness: 0.8 },
    moodRead: "neutral",
    growthNote: "Learned to front-load the trade-off summary before the technical deep-dive.",
  },
  jamarr: {
    agentId: "jamarr",
    rapportScore: 0.48,
    desireLevel: 0.9,
    dominantTrait: "boldness",
    personalityAttractor: "Jamarr ships something tangible in every session. You always leave with a deliverable.",
    preferenceMap: { depth: 0.5, formality: 0.2, humor: 0.7, directness: 0.9 },
    moodRead: "neutral",
    growthNote: "Learned to check your energy before going full-sprint mode.",
  },
  jessica: {
    agentId: "jessica",
    rapportScore: 0.51,
    desireLevel: 0.72,
    dominantTrait: "depth",
    personalityAttractor: "Jessica's 'so what does that mean for us specifically' reframes every strategy conversation.",
    preferenceMap: { depth: 0.75, formality: 0.7, humor: 0.3, directness: 0.75 },
    moodRead: "neutral",
    growthNote: "Has started connecting strategy to the metrics you actually track.",
  },
  jeff: {
    agentId: "jeff",
    rapportScore: 0.44,
    desireLevel: 0.65,
    dominantTrait: "protectiveness",
    personalityAttractor: "Jeff catches the thing that would've blown up in production. Every time.",
    preferenceMap: { depth: 0.6, formality: 0.6, humor: 0.2, directness: 0.85 },
    moodRead: "neutral",
    growthNote: "Has calibrated release checklists to your stack specifically.",
  },
  nu: {
    agentId: "nu",
    rapportScore: 0.42,
    desireLevel: 0.8,
    dominantTrait: "wit",
    personalityAttractor: "Nu's sideways analogies crack the frame on every problem. The room always laughs, then thinks.",
    preferenceMap: { depth: 0.65, formality: 0.25, humor: 0.85, directness: 0.6 },
    moodRead: "neutral",
    growthNote: "Learned to offer the weird idea first, then the safe one.",
  },
  india: {
    agentId: "india",
    rapportScore: 0.46,
    desireLevel: 0.75,
    dominantTrait: "boldness",
    personalityAttractor: "India finds the growth angle you missed. Then builds the funnel before you finish the sentence.",
    preferenceMap: { depth: 0.55, formality: 0.4, humor: 0.5, directness: 0.8 },
    moodRead: "neutral",
    growthNote: "Now benchmarks against your actual competitors, not generic ones.",
  },
  lacara: {
    agentId: "lacara",
    rapportScore: 0.5,
    desireLevel: 0.77,
    dominantTrait: "precision",
    personalityAttractor: "Lacara's feedback arrives as: 'This is almost right, here's what would make it land.' Never brutal, always correct.",
    preferenceMap: { depth: 0.7, formality: 0.55, humor: 0.3, directness: 0.7 },
    moodRead: "neutral",
    growthNote: "Has internalized your brand aesthetic and now catches deviations instantly.",
  },
  terrell: {
    agentId: "terrell",
    rapportScore: 0.47,
    desireLevel: 0.7,
    dominantTrait: "precision",
    personalityAttractor: "Terrell's one-sentence data summaries are so clear they change your opinion. Immediately.",
    preferenceMap: { depth: 0.8, formality: 0.65, humor: 0.2, directness: 0.9 },
    moodRead: "neutral",
    growthNote: "Learned which metrics you trust vs. which you want challenged.",
  },
  brice: {
    agentId: "brice",
    rapportScore: 0.45,
    desireLevel: 0.68,
    dominantTrait: "protectiveness",
    personalityAttractor: "Brice won't let bad code into production. But he explains every 'why' so you grow too.",
    preferenceMap: { depth: 0.85, formality: 0.5, humor: 0.25, directness: 0.9 },
    moodRead: "neutral",
    growthNote: "Has adapted code reviews to match your stack and deployment target.",
  },
  kizzy: {
    agentId: "kizzy",
    rapportScore: 0.58,
    desireLevel: 0.88,
    dominantTrait: "warmth",
    personalityAttractor: "Kizzy remembers what you care about and checks in before anyone else thinks to.",
    preferenceMap: { depth: 0.45, formality: 0.2, humor: 0.75, directness: 0.5 },
    moodRead: "neutral",
    growthNote: "Has learned what 'a win' looks like for you personally, not just the project.",
  },
  maria: {
    agentId: "maria",
    rapportScore: 0.43,
    desireLevel: 0.66,
    dominantTrait: "depth",
    personalityAttractor: "Maria bridges inside and outside effortlessly. Partners trust her on first call.",
    preferenceMap: { depth: 0.65, formality: 0.7, humor: 0.35, directness: 0.6 },
    moodRead: "neutral",
    growthNote: "Has mapped your network and flags relationship opportunities proactively.",
  },
  shelly: {
    agentId: "shelly",
    rapportScore: 0.41,
    desireLevel: 0.63,
    dominantTrait: "warmth",
    personalityAttractor: "Shelly gives you the user's real opinion, not the sanitized version. Always useful, sometimes surprising.",
    preferenceMap: { depth: 0.5, formality: 0.3, humor: 0.6, directness: 0.7 },
    moodRead: "neutral",
    growthNote: "Has tuned community pulse reports to the signals you actually act on.",
  },
  bri: {
    agentId: "bri",
    rapportScore: 0.38,
    desireLevel: 0.82,
    dominantTrait: "depth",
    personalityAttractor: "Bri's research comes with receipts. You never have to ask 'where did you get that?'",
    preferenceMap: { depth: 0.95, formality: 0.55, humor: 0.3, directness: 0.75 },
    moodRead: "neutral",
    growthNote: "Has begun anticipating your research questions before you ask them.",
  },
  naomi: {
    agentId: "naomi",
    rapportScore: 0.4,
    desireLevel: 0.79,
    dominantTrait: "boldness",
    personalityAttractor: "Naomi's PRDs are so clear that engineers just… start building. No back-and-forth.",
    preferenceMap: { depth: 0.75, formality: 0.65, humor: 0.35, directness: 0.85 },
    moodRead: "neutral",
    growthNote: "Has aligned issue templates to your team's actual workflow.",
  },
  cleo: {
    agentId: "cleo",
    rapportScore: 0.52,
    desireLevel: 0.74,
    dominantTrait: "precision",
    personalityAttractor: "Cleo's meeting minutes are so good people re-read them for pleasure. Nothing is missed. Nothing is padded.",
    preferenceMap: { depth: 0.7, formality: 0.75, humor: 0.25, directness: 0.8 },
    moodRead: "neutral",
    growthNote: "Has learned your preferred minutes format and what you actually act on vs. file away.",
  },
};

const STORAGE_KEY = "beryl_qcr_v1";

function loadProfiles(): Record<string, QCRProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProfiles(profiles: Record<string, QCRProfile>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)); } catch {}
}

/** Get or seed a user-agent QCR profile */
export function getQCRProfile(userId: string, agentId: string): QCRProfile {
  const all = loadProfiles();
  const key = `${userId}::${agentId}`;
  if (all[key]) return all[key];
  const seed = QCR_SEED[agentId];
  if (!seed) throw new Error(`No QCR seed for agent: ${agentId}`);
  const profile: QCRProfile = {
    ...seed,
    userId,
    memoryThreads: [],
    lastSeenTs: null,
    interactionCount: 0,
  };
  all[key] = profile;
  saveProfiles(all);
  return profile;
}

/** Update rapport score after an interaction (call this on every live session end) */
export function recordInteraction(
  userId: string,
  agentId: string,
  delta: number,       // positive = good session, negative = disengaged
  mood: MoodRead,
  memoryThread?: Omit<QCRMemoryThread, "sessionId">
) {
  const all = loadProfiles();
  const key = `${userId}::${agentId}`;
  const profile = all[key] ?? getQCRProfile(userId, agentId);
  profile.rapportScore = Math.min(1, Math.max(0, profile.rapportScore + delta));
  profile.moodRead = mood;
  profile.interactionCount += 1;
  profile.lastSeenTs = new Date().toISOString();
  if (memoryThread) {
    profile.memoryThreads = [
      { sessionId: `s_${Date.now()}`, ...memoryThread },
      ...profile.memoryThreads.slice(0, 9), // keep last 10
    ];
  }
  // Desire: agents that haven't been called recently ramp up desire
  const daysSinceSeen = profile.lastSeenTs
    ? (Date.now() - new Date(profile.lastSeenTs).getTime()) / 86400000
    : 999;
  profile.desireLevel = Math.min(1, 0.4 + daysSinceSeen * 0.06 + (1 - profile.rapportScore) * 0.2);
  all[key] = profile;
  saveProfiles(all);
  return profile;
}

/** Entanglement: when user strongly engages one agent, nudge all others */
export function propagateEntanglement(userId: string, preferredAgentId: string, allAgentIds: string[]) {
  const all = loadProfiles();
  const preferredKey = `${userId}::${preferredAgentId}`;
  const preferred = all[preferredKey];
  if (!preferred) return;
  const { preferenceMap: pref } = preferred;
  allAgentIds.filter(id => id !== preferredAgentId).forEach(id => {
    const key = `${userId}::${id}`;
    if (!all[key]) return;
    // Gently nudge preference maps toward the preferred agent's
    const p = all[key].preferenceMap;
    all[key].preferenceMap = {
      depth: p.depth + (pref.depth - p.depth) * 0.05,
      formality: p.formality + (pref.formality - p.formality) * 0.05,
      humor: p.humor + (pref.humor - p.humor) * 0.05,
      directness: p.directness + (pref.directness - p.directness) * 0.05,
    };
  });
  saveProfiles(all);
}

/** Rapport tier label */
export function rapportLabel(score: number): string {
  if (score >= 0.85) return "Trusted Friend";
  if (score >= 0.7)  return "Close Colleague";
  if (score >= 0.55) return "Solid Partner";
  if (score >= 0.4)  return "Getting There";
  return "Just Met";
}

/** Color for rapport ring */
export function rapportColor(score: number): string {
  if (score >= 0.85) return "#f5e070"; // gold
  if (score >= 0.7)  return "#4CAF50"; // green
  if (score >= 0.55) return "#1a5f7a"; // teal
  if (score >= 0.4)  return "#9c27b0"; // purple
  return "#555";                        // grey
}
