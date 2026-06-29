/**
 * Clique Intent Detection
 * Determines whether the user's session goal is a BUILD task (produce/create)
 * or a CHAT task (learn/discuss/advise). This drives the entire room layout.
 *
 * BUILD → split layout: preview pane (left) + vertical team panel (right)
 * CHAT  → gallery grid + conversational turn-taking with activity detection
 */

export type SessionIntent = "build" | "chat" | null;

const BUILD_KEYWORDS = [
  "build","create","make","develop","design","write","code","generate",
  "produce","ship","implement","draft","launch","deploy","prototype",
  "build me","make me","create a","write a","design a","code a",
];

const CHAT_KEYWORDS = [
  "what","how","why","explain","tell me","what do you think","advice",
  "opinion","should i","help me understand","question","wondering",
  "thoughts on","feedback","review","analyze","what's","what is",
  "how do","can you","could you","do you think","is it","would you",
];

export function detectIntent(text: string): SessionIntent {
  const t = text.toLowerCase();
  const buildScore = BUILD_KEYWORDS.filter(k => t.includes(k)).length;
  const chatScore  = CHAT_KEYWORDS.filter(k => t.includes(k)).length;
  if (buildScore === 0 && chatScore === 0) return null;
  return buildScore >= chatScore ? "build" : "chat";
}

/**
 * Conversational Activity Detection for Chat Mode.
 * Prevents agents from over-talking. One agent at a time, 3s gap,
 * 30s cooldown per agent, user always has priority.
 */
export interface ChatTurn {
  agentId: string;
  message: string;
  timestamp: number;
}

export class ConversationScheduler {
  private lastSpoke: Record<string, number> = {};
  private lastTurnEnd = 0;
  private readonly COOLDOWN_MS   = 30_000; // 30s per agent
  private readonly TURN_GAP_MS   = 3_000;  // 3s between turns
  private readonly MAX_QUEUE     = 3;       // max agents queued at once

  /** Pick the most relevant agent who isn't on cooldown */
  pickNextAgent(
    agentIds: string[],
    userText: string,
    agentPersonas: Record<string, string>,
  ): string | null {
    const now = Date.now();
    if (now - this.lastTurnEnd < this.TURN_GAP_MS) return null;

    const eligible = agentIds.filter(id => {
      const last = this.lastSpoke[id] ?? 0;
      return now - last > this.COOLDOWN_MS;
    });

    if (eligible.length === 0) return null;

    // Score by keyword overlap between user text and agent persona
    const t = userText.toLowerCase();
    const scored = eligible.map(id => {
      const persona = (agentPersonas[id] ?? "").toLowerCase();
      const words = t.split(/\s+/);
      const score = words.filter(w => w.length > 3 && persona.includes(w)).length;
      return { id, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.id ?? null;
  }

  recordTurn(agentId: string) {
    this.lastSpoke[agentId] = Date.now();
    this.lastTurnEnd = Date.now();
  }

  reset() {
    this.lastSpoke = {};
    this.lastTurnEnd = 0;
  }
}
