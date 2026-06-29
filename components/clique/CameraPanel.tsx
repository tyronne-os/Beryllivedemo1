"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onStream: (stream: MediaStream | null) => void;
  active: boolean;
}

export default function CameraPanel({ onStream, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    onStream(null);
  }, [onStream]);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      onStream(stream);

      // Enumerate devices after permission granted
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cams = allDevices.filter(d => d.kind === "videoinput");
      setDevices(cams);
      if (!deviceId && cams.length) setSelectedDeviceId(cams[0].deviceId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Permission") || msg.includes("NotAllowed")
        ? "Camera access denied. Please allow camera in your browser settings."
        : "Could not start camera: " + msg);
    }
  }, [onStream, stopStream]);

  useEffect(() => {
    if (active) {
      startStream(selectedDeviceId || undefined);
    } else {
      stopStream();
    }
    return () => { stopStream(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const switchDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startStream(deviceId);
  };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0a0604", borderRadius: 8, overflow: "hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: mirrored ? "scaleX(-1)" : "none",
          display: active && !error ? "block" : "none",
        }}
      />

      {/* Placeholder when off */}
      {!active && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 40 }}>📷</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2, color: "rgba(200,169,81,.5)", textTransform: "uppercase" }}>Camera Off</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "#dc3c3c", textAlign: "center", lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      {/* Controls overlay */}
      {active && !error && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(transparent,rgba(0,0,0,.7))", display: "flex", alignItems: "center", gap: 8 }}>
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={e => switchDevice(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(0,0,0,.6)",
                border: "1px solid rgba(200,169,81,.3)",
                color: "#c8a951",
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: 1,
                padding: "4px 8px",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${devices.indexOf(d) + 1}`}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setMirrored(m => !m)}
            title="Flip"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: mirrored ? "#c8a951" : "rgba(200,169,81,.4)" }}
          >⇄</button>
        </div>
      )}
    </div>
  );
}
