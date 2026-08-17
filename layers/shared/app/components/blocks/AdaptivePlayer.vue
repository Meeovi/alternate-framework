<template>
    <ClientOnly>
        <div class="player-wrapper">
            <video-player preset="video" skin="minimal">
                <media-container>

                    <video v-if="streamType === 'hls'" :src="props.videoSrc" type="application/x-mpegURL" crossorigin="anonymous"
                        playsinline>
                    </video>

                    <video v-else-if="streamType === 'dash'" :src="props.videoSrc" type="application/dash+xml" crossorigin="anonymous"
                        playsinline>
                    </video>

                    <!-- Plain progressive source (mp4/webm/...) — neither
                         adaptive engine applies. -->
                    <video v-else :src="props.videoSrc" crossorigin="anonymous" playsinline>
                    </video>

                    <!-- UI Layout Primitives -->
                    <media-controls></media-controls>
                </media-container>
            </video-player>
        </div>
    </ClientOnly>
</template>

<script setup>
    import {
        computed
    } from 'vue'
    import {
        detectVideoStreamType
    } from '../../utils/videoStreamType'

    const props = defineProps({
        videoSrc: {
            type: String,
            required: true
        }
    });

    // streamType previously didn't exist as an independent, source-driven
    // check — isHls was hardcoded true regardless of the actual file, and
    // isDash was referenced in the template but never declared at all
    // (always undefined/falsy), so DASH sources could never render.
    const streamType = computed(() => detectVideoStreamType(props.videoSrc))

    // Load streaming engines and modules safely on the client side
    if (process.client) {
        // Pulls in core player & automatically registers background engines like SPF/HLS.js
        import('@videojs/html');
        import('@videojs/html/skins/minimal.css');
    }
</script>

<style scoped>
    .player-wrapper {
        width: 100%;
        max-width: 960px;
        margin: 0 auto;
        aspect-ratio: 16 / 9;
        background-color: #000;
    }
</style>