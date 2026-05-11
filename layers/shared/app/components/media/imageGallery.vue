<template>
    <client-only>
        <Gallery
            :raw-items="items"
            :item-mapper="mapImageItem"
            empty-text="No images available."
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

    import useMedia from '../../composables/useMedia'
    const { fileUrl } = useMedia()

        const mapImageItem = (item) => ({
            id: item?.id,
            src: fileUrl(item),
            thumb: fileUrl(item),
            alt: item?.file?.title || item?.title || 'Image',
        })
</script>