<template>
    <ClientOnly>
        <video-player ref="playerEl" :src="player.sources?.[0]?.src" :poster="player.poster"
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

        <div v-if="error" class="video-error">
            {{ error.message }}
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
    import {
        useVideoPlayer
    } from '@/composables/useVideoPlayer'

    const props = defineProps({
        player: {
            type: Object,
            required: true
        }
    })

    const {
        playerEl,
        isReady,
        error
    } = useVideoPlayer(props.player)
</script>

<style scoped>
    .video-player-root {
        width: 100%;
        height: auto;
    }

    .video-error {
        color: red;
        padding: 1rem;
    }
</style>