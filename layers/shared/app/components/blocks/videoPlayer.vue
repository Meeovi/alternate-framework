<template>
    <ClientOnly>
        <video-player class="video-player-root">
            <media-container>
                <video :src="src" :poster="poster" playsinline></video>

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
    //
    // <video-player> is only a state boundary (a context provider with no
    // visual output of its own) and <media-container> only handles layout/
    // fullscreen/interaction — neither one is a media element. The actual
    // source has to live on a real <video> (or a streaming-specific element
    // like <hls-video>) nested inside <media-container>; setting src/poster
    // as attributes on <video-player> itself (the previous approach) is
    // silently ignored, which is why nothing ever played. `controls` and
    // `stream-type` aren't real attributes either — controls come from the
    // <media-controls> children below, and stream type is auto-detected
    // from the media element (finite duration -> on-demand).
    const props = defineProps({
        player: {
            type: Object,
            required: true
        }
    })

    const src = computed(() => (props.player as any).sources?.[0]?.src)
    const poster = computed(() => (props.player as any).poster)
</script>

<style scoped>
    .video-player-root {
        width: 100%;
        height: auto;
    }
</style>