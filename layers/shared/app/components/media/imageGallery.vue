<template>
    <client-only>
        <div ref="galleryRef" class="image-gallery">
            <NuxtLink v-for="item in items" :key="item.id" :href="fileUrl(item)" class="gallery-item">
                <img :src="fileUrl(item)" :alt="item.directus_files_id?.title || 'Image'" />
            </NuxtLink>
        </div>
    </client-only>
</template>

<script setup>
    import {
        onMounted,
        ref
    } from 'vue'

    const props = defineProps({
        items: Array,
    })

    const galleryRef = ref(null)

    const fileUrl = (item) =>
        `${useRuntimeConfig().public.directus.url}assets/${item.directus_files_id.id}`

    onMounted(async () => {
        const lg = await import('lightgallery')
        const lightGallery = lg.default

        const lgThumbnail = (await import('lg-thumbnail')).default
        const lgZoom = (await import('lg-zoom')).default

        lightGallery(galleryRef.value, {
            plugins: [lgThumbnail, lgZoom],
            speed: 400,
            thumbnail: true,
            zoom: true,
        })
    })
</script>