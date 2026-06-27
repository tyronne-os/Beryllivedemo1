"use client";
import { useEffect } from "react";

/**
 * VideoPerformance — mounts once in the root layout.
 *
 * What it does:
 * 1. visibilitychange → pauses every <video> on the page when tab goes background,
 *    resumes only those inside the viewport when tab returns.
 * 2. IntersectionObserver → watches every <video> added to the DOM at any time
 *    (MutationObserver + initial scan). Plays when ≥15% visible, pauses otherwise.
 * 3. CSS animation budget → injects a <style> that sets animation-play-state:paused
 *    on the <html> element when the tab is hidden, stopping ALL CSS animations
 *    (squad scroll, orb spin, gold shimmer, etc.) with zero JS per-frame cost.
 *    Removes the rule when the tab returns.
 * 4. Reduced-motion respect → if the user has prefers-reduced-motion enabled,
 *    all CSS animations are permanently paused.
 */
export default function VideoPerformance() {
  useEffect(() => {
    // ── 1. Inject animation-pause stylesheet ──────────────────────────────────
    const styleEl = document.createElement("style");
    styleEl.id = "__beryl_perf__";
    styleEl.textContent = `
      html.tab-hidden * { animation-play-state: paused !important; }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
      }
    `;
    document.head.appendChild(styleEl);

    // ── 2. Per-video IntersectionObserver ─────────────────────────────────────
    const observed = new Set<HTMLVideoElement>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            // Ensure GPU layer is set before playing
            if (!v.style.transform) v.style.transform = "translateZ(0)";
            if (!v.style.willChange) v.style.willChange = "transform";
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px 100px 0px" }
    );

    const observeVideo = (v: HTMLVideoElement) => {
      if (observed.has(v)) return;
      observed.add(v);
      // Force GPU layer on every video we touch
      v.style.transform = "translateZ(0)";
      v.style.willChange = "transform";
      v.style.backfaceVisibility = "hidden";
      io.observe(v);
    };

    // Observe all existing videos
    document.querySelectorAll<HTMLVideoElement>("video").forEach(observeVideo);

    // Watch for videos added dynamically (e.g. lazy-loaded sections)
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLVideoElement) observeVideo(node);
          if (node instanceof Element) {
            node.querySelectorAll<HTMLVideoElement>("video").forEach(observeVideo);
          }
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // ── 3. Tab visibility → pause ALL / resume visible ────────────────────────
    const onVisibility = () => {
      if (document.hidden) {
        document.documentElement.classList.add("tab-hidden");
        observed.forEach((v) => v.pause());
      } else {
        document.documentElement.classList.remove("tab-hidden");
        observed.forEach((v) => {
          const r = v.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            v.play().catch(() => {});
          }
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── 4. iOS first-gesture unlock ───────────────────────────────────────────
    const onGesture = () => {
      observed.forEach((v) => {
        const r = v.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) v.play().catch(() => {});
      });
    };
    document.addEventListener("touchstart", onGesture, { once: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchstart", onGesture);
      styleEl.remove();
    };
  }, []);

  return null;
}
