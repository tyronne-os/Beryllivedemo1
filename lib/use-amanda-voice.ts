"use client";
/**
 * useAmandaVoice — OpenAI Realtime WebRTC hook for Amanda CSA
 *
 * Connects Amanda to the OpenAI Realtime API via WebRTC.
 * - Ephemeral token from /api/clique/realtime-token
 * - WebRTC peer connection to api.openai.com/v1/realtime
 * - Audio plays through a hidden <audio> element — no Web Speech API
 * - Exposes: speak(text), isConnected, isSpeaking, disconnect
 *
 * Amanda's persona and voice are baked into the session config server-side.
 * The hook triggers the greeting automatically on first connection.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface AmandaVoiceHandle {
  speak: (text: string) => void;
  isConnected: boolean;
  isSpeaking: boolean;
  disconnect: () => void;
}

export function useAmandaVoice(
  onSpeakStart?: () => void,
  onSpeakEnd?: () => void,
  onAmandaTranscript?: (text: string) => void,
  onUserTranscript?: (text: string) => void,
): AmandaVoiceHandle {
  const [isConnected, setConnected] = useState(false);
  const [isSpeaking, setSpeaking]   = useState(false);

  const pcRef       = useRef<RTCPeerConnection | null>(null);
  const dcRef       = useRef<RTCDataChannel | null>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const connectedRef= useRef(false);

  // ── Connect on mount ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        // 1. Get ephemeral token from our server
        const tokenRes = await fetch("/api/clique/realtime-token", { method: "POST" });
        if (!tokenRes.ok) { console.error("[Amanda] token fetch failed", await tokenRes.text()); return; }
        const { token } = await tokenRes.json();
        if (!token || cancelled) return;

        // 2. Create peer connection + audio output element
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
        audioRef.current = audioEl;

        // 3. Receive Amanda's audio stream
        pc.ontrack = (ev) => {
          if (ev.track.kind === "audio") {
            audioEl.srcObject = ev.streams[0];
          }
        };

        // 4. Add local microphone so Amanda can hear the user
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          mic.getTracks().forEach(t => pc.addTrack(t, mic));
        } catch {
          // Microphone denied — Amanda speaks but can't hear user yet
          pc.addTransceiver("audio", { direction: "recvonly" });
        }

        // 5. Data channel for Realtime events
        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;

        let amandaBuf = "";

        dc.onopen = () => {
          if (cancelled) return;
          connectedRef.current = true;
          setConnected(true);

          sendEvent({
            type: "response.create",
            response: {
              output_modalities: ["audio"],
              instructions: `Say exactly: "Hey — I'm Amanda. Tell me what you're building." Nothing more.`,
            },
          });
        };

        dc.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            // GA event names (output_audio) with beta fallbacks (audio)
            if (
              (msg.type === "response.output_audio_transcript.delta" ||
               msg.type === "response.audio_transcript.delta") && msg.delta
            ) {
              amandaBuf += msg.delta;
              setSpeaking(true);
              onSpeakStart?.();
            }
            if (
              msg.type === "response.output_audio.delta" ||
              msg.type === "response.audio.delta"
            ) {
              setSpeaking(true);
              onSpeakStart?.();
            }
            if (msg.type === "response.done") {
              setSpeaking(false);
              onSpeakEnd?.();
              if (amandaBuf.trim()) {
                onAmandaTranscript?.(amandaBuf.trim());
                amandaBuf = "";
              }
            }
            if (
              msg.type === "response.output_audio.done" ||
              msg.type === "response.audio.done"
            ) {
              setSpeaking(false);
              onSpeakEnd?.();
            }
            if (
              msg.type === "conversation.item.input_audio_transcription.completed" &&
              msg.transcript
            ) {
              onUserTranscript?.(msg.transcript);
            }
          } catch { /* malformed event */ }
        };

        dc.onclose = () => {
          setConnected(false);
          setSpeaking(false);
          connectedRef.current = false;
        };

        // 6. SDP offer → OpenAI Realtime (GA API — model is baked into the
        //    ephemeral token's session; beta /v1/realtime?model= is retired)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpRes = await fetch(
          "https://api.openai.com/v1/realtime/calls",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/sdp",
            },
            body: offer.sdp,
          },
        );

        if (!sdpRes.ok) {
          console.error("[Amanda] SDP exchange failed", await sdpRes.text());
          return;
        }

        const answerSdp = await sdpRes.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      } catch (err) {
        console.error("[Amanda] WebRTC connect error:", err);
      }
    }

    connect();
    return () => {
      cancelled = true;
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sendEvent(payload: Record<string, unknown>) {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;
    dc.send(JSON.stringify(payload));
  }

  // ── speak() — push arbitrary text to Amanda ─────────────────────────────
  const speak = useCallback((text: string) => {
    sendEvent({
      type: "response.create",
      response: {
        output_modalities: ["audio"],
        instructions: `Say the following — naturally, as yourself: "${text}"`,
      },
    });
  }, []);

  // ── disconnect ───────────────────────────────────────────────────────────
  function cleanup() {
    dcRef.current?.close();
    pcRef.current?.close();
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }
    setConnected(false);
    setSpeaking(false);
    connectedRef.current = false;
  }

  const disconnect = useCallback(cleanup, []);

  return { speak, isConnected, isSpeaking, disconnect };
}
