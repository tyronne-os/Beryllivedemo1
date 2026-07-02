import { NextResponse } from "next/server";
import { getAgentPrompt, resolveResponders, CLIQUE_V1_IDS } from "@/lib/clique-agent-prompts";

export interface ChatMessage {
  role: "user" | "agent" | "system";
  agentId?: string;
  agentName?: string;
  text: string;
  ts: number;
}

interface RequestBody {
  message: string;
  targetId: "group" | string;
  history: ChatMessage[];
}

async function callAgent(agentId: string, history: ChatMessage[], userMessage: string): Promise<string> {
  const prompt = getAgentPrompt(agentId);
  if (!prompt) return "";

  const messages: { role: string; content: string }[] = [
    { role: "system", content: prompt.system },
    ...history.slice(-12).map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.agentId && m.agentId !== agentId
        ? `[${m.agentName}]: ${m.text}`
        : m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BERYL_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.75,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    console.error(`[CliqueChat] ${agentId} call failed:`, await res.text());
    return "";
  }
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? "";
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { message, targetId, history } = body;

    const agentsToRespond: string[] =
      targetId === "group"
        ? resolveResponders(message)
        : [targetId];

    // For group, Amanda always anchors first unless user specifically named others
    const ordered =
      agentsToRespond.includes("amanda")
        ? ["amanda", ...agentsToRespond.filter(id => id !== "amanda")]
        : agentsToRespond;

    const responses: { agentId: string; agentName: string; text: string }[] = [];

    for (const id of ordered) {
      const p = getAgentPrompt(id);
      if (!p) continue;

      // Build context including prior responses from this call so agents can react to each other
      const priorThisRound: ChatMessage[] = responses.map(r => ({
        role: "agent",
        agentId: r.agentId,
        agentName: r.agentName,
        text: r.text,
        ts: Date.now(),
      }));

      const text = await callAgent(id, [...history, ...priorThisRound], message);
      if (text) responses.push({ agentId: id, agentName: p.name, text });
    }

    return NextResponse.json({ responses });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
