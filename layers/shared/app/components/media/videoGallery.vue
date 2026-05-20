<template>
    <client-only>
        <Gallery
            :raw-items="items"
            :item-mapper="mapVideoItem"
            empty-text="No videos available."
        />
    </client-only>
</template>

<script setup>
        import Gallery from '../ui/Gallery.vue'

    const props = defineProps({
            items: {
                type: Array,
                default: () => [],
            },
    })

    import useMedia from '../../composables/media/useMedia'
        const { fileUrl, thumbnailUrl } = useMedia()

        const mapVideoItem = (item) => ({
            id: item?.id,
            src: fileUrl(item),
            thumb: thumbnailUrl(item),
            poster: thumbnailUrl(item),
            size: '1280-720',
            alt: item?.title || 'Video',
            subHtml: `<h4>${item?.title || ''}</h4>`,
            video: {
                source: [{ src: fileUrl(item), type: 'video/mp4' }],
                attributes: { preload: false, controls: true },
            },
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