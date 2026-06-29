/**
 * CLS — Clique Listening State
 *
 * Every agent in the room is ALWAYS animated. Never a frozen 2D image.
 * CLS is the loop state: a pre-rendered short video that plays indefinitely
 * while the agent is listening. It switches to a Runway live stream the instant
 * the agent is called or goes live.
 *
 * Videos live in the Beryl data lake:
 *   AIBRUH/beryl-clique-lake → avatars/{agentId}/cls_{variant}.mp4
 *
 * Variants make every entrance different and authentic:
 *   wave     — greeting wave (used on first entry)
 *   idle_a   — subtle breathing, slight head movement
 *   idle_b   — looking slightly off-camera, natural blink
 *   idle_c   — leaning slightly forward, attentive
 *   nod      — gentle nod, confirming/listening
 *   smile    — warm smile hold
 *   glance   — glances to side then back (natural)
 *   focus    — looking directly at camera, engaged
 */

export type CLSVariant = "wave" | "idle_a" | "idle_b" | "idle_c" | "nod" | "smile" | "glance" | "focus";

const HF_LAKE =
  "https://huggingface.co/datasets/AIBRUH/beryl-clique-lake/resolve/main";

const INTRO_VARIANTS: CLSVariant[]   = ["wave"];
const LISTEN_VARIANTS: CLSVariant[]  = ["idle_a","idle_b","idle_c","glance","focus"];
const CONFIRM_VARIANTS: CLSVariant[] = ["nod","smile"];

/** URL for a specific CLS variant in the lake */
export function clsUrl(agentId: string, variant: CLSVariant): string {
  return `${HF_LAKE}/avatars/${agentId}/cls_${variant}.mp4`;
}

/** Pick a random listening variant (ensures each entrance feels different) */
export function randomListenVariant(): CLSVariant {
  return LISTEN_VARIANTS[Math.floor(Math.random() * LISTEN_VARIANTS.length)];
}

/** Intro variant for the CSA greeting */
export function introVariant(): CLSVariant {
  return "wave";
}

/** Confirm variant (used when Amanda confirms the user's request) */
export function confirmVariant(): CLSVariant {
  return CONFIRM_VARIANTS[Math.floor(Math.random() * CONFIRM_VARIANTS.length)];
}

/** All variants for a given agent — use to prefetch or build a playlist */
export function allCLSUrls(agentId: string): string[] {
  const all: CLSVariant[] = ["wave","idle_a","idle_b","idle_c","nod","smile","glance","focus"];
  return all.map(v => clsUrl(agentId, v));
}
