<template>
    <client-only>
        <div id="gallery-videojs">
                <NuxtLink v-for="item in props.items" :key="item.id" :data-lg-size="'1280-720'"
                    :data-video="JSON.stringify(playerOptions(item))"
                    :data-poster="thumbnailUrl(item)"
                    :data-sub-html="`<h4>${item.title || ''}</h4>`">
                    <img width="300" height="100" class="img-responsive" :src="thumbnailUrl(item)" />
                </NuxtLink>
        </div>
    </client-only>
</template>

<script setup>
    import {
        ref,
        onMounted
    } from '#imports'

    const props = defineProps({
        items: {
            type: Array,
            default: () => []
        },
    })

    const galleryRef = ref(null)
    import useMedia from '../../composables/useMedia'
    const { fileUrl, thumbnailUrl, playerOptions } = useMedia()

    onMounted(async () => {
        const lg = await import('lightgallery')
        const lightGallery = lg.default

        const lgVideo = (await import('lg-video')).default

        lightGallery(document.getElementById('gallery-videojs'), {
            plugins: [lgVideo],
            videojs: true,
            videojsOptions: {
                muted: true,
            },
        });

    })
</script>

<style scoped>
    .video-gallery {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .gallery-item img {
        width: 200px;
        height: 140px;
        object-fit: cover;
        border-radius: 8px;
    }
</style>