"use client";
import { useEffect, useRef, useCallback } from "react";
import { detectGRITrigger, selectClip, playClipSpeech, GRIClip, GRICategory } from "@/lib/gri";

interface Props {
  /** Live transcript text — feed each new utterance here */
  transcript: string;
  onTrigger: (clip: GRIClip, category: GRICategory) => void;
}

const COOLDOWN_MS = 30_000;

export default function GroupListener({ transcript, onTrigger }: Props) {
  const lastFiredMs  = useRef<number>(0);
  const lastClipId   = useRef<string | undefined>(undefined);
  const prevText     = useRef<string>("");

  useEffect(() => {
    // Only check new text added since last render
    const newText = transcript.slice(prevText.current.length).trim();
    prevText.current = transcript;
    if (!newText) return;

    const now = Date.now();
    if (now - lastFiredMs.current < COOLDOWN_MS) return;

    const category = detectGRITrigger(newText);
    if (!category) return;

    const clip = selectClip(category, lastClipId.current);
    lastClipId.current = clip.id;
    lastFiredMs.current = now;
    onTrigger(clip, category);
  }, [transcript, onTrigger]);

  return null; // pure logic component
}
