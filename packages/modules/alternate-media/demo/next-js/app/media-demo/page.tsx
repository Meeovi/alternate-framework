"use client";

import { useEffect, useRef } from "react";
import { createMediaEngine, createMediaAnalytics } from "@mframework/alternate-media";
import "@mframework/alternate-media/styles/media.css";

const DEMO_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function MediaDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const engine = createMediaEngine({ player: "videojs" });
    const player = engine.mount(videoRef.current);
    player.loadSource(DEMO_SRC);

    const analytics = createMediaAnalytics(player, (event) => {
      console.log("[next-js media analytics]", event);
    });

    return () => {
      analytics.dispose();
      player.dispose();
    };
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>alternate-media demo (Next.js)</h1>
      <video ref={videoRef} className="alt-media-player" playsInline controls />
    </main>
  );
}
