<template>
    <v-card class="image-card" elevation="2" rounded="lg">
        <!-- IMAGE PREVIEW -->
        <v-img :src="fileUrl" :alt="media?.title || media?.filename_download || 'Image'" height="180" cover
            class="image-preview" @click="openFull" />

        <!-- TITLE -->
        <v-card-text class="py-2 text-truncate">
            {{ media?.title || media?.filename_download || 'Untitled image' }}
        </v-card-text>

        <!-- ACTIONS SLOT -->
        <v-card-actions>
            <slot name="actions" />
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import {
        computed
    } from 'vue'

    const props = defineProps({
        media: {
            type: Object,
            required: true,
        },
    })

    const config = useRuntimeConfig()

    // Build Directus file URL
    const fileUrl = computed(() => {
        if (!props.media?.id) return ''
        return `${config.public.directus.url}/assets/${props.media.id}`
    })

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