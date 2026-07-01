import Nav from "@/components/Nav";
import PinGate from "@/components/PinGate";
import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service — Beryl AI Labs" };

export default function TermsPage() {
  return (
    <PinGate>
      <Nav />
      <main style={{ minHeight: "100vh", background: "#030201", padding: "80px 60px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "rgba(200,169,81,.5)", textTransform: "uppercase", marginBottom: 16 }}>Beryl AI Labs</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative','Cinzel',serif", fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Terms of Service</h1>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,.3)", fontStyle: "italic", marginBottom: 48 }}>Effective: January 1, 2026 · Last updated: June 2026</div>

        {[
          ["Acceptance", "By accessing or using Beryl services (berylize.com and all sub-pages, APIs, and agent interfaces), you agree to these Terms. If you do not agree, do not use the service."],
          ["Use of Service", "Beryl is provided for lawful purposes only. You may not use Beryl to generate harmful, deceptive, or illegal content. Automated scraping, reverse engineering, or API abuse is prohibited."],
          ["Agent Interactions", "Beryl's AI agents (the Clique) are software. They are not licensed professionals. Nothing they say constitutes legal, financial, medical, or professional advice. Use your own judgment."],
          ["Intellectual Property", "All Beryl branding, agent personas, QCR system design, GRI architecture, and generated content are the property of Beryl AI Labs unless otherwise stated. You retain ownership of content you create using Beryl's tools."],
          ["Availability", "We aim for 99.9% uptime but make no guarantees. The service may be paused, modified, or discontinued at any time. We are not liable for losses arising from downtime."],
          ["Limitation of Liability", "Beryl AI Labs' total liability for any claim shall not exceed the amount you paid us in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages."],
          ["Termination", "We may suspend or terminate your access at any time for violations of these Terms or for any other reason at our discretion. You may stop using the service at any time."],
          ["Governing Law", "These Terms are governed by the laws of the State of California, USA. Disputes shall be resolved in the courts of Los Angeles County, CA."],
          ["Contact", "Legal questions: hello@berylize.com · Beryl AI Labs · berylize.com"],
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
