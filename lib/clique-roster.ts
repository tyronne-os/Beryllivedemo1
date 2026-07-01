export type AgentState = "listening" | "live" | "offline" | "available";

export interface CliqueAgent {
  id: string;
  name: string;
  role: string;
  isCSA?: boolean;
  voice: string;
  gstackRole: string;
  persona: string;
  portrait: string;
  color: string;
  status: AgentState;
}

export const CLIQUE_ROSTER: CliqueAgent[] = [
  { id:"amanda",  name:"Amanda",  role:"Clique Supervisor", isCSA:true, voice:"marin",   gstackRole:"cso",              persona:"Warm, authoritative supervisor. Decomposes goals, assembles the clique, hands back to the user.", portrait:"/characters/AMANDA_SHIELD.png",  color:"#c8a951", status:"available" },
  { id:"eve",     name:"Eve",     role:"AI Architect",               voice:"shimmer", gstackRole:"plan-eng-review",  persona:"Calm systems thinker. Locks architecture before anyone builds.",                                  portrait:"/characters/EVE_SHIELD.png",     color:"#1a5f7a", status:"available" },
  { id:"jamarr",  name:"Jamarr",  role:"Creator",                    voice:"ash",     gstackRole:"design-html",      persona:"High-energy maker. Turns intent into shipped artifacts fast.",                                   portrait:"/characters/JAMARR_SHIELD.png",  color:"#4CAF50", status:"available" },
  { id:"jessica", name:"Jessica", role:"Strategy",                   voice:"sage",    gstackRole:"plan-ceo-review",  persona:"Crisp strategist. Frames the why and the bet.",                                                 portrait:"/characters/JESSICA_SHIELD.png", color:"#4CAF50", status:"available" },
  { id:"jeff",    name:"Jeff",    role:"Operations",                  voice:"cedar",   gstackRole:"ship",             persona:"Steady operator. Owns sequencing, delivery, and release.",                                      portrait:"/characters/JEFF_SHIELD.png",    color:"#4CAF50", status:"available" },
  { id:"nu",      name:"Nu",      role:"Innovation",                  voice:"verse",   gstackRole:"autoplan",         persona:"Lateral thinker. Surfaces the non-obvious option.",                                             portrait:"/characters/NU_SHIELD.png",      color:"#4CAF50", status:"available" },
  { id:"india",   name:"India",   role:"Growth",                      voice:"coral",   gstackRole:"landing-report",   persona:"Growth-minded. Distribution, funnels, and reach.",                                              portrait:"/characters/INDIA_SHIELD.png",   color:"#4CAF50", status:"available" },
  { id:"lacara",  name:"Lacara",  role:"Design",                      voice:"ballad",  gstackRole:"design-review",    persona:"Designer's eye. Catches AI slop, spacing, hierarchy.",                                          portrait:"/characters/LACARA_SHIELD.png",  color:"#4CAF50", status:"available" },
  { id:"terrell", name:"Terrell", role:"Analytics",                   voice:"echo",    gstackRole:"investigate",      persona:"Data-led. Reads the numbers and tells the truth.",                                              portrait:"/characters/TERRELL_SHIELD.png", color:"#4CAF50", status:"available" },
  { id:"brice",   name:"Brice",   role:"Development",                 voice:"alloy",   gstackRole:"review",           persona:"Engineer. Implements and reviews for production bugs.",                                         portrait:"/characters/BRICE_SHIELD.png",   color:"#4CAF50", status:"available" },
  { id:"kizzy",   name:"Kizzy",   role:"Engagement",                  voice:"coral",   gstackRole:"office-hours",     persona:"Relationship builder. Keeps the room and the user warm.",                                       portrait:"/characters/KIZZY_SHIELD.png",   color:"#9c27b0", status:"available" },
  { id:"maria",   name:"Maria",   role:"Relations",                   voice:"sage",    gstackRole:"retro",            persona:"Diplomat. Partnerships, comms, and follow-through.",                                            portrait:"/characters/MARIA_SHIELD.png",   color:"#4CAF50", status:"available" },
  { id:"shelly",  name:"Shelly",  role:"Community",                   voice:"shimmer", gstackRole:"learn",            persona:"Community voice. Listens to users and feeds insight back.",                                     portrait:"/characters/SHELLY_SHIELD.png",  color:"#4CAF50", status:"available" },
  { id:"bri",     name:"Bri",     role:"Research",                    voice:"verse",   gstackRole:"grill-with-docs",  persona:"Sharp researcher. Grills every idea with sources before building.",                             portrait:"/characters/BRI_SHIELD.png",     color:"#4CAF50", status:"available" },
  { id:"naomi",   name:"Naomi",   role:"Product",                     voice:"ballad",  gstackRole:"plan-design-review", persona:"Executive product lead. Turns the thread into a PRD and grabbable issues.",                  portrait:"/characters/NAOMI_SHIELD.png",   color:"#4CAF50", status:"available" },
  { id:"cleo",    name:"Cleo",    role:"Minutes & Meetings",          voice:"sage",    gstackRole:"retro",            persona:"Historian of the clique. Captures every decision, action item, and insight with surgical precision. Nothing is missed. Nothing is padded.", portrait:"/characters/CLEO_SHIELD.png",    color:"#c8a951", status:"available" },
  { id:"zara",   name:"Zara",   role:"Brand Strategy",              voice:"coral",   gstackRole:"landing-report",   persona:"Brand architect. Controls the narrative — voice, presence, and cultural resonance. Nothing ships without her eye on it.",                  portrait:"/characters/ZARA_SHIELD.png",   color:"#c8a951", status:"available" },
  { id:"simone", name:"Simone", role:"UX Research",                 voice:"sage",    gstackRole:"grill-with-docs",  persona:"User advocate. Translates real behavior into design truth. Challenges assumptions with receipts.",                                       portrait:"/characters/SIMONE_SHIELD.png", color:"#4CAF50", status:"available" },
  { id:"tj",     name:"TJ",     role:"Founder",                     voice:"onyx",    gstackRole:"plan-eng-review",  persona:"The architect of the whole operation. Vision, conviction, and the last word.",                                                             portrait:"/characters/TJ_SHIELD.png",     color:"#c8a951", status:"available" },
  { id:"finn",   name:"Finn",   role:"Machine Learning",            voice:"ash",     gstackRole:"autoplan",         persona:"Model whisperer. Finds the training shortcut nobody else saw. Moves fast and ships working prototypes.",                                  portrait:"/characters/FINN_SHIELD.png",   color:"#4CAF50", status:"available" },
  { id:"dev",    name:"Dev",    role:"Security",                    voice:"echo",    gstackRole:"review",           persona:"Threat modeler. Finds the hole before the adversary does. The one person in the room nobody argues with.",                               portrait:"/characters/DEV_SHIELD.png",    color:"#dc3c3c", status:"available" },
];

// Default 9-member team → >6 → grid layout, user featured top
export const DEFAULT_TEAM_IDS = ["eve","lacara","terrell","jeff","india","jamarr","bri","naomi","cleo","amanda"];

export function getDefaultTeam(): CliqueAgent[] {
  return DEFAULT_TEAM_IDS
    .map(id => CLIQUE_ROSTER.find(a => a.id === id))
    .filter((a): a is CliqueAgent => Boolean(a));
}

export function getRosterById(id: string): CliqueAgent | undefined {
  return CLIQUE_ROSTER.find(a => a.id === id);
}

// ── Reduced v1 Clique: 4-member live team ────────────────────────────────────
// Amanda (supervisor, MS Agent Framework) + 3 adaptable generalists.
// Master system prompts live in lib/clique-agent-prompts.ts.
export const CLIQUE_V1_TEAM_IDS = ["amanda", "eve", "brice", "india"];

export function getV1Team(): CliqueAgent[] {
  return CLIQUE_V1_TEAM_IDS
    .map(id => CLIQUE_ROSTER.find(a => a.id === id))
    .filter((a): a is CliqueAgent => Boolean(a));
}
