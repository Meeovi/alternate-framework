<template>
    <client-only>
        <div ref="galleryRef" class="audio-gallery">
            <NuxtLink v-for="item in items" :key="item.id" class="gallery-item" :data-sub-html="audioHtml(item)"
                :href="placeholder">
                <v-card class="audio-card">
                    <v-card-title>
                        {{ item.directus_files_id?.title || 'Audio File' }}
                    </v-card-title>
                </v-card>
            </NuxtLink>
        </div>
    </client-only>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from 'vue'

    const props = defineProps({
        items: {
            type: Array,
            default: () => []
        },
    })

    const galleryRef = ref(null)

    const runtime = useRuntimeConfig()
    const base = runtime.public.directus.url

    const fileUrl = (item) => `${base}assets/${item.directus_files_id.id}`

    // Transparent pixel placeholder (required by LightGallery)
    const placeholder =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

    const audioHtml = (item) => `
  <div style="padding:20px;text-align:center;">
    <audio controls style="width:100%;">
      <source src="${fileUrl(item)}" type="audio/mpeg">
    </audio>
  </div>
`

    onMounted(async () => {
        const lg = await import('lightgallery')
        const lightGallery = lg.default

        lightGallery(galleryRef.value, {
            speed: 400,
            download: false,
        })
    })
</script>

<style scoped>
    .audio-gallery {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .audio-card {
        padding: 10px;
        cursor: pointer;
    }
</style>