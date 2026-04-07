<script lang="ts">
  import { onMount } from "svelte";
  import { createMediaEngine, createMediaAnalytics } from "@mframework/alternate-media";
  import "@mframework/alternate-media/styles/media.css";

  let videoEl: HTMLVideoElement;

  onMount(() => {
    const engine = createMediaEngine({ player: "videojs" });
    const player = engine.mount(videoEl);
    player.loadSource("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");

    const analytics = createMediaAnalytics(player, (event) => {
      console.log("[sveltekit media analytics]", event);
    });

    return () => {
      analytics.dispose();
      player.dispose();
    };
  });
</script>

<main style="max-width: 900px; margin: 2rem auto; padding: 0 1rem;">
  <h1>alternate-media demo (SvelteKit)</h1>
  <video bind:this={videoEl} class="alt-media-player" controls playsinline></video>
</main>
