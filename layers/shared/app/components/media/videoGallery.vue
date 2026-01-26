<template>
    <client-only>
        <div id="gallery-videojs">
            <NuxtLink data-lg-size="1280-720"
                data-video='{"source": [{"src":"/videos/video1.mp4", "type":"video/mp4"}], "attributes": {"preload": false, "controls": true}}'
                data-poster="/images/demo/youtube-video-poster.jpg"
                data-sub-html="<h4>'Peck Pocketed' by Kevin Herron | Disney Favorite</h4>">
                <img width="300" height="100" class="img-responsive" src="../../assets/images/demo/youtube-video-poster.jpg" />
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
    const thumbnail = (item) => `${base}assets/${item.directus_files_id.id}?key=thumbnail`

    const videoConfig = (item) =>
        JSON.stringify({
            source: [{
                src: fileUrl(item),
                type: 'video/mp4',
            }, ],
            attributes: {
                preload: false,
                controls: true,
            },
        })

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