<template>
  <client-only>
    <Gallery
      :raw-items="items"
      :item-mapper="mapAudioItem"
      empty-text="No audio files available."
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
    const { fileUrl } = useMedia()

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

        const mapAudioItem = (item) => ({
            id: item?.id,
            src: placeholder,
            thumb: placeholder,
          alt: item?.file?.title || item?.title || 'Audio file',
            subHtml: audioHtml(item),
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