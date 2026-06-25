<template>
    <ClientOnly>
        <div class="player-wrapper">
            <video-player preset="video" skin="minimal">
                <media-container>

                    <!-- HLS Stream Example -->
                    <video v-if="isHls" :src="props.videoSrc" type="application/x-mpegURL" crossorigin="anonymous"
                        playsinline>
                    </video>

                    <video v-else-if="isDash" :src="props.videoSrc" type="application/dash+xml" crossorigin="anonymous"
                        playsinline>
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
        ref
    } from 'vue'

    const isHls = ref(true)

    // Load streaming engines and modules safely on the client side
    if (process.client) {
        // Pulls in core player & automatically registers background engines like SPF/HLS.js
        import('@videojs/html');
        import('@videojs/html/skins/minimal.css');
    }

    const props = defineProps({
        videoSrc: {
            type: String,
            required: true
        }
    });
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