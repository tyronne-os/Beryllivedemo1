/**
 * GRI — GROUP RESPONSE INTELLIGENCE
 *
 * A cost-free trigger system for collective agent moments.
 * Pre-rendered audio/video clips play when the room should respond as one.
 * No API call at trigger time — everything is a pre-built vault.
 *
 * ARCHITECTURE
 * ────────────
 * 1. DETECTOR   Pure keyword + sentiment pattern matching on the live transcript.
 *               No LLM needed. Runs client-side, zero cost.
 * 2. VAULT      Library of pre-rendered group audio clips (ElevenLabs/MiniMax bulk
 *               renders, done once, served free forever). Fallback = Web Speech API.
 * 3. SELECTOR   Picks a random clip from the matched category.
 *               Anti-repeat memory (never plays same clip twice in a row).
 * 4. COOLDOWN   30s minimum between group responses. The room never over-reacts.
 *
 * VAULT CATEGORIES
 * ────────────────
 * CELEBRATION   "You crushed it!" collective cheer
 * GREETING      Morning / session-start welcome
 * AGREEMENT     Collective nod — "Exactly, that's it"
 * ENCOURAGEMENT "You've got this, keep going"
 * SIGN_OFF      End-of-session collective goodbye
 * SURPRISE      Wow / that's unexpected
 * THINKING      Collective "hmm, let us think on that"
 */

export type GRICategory =
  | "CELEBRATION"
  | "GREETING"
  | "AGREEMENT"
  | "ENCOURAGEMENT"
  | "SIGN_OFF"
  | "SURPRISE"
  | "THINKING";

export interface GRIClip {
  id: string;
  category: GRICategory;
  /** Path under /gri-vault/ or a full URL. Falls back to speechLines if null. */
  audioUrl: string | null;
  /** Web Speech API fallback lines — one per agent voice */
  speechLines: Array<{ text: string; voice?: string; pitch?: number; rate?: number }>;
  /** Which agent portraits to highlight during playback */
  agentIds: string[];
  durationMs: number;
}

/** Trigger patterns per category — pure string matching, no LLM */
const TRIGGERS: Record<GRICategory, string[]> = {
  CELEBRATION: [
    "good job", "great job", "great work", "well done", "amazing work",
    "you crushed it", "nailed it", "killed it", "you did it", "we did it",
    "proud of you", "fantastic", "excellent work", "that was incredible",
    "we shipped", "it's live", "we launched",
  ],
  GREETING: [
    "good morning", "good afternoon", "good evening",
    "hello everyone", "hey team", "hi everyone", "hey guys",
    "what's up team", "morning everyone", "let's get started",
  ],
  AGREEMENT: [
    "exactly", "that's right", "i agree", "absolutely", "totally agree",
    "you're right", "yes exactly", "that's it", "spot on", "100%",
  ],
  ENCOURAGEMENT: [
    "keep going", "you got this", "don't give up", "almost there",
    "stay with it", "you can do it", "we believe in you", "push through",
  ],
  SIGN_OFF: [
    "good night", "bye everyone", "see you tomorrow", "signing off",
    "great meeting", "talk soon", "have a good one", "until next time",
    "that's a wrap", "we're done", "meeting adjourned",
  ],
  SURPRISE: [
    "no way", "oh wow", "seriously", "are you serious", "that's wild",
    "i can't believe", "unbelievable", "wait what", "whoa",
  ],
  THINKING: [
    "let me think", "hmm", "good question", "that's a tough one",
    "interesting question", "not sure", "let's think about this",
  ],
};

/** Pre-built vault — swap audioUrl from null → real path once clips are rendered */
export const GRI_VAULT: GRIClip[] = [
  // ── CELEBRATION ──
  {
    id: "cel-01", category: "CELEBRATION", audioUrl: null,
    agentIds: ["amanda","eve","kizzy","jamarr","india"],
    durationMs: 3500,
    speechLines: [
      { text: "Yes! You crushed it!", voice: "shimmer", pitch: 1.1, rate: 1.1 },
      { text: "That's what I'm talking about!", voice: "ash", pitch: 1.0, rate: 1.05 },
      { text: "Incredible work. Seriously.", voice: "sage", pitch: 0.95, rate: 0.95 },
      { text: "We are SO proud of you right now.", voice: "coral", pitch: 1.05, rate: 1.0 },
      { text: "Let's go!", voice: "verse", pitch: 1.2, rate: 1.2 },
    ],
  },
  {
    id: "cel-02", category: "CELEBRATION", audioUrl: null,
    agentIds: ["naomi","bri","terrell","jeff","lacara"],
    durationMs: 4000,
    speechLines: [
      { text: "Outstanding. Genuinely outstanding.", voice: "ballad", pitch: 0.95, rate: 0.9 },
      { text: "The data doesn't lie — that was elite.", voice: "echo", pitch: 1.0, rate: 1.0 },
      { text: "Shipped clean, shipped fast. Perfect.", voice: "cedar", pitch: 1.0, rate: 0.95 },
      { text: "The design held up beautifully.", voice: "ballad", pitch: 1.05, rate: 1.0 },
      { text: "That's how we do it.", voice: "verse", pitch: 1.1, rate: 1.05 },
    ],
  },
  {
    id: "cel-03", category: "CELEBRATION", audioUrl: null,
    agentIds: ["amanda","kizzy","shelly","maria","nu"],
    durationMs: 3000,
    speechLines: [
      { text: "The whole room is celebrating right now.", voice: "marin", pitch: 1.0, rate: 1.0 },
      { text: "We've been rooting for you. This is everything.", voice: "coral", pitch: 1.05, rate: 0.95 },
      { text: "The community is going to love this.", voice: "shimmer", pitch: 1.0, rate: 1.0 },
      { text: "This is a moment.", voice: "sage", pitch: 0.9, rate: 0.9 },
    ],
  },

  // ── GREETING ──
  {
    id: "greet-01", category: "GREETING", audioUrl: null,
    agentIds: ["amanda","eve","kizzy"],
    durationMs: 3000,
    speechLines: [
      { text: "Good morning! Ready when you are.", voice: "marin", pitch: 1.0, rate: 1.0 },
      { text: "Morning. Let's make this a great one.", voice: "shimmer", pitch: 1.0, rate: 0.95 },
      { text: "Hey! So good to see you today.", voice: "coral", pitch: 1.1, rate: 1.05 },
    ],
  },
  {
    id: "greet-02", category: "GREETING", audioUrl: null,
    agentIds: ["jamarr","india","terrell","jeff"],
    durationMs: 2800,
    speechLines: [
      { text: "Let's get it! Big things today.", voice: "ash", pitch: 1.1, rate: 1.1 },
      { text: "Ready to build. What are we doing first?", voice: "coral", pitch: 1.0, rate: 1.05 },
      { text: "Numbers are prepped. Ready.", voice: "echo", pitch: 1.0, rate: 0.95 },
      { text: "Operations standing by.", voice: "cedar", pitch: 0.95, rate: 0.9 },
    ],
  },

  // ── AGREEMENT ──
  {
    id: "agree-01", category: "AGREEMENT", audioUrl: null,
    agentIds: ["eve","jessica","amanda","naomi"],
    durationMs: 2500,
    speechLines: [
      { text: "Exactly. That's precisely it.", voice: "shimmer", pitch: 1.0, rate: 0.95 },
      { text: "Agreed. That's the right call.", voice: "sage", pitch: 0.95, rate: 0.9 },
      { text: "Mmm-hmm. Yes, that's it.", voice: "marin", pitch: 1.0, rate: 0.95 },
      { text: "100%. Building on that right now.", voice: "ballad", pitch: 1.0, rate: 1.0 },
    ],
  },

  // ── ENCOURAGEMENT ──
  {
    id: "enc-01", category: "ENCOURAGEMENT", audioUrl: null,
    agentIds: ["amanda","kizzy","jamarr","india"],
    durationMs: 3200,
    speechLines: [
      { text: "You've got this. We're right behind you.", voice: "marin", pitch: 1.0, rate: 0.95 },
      { text: "I believe in you. Keep pushing.", voice: "coral", pitch: 1.05, rate: 1.0 },
      { text: "Almost there. Do not stop now.", voice: "ash", pitch: 1.0, rate: 1.0 },
      { text: "The finish line is right there. Go.", voice: "coral", pitch: 1.05, rate: 1.05 },
    ],
  },

  // ── SIGN OFF ──
  {
    id: "bye-01", category: "SIGN_OFF", audioUrl: null,
    agentIds: ["amanda","eve","kizzy","cleo"],
    durationMs: 3500,
    speechLines: [
      { text: "Great session today. Rest well.", voice: "marin", pitch: 1.0, rate: 0.9 },
      { text: "Good work everyone. Same time tomorrow.", voice: "shimmer", pitch: 0.95, rate: 0.9 },
      { text: "Take care of yourself. You earned it.", voice: "coral", pitch: 1.0, rate: 0.9 },
      { text: "Minutes are captured. Talk soon.", voice: "sage", pitch: 0.95, rate: 0.9 },
    ],
  },

  // ── SURPRISE ──
  {
    id: "wow-01", category: "SURPRISE", audioUrl: null,
    agentIds: ["nu","jamarr","india","bri"],
    durationMs: 2500,
    speechLines: [
      { text: "Wait — seriously?!", voice: "verse", pitch: 1.2, rate: 1.15 },
      { text: "No way. That's wild.", voice: "ash", pitch: 1.1, rate: 1.1 },
      { text: "I did NOT see that coming.", voice: "coral", pitch: 1.15, rate: 1.1 },
      { text: "Okay, updating my research — that changes things.", voice: "verse", pitch: 1.0, rate: 1.05 },
    ],
  },

  // ── THINKING ──
  {
    id: "think-01", category: "THINKING", audioUrl: null,
    agentIds: ["eve","jessica","terrell","bri"],
    durationMs: 2800,
    speechLines: [
      { text: "Mmm. Let us think on this.", voice: "shimmer", pitch: 0.9, rate: 0.85 },
      { text: "That's a good one. Give us a second.", voice: "sage", pitch: 0.95, rate: 0.9 },
      { text: "Pulling the data on that now.", voice: "echo", pitch: 1.0, rate: 0.95 },
      { text: "Cross-referencing. Interesting angle.", voice: "verse", pitch: 0.95, rate: 0.9 },
    ],
  },
];

/** Detect which GRI category (if any) a transcript phrase triggers */
export function detectGRITrigger(text: string): GRICategory | null {
  const lower = text.toLowerCase().trim();
  for (const [cat, patterns] of Object.entries(TRIGGERS) as [GRICategory, string[]][]) {
    if (patterns.some(p => lower.includes(p))) return cat;
  }
  return null;
}

/** Pick a random clip from category, avoiding last used */
export function selectClip(category: GRICategory, lastClipId?: string): GRIClip {
  const pool = GRI_VAULT.filter(c => c.category === category && c.id !== lastClipId);
  const candidates = pool.length > 0 ? pool : GRI_VAULT.filter(c => c.category === category);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Play a GRI clip via Web Speech API (free fallback) */
export function playClipSpeech(clip: GRIClip, onEnd?: () => void): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  let i = 0;
  const playNext = () => {
    if (i >= clip.speechLines.length) { onEnd?.(); return; }
    const line = clip.speechLines[i++];
    const utt = new SpeechSynthesisUtterance(line.text);
    utt.pitch = line.pitch ?? 1;
    utt.rate = line.rate ?? 1;
    utt.volume = 0.85;
    utt.onend = () => setTimeout(playNext, 220);
    synth.speak(utt);
  };
  playNext();
  return () => synth.cancel();
}
