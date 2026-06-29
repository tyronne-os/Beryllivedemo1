"use client";
/**
 * CLS Loop Router
 *
 * The brain of the Clique Listening State system.
 * Manages state transitions between CLS video variants and drives
 * the crossfade logic so every agent stays visually alive.
 *
 * State machine:
 *   "wave"    → intro greeting (auto-transitions to "listen" after 4s)
 *   "listen"  → idle loop bank — rotates every 12–18s for natural variety
 *   "confirm" → nod/smile loop (auto-transitions back to "listen" after 3s)
 *   "live"    → Runway live character stream (managed by parent)
 *
 * Usage:
 *   const { aVariant, bVariant, showB, swap } = useCLSLoopRouter(agentId, clsState);
 *   <video src={clsUrl(agentId, aVariant)} style={{ opacity: showB ? 0 : 1 }} />
 *   <video src={clsUrl(agentId, bVariant)} style={{ opacity: showB ? 1 : 0 }} />
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { CLSVariant, randomListenVariant, confirmVariant } from "./clique-cls";

export type CLSRouterState = "wave" | "listen" | "confirm" | "live";

export interface CLSLoopRouterResult {
  /** Currently displayed variant */
  currentVariant: CLSVariant;
  /** Next variant (preloaded) */
  nextVariant: CLSVariant;
  /** When true, nextVariant is the front layer (crossfade in progress) */
  transitioning: boolean;
  /** Force an immediate state change */
  forceTransition: (to: CLSVariant) => void;
}

const LISTEN_ROTATE_MS_MIN = 12_000;
const LISTEN_ROTATE_MS_MAX = 18_000;

function randomListenMs(): number {
  return LISTEN_ROTATE_MS_MIN + Math.random() * (LISTEN_ROTATE_MS_MAX - LISTEN_ROTATE_MS_MIN);
}

function pickNextListen(current: CLSVariant): CLSVariant {
  // Never repeat the same variant back-to-back
  let next = randomListenVariant();
  let tries = 0;
  while (next === current && tries < 10) { next = randomListenVariant(); tries++; }
  return next;
}

function variantForState(state: CLSRouterState, current: CLSVariant): CLSVariant {
  switch (state) {
    case "wave":    return "wave";
    case "listen":  return pickNextListen(current);
    case "confirm": return confirmVariant();
    case "live":    return current; // caller manages live stream
  }
}

export function useCLSLoopRouter(
  agentId: string,
  state: CLSRouterState,
  onStateComplete?: (completedState: CLSRouterState) => void,
): CLSLoopRouterResult {
  // A/B crossfade buffers
  const [currentVariant, setCurrentVariant] = useState<CLSVariant>(() => variantForState(state, "idle_a"));
  const [nextVariant,    setNextVariant]     = useState<CLSVariant>(() => randomListenVariant());
  const [transitioning,  setTransitioning]   = useState(false);

  const stateRef      = useRef(state);
  const currentRef    = useRef(currentVariant);
  const rotateTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { currentRef.current = currentVariant; }, [currentVariant]);

  const crossfadeTo = useCallback((variant: CLSVariant) => {
    if (variant === currentRef.current) return;
    setNextVariant(variant);
    setTransitioning(true);
    if (transTimer.current) clearTimeout(transTimer.current);
    // After crossfade completes (600ms), promote next → current
    transTimer.current = setTimeout(() => {
      setCurrentVariant(variant);
      setTransitioning(false);
    }, 600);
  }, []);

  const forceTransition = useCallback((to: CLSVariant) => {
    crossfadeTo(to);
  }, [crossfadeTo]);

  // React to state changes
  useEffect(() => {
    if (rotateTimer.current) clearTimeout(rotateTimer.current);

    if (state === "live") return; // parent owns the live layer

    const target = variantForState(state, currentRef.current);
    crossfadeTo(target);

    if (state === "wave") {
      // Wave plays once then transitions to listen
      rotateTimer.current = setTimeout(() => {
        onStateComplete?.("wave");
        const listenVar = randomListenVariant();
        crossfadeTo(listenVar);
      }, 4_200);
    } else if (state === "listen") {
      // Rotate through listen variants on a natural schedule
      const scheduleRotate = () => {
        rotateTimer.current = setTimeout(() => {
          if (stateRef.current !== "listen") return;
          crossfadeTo(pickNextListen(currentRef.current));
          scheduleRotate(); // schedule next rotation
        }, randomListenMs());
      };
      scheduleRotate();
    } else if (state === "confirm") {
      // Confirm plays for ~3s then signals complete
      rotateTimer.current = setTimeout(() => {
        onStateComplete?.("confirm");
      }, 3_200);
    }

    return () => {
      if (rotateTimer.current) clearTimeout(rotateTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { currentVariant, nextVariant, transitioning, forceTransition };
}
