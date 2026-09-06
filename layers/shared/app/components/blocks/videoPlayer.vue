<template>
    <div class="video-player-root">
        <ClientOnly>
            <video-player class="video-player-root__player">
                <media-container>
                    <video :src="src || undefined" :poster="poster" playsinline @error="onError" @loadeddata="onLoaded"></video>

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

            <!-- The custom elements above only initialise client-side, so
                 there's nothing to show during SSR/pre-hydration — render
                 the same frame as the "unavailable" state instead of a
                 blank gap, so the player area is never empty. -->
            <template #fallback>
                <div class="video-player-root__placeholder" />
            </template>
        </ClientOnly>

        <!-- Overlaid on top of the player, not instead of it — the player
             frame/controls stay in the DOM either way, so this only ever
             covers a player that has nothing to actually play: no source
             was given, or the browser fired an error trying to load one
             (404, unsupported format, network failure, ...). -->
        <div v-if="isUnavailable" class="video-player-root__unavailable">
            <v-icon icon="fas fa-video-slash" size="32" />
            <span>Video is not available</span>
        </div>
    </div>
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
    import { computed, ref, watch } from 'vue'

    const props = defineProps({
        player: {
            type: Object,
            required: true
        }
    })

    const src = computed(() => (props.player as any).sources?.[0]?.src)
    const poster = computed(() => (props.player as any).poster)

    const hasError = ref(false)

    // A missing source is known up front; a broken one only reveals itself
    // once the browser actually tries to load it, so both are tracked and
    // either is enough to show the message.
    const isUnavailable = computed(() => !src.value || hasError.value)

    function onError() {
        hasError.value = true
    }

    function onLoaded() {
        hasError.value = false
    }

    // A different vibe/product can be shown through the same mounted
    // player (e.g. swapping which item is selected in a slider) — reset
    // the error state so a previous item's failure doesn't stick around
    // and hide a perfectly good new source.
    watch(src, () => {
        hasError.value = false
    })
</script>

<style scoped>
    .video-player-root {
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: 4px;
        overflow: hidden;
    }

    .video-player-root__player {
        width: 100%;
        height: 100%;
    }

    .video-player-root__placeholder {
        width: 100%;
        height: 100%;
        background: #000;
    }

    .video-player-root__unavailable {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.85);
        background: rgba(0, 0, 0, 0.55);
        font-size: 0.9rem;
        pointer-events: none;
    }
</style>
