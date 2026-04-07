import { createFileRoute } from "@tanstack/solid-router";
import { onCleanup, onMount } from "solid-js";
import { createMediaEngine, createMediaAnalytics } from "@mframework/alternate-media";
import "@mframework/alternate-media/styles/media.css";

export const Route = createFileRoute("/media-demo")({
  component: MediaDemoPage,
});

function MediaDemoPage() {
  let videoEl: HTMLVideoElement | undefined;

  onMount(() => {
    if (!videoEl) return;

    const engine = createMediaEngine({ player: "videojs" });
    const player = engine.mount(videoEl);
    player.loadSource("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");

    const analytics = createMediaAnalytics(player, (event) => {
      console.log("[tanstack-start-solid media analytics]", event);
    });

    onCleanup(() => {
      analytics.dispose();
      player.dispose();
    });
  });

  return (
    <main style={{ "max-width": "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>alternate-media demo (TanStack Start Solid)</h1>
      <video ref={videoEl} class="alt-media-player" controls playsInline />
    </main>
  );
}
