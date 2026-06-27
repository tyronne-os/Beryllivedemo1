"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes logo-sweep {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes logo-glow {
          0%,100% { filter: drop-shadow(0 0 8px rgba(200,169,81,0.45)); }
          50%      { filter: drop-shadow(0 0 18px rgba(200,169,81,0.85)); }
        }
        @keyframes btn-flash {
          0%   { background-position: 150% center; }
          100% { background-position: -50% center; }
        }

        /* ── Nav link — gold at rest, blue on hover, NEVER disappears ── */
        .nl {
          position: relative;
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          text-decoration: none;
          padding: 4px 2px 6px;
          /* Gold gradient clipped to text */
          background: linear-gradient(135deg, #8B6914 0%, #c8a951 22%, #f5e070 48%, #c8a951 74%, #8B6914 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: background 0.22s ease;
        }
        .nl::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: transparent;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .nl:hover {
          background: linear-gradient(135deg, #1a5f7a 0%, #4a9ab5 28%, #9de4f8 50%, #4a9ab5 72%, #1a5f7a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nl:hover::after {
          background: linear-gradient(90deg, transparent, #7ecde8 50%, transparent);
          box-shadow: 0 0 8px #4a9ab5;
        }

        /* ── CTA button ── */
        .cta-btn {
          display: inline-block;
          padding: 11px 28px;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          text-decoration: none;
          color: #0a0604;
          background: linear-gradient(110deg, #8B6914 0%, #c8a951 25%, #fff8c0 45%, #f5e070 55%, #c8a951 75%, #8B6914 100%);
          background-size: 200% auto;
          border: 1px solid rgba(245,224,112,0.35);
          box-shadow: 0 0 8px rgba(200,169,81,0.2);
          transition: box-shadow 0.25s;
          white-space: nowrap;
          cursor: pointer;
        }
        .cta-btn:hover {
          animation: btn-flash 0.5s ease-out both;
          box-shadow: 0 0 22px rgba(200,169,81,0.55), 0 0 44px rgba(200,169,81,0.2);
        }

        /* ── LLM pill ── */
        .llm-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid rgba(200,169,81,0.28);
          background: rgba(200,169,81,0.04);
          text-decoration: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .llm-pill:hover {
          border-color: rgba(200,169,81,0.75);
          background: rgba(200,169,81,0.11);
          box-shadow: 0 0 16px rgba(200,169,81,0.18);
        }
        .llm-pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c8a951;
          box-shadow: 0 0 6px #c8a951;
          flex-shrink: 0;
          display: inline-block;
          transition: box-shadow 0.25s;
        }
        .llm-pill:hover .llm-pill-dot {
          box-shadow: 0 0 14px #f5e070, 0 0 28px #c8a951;
        }
        .llm-pill-text {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #8B6914 0%, #c8a951 25%, #f5e070 50%, #c8a951 75%, #8B6914 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── LOGO ── */
        .logo-beryl {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 3px;
          background: linear-gradient(110deg,
            #6b4f0a 0%, #c8a951 15%, #fff8c0 30%,
            #f5e070 40%, #fff8c0 50%, #c8a951 65%, #6b4f0a 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logo-sweep 4s linear infinite, logo-glow 3s ease-in-out infinite;
        }
        .logo-live {
          font-family: 'Cinzel', serif;
          font-size: 21px;
          font-weight: 400;
          letter-spacing: 9px;
          background: linear-gradient(135deg, #3a8fa8 0%, #6bc8e0 40%, #1a5f7a 70%, #3a8fa8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-left: 8px;
        }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        height: 80,
        /* ── TRUE VELVET: deep warm black base ── */
        backgroundColor: "#0d0905",
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='80' viewBox='0 0 64 80'%3E%3Cg fill='none'%3E%3Cpath d='M32 6 C30 10 26 13 26 18 C26 23 29 25 32 25 C35 25 38 23 38 18 C38 13 34 10 32 6Z M28 14 C26 16 24 18 24 22 C24 26 27 28 29 29 C27 30 24 33 24 38 L40 38 C40 33 37 30 35 29 C37 28 40 26 40 22 C40 18 38 16 36 14 M29 38 L27 46 L37 46 L35 38Z M27 46 L26 52 L38 52 L37 46Z' stroke='rgba(180,145,50,0.18)' stroke-width='0.8' fill='rgba(160,125,35,0.07)'/%3E%3C/g%3E%3C/svg%3E"),
          linear-gradient(160deg, rgba(40,22,5,0.7) 0%, rgba(8,5,2,0.95) 50%, rgba(30,16,4,0.7) 100%)
        `,
        borderBottom: "1px solid rgba(200,169,81,0.22)",
        boxShadow: "0 1px 0 rgba(200,169,81,0.08) inset, 0 6px 50px rgba(0,0,0,0.85)",
      }}>

        {/* LOGO */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span className="logo-beryl">BERYL</span>
          <span className="logo-live">LIVE</span>
        </Link>

        {/* NAV LINKS */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {pathname !== "/" && <Link href="/" className="nl">Home</Link>}
          <a href="/#squad" className="nl">The Squad</a>
          <Link href="/demo" className="nl">Demo</Link>
          <a href="/#pricing" className="nl">Pricing</a>
          <Link href="/desktop" className="nl">Desktop</Link>
          <Link href="/contact" className="nl">Contact</Link>
          <Link href="/beryl-llm" className="llm-pill">
            <span className="llm-pill-dot" />
            <span className="llm-pill-text">Beryl LLM</span>
          </Link>
        </div>

        {/* CTA */}
        <Link href="/demo" className="cta-btn">Live Session ›</Link>

      </nav>
    </>
  );
}
