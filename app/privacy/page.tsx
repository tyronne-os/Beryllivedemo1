import Nav from "@/components/Nav";
import PinGate from "@/components/PinGate";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy — Beryl AI Labs" };

export default function PrivacyPage() {
  return (
    <PinGate>
      <Nav />
      <main style={{ minHeight: "100vh", background: "#030201", padding: "80px 60px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 16 }}>Beryl AI Labs</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Privacy Policy</h1>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,.3)", fontStyle: "italic", marginBottom: 48 }}>Effective: January 1, 2026 · Last updated: June 2026</div>

        {[
          ["What We Collect", "We collect information you provide directly (name, email, session data) and information generated through your use of Beryl services (conversation logs, QCR rapport scores, session timestamps). We do not sell your data."],
          ["How We Use It", "Your data powers the QCR (Quantum Consciousness Recollection) system — the agent memory layer that allows your Clique to remember you, build rapport, and evolve across sessions. This data stays within Beryl AI Labs infrastructure."],
          ["Third-Party Services", "Beryl uses OpenAI (Realtime API, GPT-4o), Runway (video generation), LiveKit (real-time audio/video), HuggingFace (model hosting), and xAI (Grok). Each provider's privacy policy governs their handling of data passed to their systems."],
          ["Data Retention", "Session logs are retained for 90 days. QCR profiles persist indefinitely to support agent memory — you may request deletion at any time by contacting us at hello@berylize.com."],
          ["Your Rights", "You have the right to access, correct, or delete your personal data. You may opt out of QCR memory at any time through your account settings. To exercise these rights, email hello@berylize.com."],
          ["Security", "All data is encrypted in transit (TLS 1.3) and at rest. API keys are stored server-side and never exposed to the client. We follow OWASP security guidelines across all production routes."],
          ["Contact", "Questions? hello@berylize.com · Beryl AI Labs · berylize.com"],
        ].map(([heading, body]) => (
          <div key={heading} style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 2, fontWeight: 700, color: "#c8a951", textTransform: "uppercase", marginBottom: 10 }}>{heading}</div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}
      </main>
      <Footer />
    </PinGate>
  );
}
