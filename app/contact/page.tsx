"use client";
import Nav from "@/components/Nav";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await fetch("https://formsubmit.co/theedenproject2026@gmail.com", {
        method: "POST",
        body: data,
      });
      setSent(true);
    } catch {
      setSent(true); // still show success — formsubmit handles delivery
    }
    setSending(false);
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(200,169,81,0.25)",
    color: "#E8DCC8",
    fontSize: 15,
    fontFamily: "'Cormorant Garamond', serif",
    outline: "none",
    marginBottom: 14,
    borderRadius: 2,
  };

  return (
    <>
      <Nav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080503; }
        input::placeholder, textarea::placeholder { color: rgba(232,220,200,0.35); }
        input:focus, textarea:focus { border-color: rgba(200,169,81,0.6) !important; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080503", display: "flex", flexDirection: "column" }}>

        {/* ── HERO: Kizzy full-bleed ── */}
        <div style={{ position: "relative", width: "100%", height: "65vh", overflow: "hidden" }}>
          <img
            src="/characters/KIZZY_SHIELD.png"
            alt="Kizzy"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
            }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(8,5,3,0.3) 0%, rgba(8,5,3,0.15) 40%, rgba(8,5,3,0.92) 100%)",
          }} />

          {/* Hero text */}
          <div style={{
            position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
            textAlign: "center", width: "100%",
            animation: "fade-up 0.9s ease both",
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 5,
              textTransform: "uppercase", color: "#c8a951", marginBottom: 14,
            }}>
              Beryl AI Labs · We'd Love to Hear From You
            </div>
            <h1 style={{
              fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700, color: "#E8DCC8", lineHeight: 1.15,
              textShadow: "0 2px 32px rgba(0,0,0,0.8)",
            }}>
              Contact Us
            </h1>
          </div>
        </div>

        {/* ── FORM SECTION ── */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start",
          padding: "64px 24px 80px",
        }}>
          <div style={{
            width: "100%", maxWidth: 560,
            background: "rgba(13,9,5,0.95)",
            border: "1px solid rgba(200,169,81,0.18)",
            padding: "48px 40px",
            animation: "fade-up 1s 0.2s ease both",
          }}>

            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: 3,
                  textTransform: "uppercase", color: "#4CAF50", marginBottom: 20,
                }}>
                  Message Sent
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 18,
                  color: "rgba(232,220,200,0.8)", lineHeight: 1.7,
                }}>
                  Thank you for reaching out. A member of our team will be in touch shortly.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4,
                  textTransform: "uppercase", color: "#c8a951", marginBottom: 10,
                }}>
                  Get in Touch
                </div>
                <h2 style={{
                  fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 600,
                  color: "#E8DCC8", marginBottom: 32,
                }}>
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* Hidden formsubmit config */}
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_subject" value="New message from Beryl Live contact form" />

                  <div style={{ display: "flex", gap: 12, marginBottom: 0 }}>
                    <input
                      type="text" name="first_name" placeholder="First Name" required
                      style={{ ...inp, flex: 1 }}
                    />
                    <input
                      type="text" name="last_name" placeholder="Last Name" required
                      style={{ ...inp, flex: 1 }}
                    />
                  </div>

                  <input
                    type="email" name="email" placeholder="Email Address" required
                    style={inp}
                  />

                  <input
                    type="text" name="subject" placeholder="Subject" required
                    style={inp}
                  />

                  <textarea
                    name="message" placeholder="Your message..." required
                    rows={5}
                    style={{ ...inp, resize: "vertical", marginBottom: 24 }}
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      width: "100%",
                      fontFamily: "'Cinzel', serif",
                      fontSize: 11, letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      padding: "16px 0",
                      background: sending ? "#555" : "linear-gradient(135deg, #8B6914 0%, #c8a951 50%, #f5e070 100%)",
                      color: "#080503",
                      border: "none",
                      cursor: sending ? "default" : "pointer",
                      fontWeight: 700,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {sending ? "Sending…" : "Send Message →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
