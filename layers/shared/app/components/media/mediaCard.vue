<template>
    <UCard class="media-card" elevation="2" rounded="lg" @click="emit('open', media)">
        <!-- THUMBNAIL -->
        <div class="thumb-wrapper">
            <component :is="thumbnailComponent" :media="media" class="thumb" />
        </div>

        <!-- TITLE -->
        <template #header class="py-2 text-truncate">
            {{ media?.title || media?.filename_download || 'Untitled file' }}
        </template>

        <!-- OPTIONAL ACTIONS -->
        <template v-if="$slots.actions">
            <slot name="actions" />
        </template>
    </UCard>
</template>

<script setup>
    import {
        computed
    } from 'vue'
    import imageCard from './imageCard.vue'
    import mediaPlayer from './mediaPlayer.vue'

    const props = defineProps({
        media: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(['open'])

    const mime = computed(() => props.media?.type || '')

    const thumbnailComponent = computed(() => {
        if (mime.value.startsWith('image')) return imageCard
        if (mime.value.startsWith('audio') || mime.value.startsWith('video')) return mediaPlayer
        return {
            template: `
      <div class="generic-thumb">
        <UIcon size="48">mdi-file</UIcon>
      </div>
    `,
        }
    })
</script>

<style scoped>
    .media-card {
        cursor: pointer;
        transition: box-shadow 0.2s ease;
    }

    .media-card:hover {
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
    }

    .thumb-wrapper {
        width: 100%;
        height: 160px;
        overflow: hidden;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .generic-thumb {
        width: 100%;
        height: 100%;
        background: #f3f3f3;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>