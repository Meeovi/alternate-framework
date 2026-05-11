<script setup lang="ts">
import MediaPlayer from "@mframework/alternate-media/adapters/vue";
import "@mframework/alternate-media/styles/media.css";

const source = {
  src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  type: "application/x-mpegURL",
};

function onAnalytics(event: unknown) {
  console.log("[nuxt media analytics]", event);
}
</script>

<template>
  <main style="max-width: 900px; margin: 2rem auto; padding: 0 1rem">
    <h1>alternate-media demo (Nuxt)</h1>
    <MediaPlayer :source="source" :analytics-reporter="onAnalytics" />
  </main>
</template>
