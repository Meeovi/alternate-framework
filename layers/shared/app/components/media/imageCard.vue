<template>
    <v-card class="image-card" elevation="2" rounded="lg">
        <!-- IMAGE PREVIEW -->
        <v-img :src="fileUrl" :alt="media?.title || media?.filename_download || 'Image'" height="180" cover
            class="image-preview" @click="openFull" />

        <!-- TITLE -->
        <template class="py-2 text-truncate">
            {{ media?.title || media?.filename_download || 'Untitled image' }}
        </template>

        <!-- ACTIONS SLOT -->
        <template>
            <slot name="actions" />
        </template>
    </v-card>
</template>

<script setup>
    import {
        computed
    } from '#imports'

    const props = defineProps({
        media: {
            type: Object,
            required: true,
        },
    })

    import useMedia from '../../composables/media/useMedia'
    const { fileUrl } = useMedia()

    // Open full image in new tab
    function openFull() {
        if (fileUrl.value) window.open(fileUrl.value, '_blank')
    }
</script>

<style scoped>
    .image-card {
        cursor: pointer;
        transition: box-shadow 0.2s ease;
    }

    .image-card:hover {
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
    }

    .image-preview {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>