import Nav from "@/components/Nav";
import PinGate from "@/components/PinGate";
import Footer from "@/components/Footer";

export const metadata = { title: "API — Beryl AI Labs" };

export default function ApiDocsPage() {
  return (
    <PinGate>
      <Nav />
      <main style={{ minHeight: "100vh", background: "#030201", padding: "80px 60px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 16 }}>Beryl Operating System</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8 }}>API Reference</h1>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,.3)", fontStyle: "italic", marginBottom: 12 }}>Internal · v1 · June 2026</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(200,169,81,.6)", fontStyle: "italic", marginBottom: 48 }}>
          Beryl API is currently invite-only. Partner access available — email hello@berylize.com.
        </div>

        {[
          {
            route: "POST /api/clique/realtime-token",
            desc: "Mints an ephemeral OpenAI Realtime API token for a Clique session. Amanda's system prompt is baked server-side.",
            response: `{ token: string, expires_at: number }`,
          },
          {
            route: "POST /api/clique/chat",
            desc: "Sends a message to one or more Clique agents. Resolves responders via resolveResponders(). Returns ordered agent responses — each agent sees prior responses from the same round.",
            response: `{ responses: [{ agentId, agentName, text }] }`,
          },
          {
            route: "POST /api/clique/livekit-token",
            desc: "Mints a LiveKit room token for the shared Clique meeting room. All agents join from session start so their Realtime sessions are warm.",
            response: `{ token: string }`,
          },
          {
            route: "POST /api/matinee/omega",
            desc: "OMEGA cinematography director agent. Enhances a raw scene prompt into a full cinematic brief. Powered by GPT-4o via native fetch.",
            response: `{ enhanced: string, genre: string, palette: string }`,
          },
          {
            route: "POST /api/matinee/generate",
            desc: "Generates a video scene via Runway Gen-3. Passes the OMEGA-enhanced prompt. Returns a polling token.",
            response: `{ taskId: string }`,
          },
          {
            route: "POST /api/matinee/stitch",
            desc: "Film assembly editor agent. Takes an ordered list of generated scene clips and produces a stitch plan with transitions.",
            response: `{ plan: object }`,
          },
          {
            route: "POST /api/hf/speak",
            desc: "The Gym pipeline: Grok-3 Mini generates a reply, eve-tts generates audio + word boundary visemes. Used by the Eve avatar.",
            response: `{ reply: string, audioUrl: string, visemes: [{word, offsetMs, durationMs}] }`,
          },
        ].map(e => (
          <div key={e.route} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid rgba(200,169,81,.1)" }}>
            <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 13, color: "#f5e070", background: "rgba(200,169,81,.08)", padding: "6px 14px", borderRadius: 4, display: "inline-block", marginBottom: 10 }}>{e.route}</div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(255,255,255,.6)", lineHeight: 1.7, margin: "0 0 10px" }}>{e.desc}</p>
            <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 11, color: "#8b949e", background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 6, padding: "10px 16px" }}>
              {e.response}
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </PinGate>
  );
}
