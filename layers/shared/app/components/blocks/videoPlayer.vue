<template>
    <ClientOnly>
        <!-- Use Video.js v10 HTML Custom Elements inside ClientOnly -->
        <video-player preset="video" skin="frosted" class="my-player-wrapper">
            <media-container>
                <video :src="props.videoSrc" playsinline>
                </video>
                <media-controls></media-controls>
            </media-container>
        </video-player>
    </ClientOnly>
</template>

<script setup lang="ts">
    // Ensure this code only runs on the client-side
    if (process.client) {
        // Dynamically import the custom elements registration
        import('@videojs/html');
        // Load the desired built-in skin (e.g., 'frosted' or 'minimal')
        import('@videojs/html/skins/frosted.css');
    }

    const props = defineProps({
        videoSrc: {
            type: String,
            required: true
        }
    });
</script>

<style scoped>
    .my-player-wrapper {
        display: block;
        max-width: 800px;
        margin: 0 auto;
        aspect-ratio: 16 / 9;
    }
</style>