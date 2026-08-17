<template>
    <ClientOnly>
        <video-player :src="player.sources?.[0]?.src" :poster="player.poster"
            :stream-type="player.streamType ?? 'on-demand'" :controls="true" :playsinline="true"
            class="video-player-root">
            <media-container>
                <media-poster></media-poster>
                <media-buffering-indicator></media-buffering-indicator>

                <media-controls>
                    <media-play-button></media-play-button>
                    <media-mute-button></media-mute-button>
                    <media-volume-slider></media-volume-slider>

                    <media-time></media-time>
                    <media-time-slider></media-time-slider>

                    <media-playback-rate-button></media-playback-rate-button>
                    <media-captions-button></media-captions-button>

                    <media-pip-button></media-pip-button>
                    <media-fullscreen-button></media-fullscreen-button>
                </media-controls>

                <media-slider>
                    <media-thumbnail></media-thumbnail>
                    <media-tooltip></media-tooltip>
                </media-slider>

                <media-popover></media-popover>
            </media-container>
        </video-player>
    </ClientOnly>
</template>

<script setup lang="ts">
    // Video.js 10's <video-player>/<media-*> custom elements are fully
    // declarative and self-initializing via the Custom Elements lifecycle —
    // registered once in app/plugins/videojs.client.ts. No imperative setup
    // composable is needed (there previously was one, useVideoPlayer, but it
    // dynamically imported the unrelated classic `video.js` package, which
    // isn't a dependency of this project and always failed).
    defineProps({
        player: {
            type: Object,
            required: true
        }
    })
</script>

<style scoped>
    .video-player-root {
        width: 100%;
        height: auto;
    }
</style>