<template>
    <div>
        <div v-if="image?.image">
            <v-img :src="image?.image" />
        </div>

        <div v-if="visual?.media">
            <videoPlayer :player="visual?.media" />
        </div>

        <div v-else>
            No Media Found in this Space
        </div>
    </div>
</template>

<script setup>
    import videoPlayer from '#shared/app/components/blocks/videoPlayer.vue'

    defineProps({
        image: {
            type: Object,
            required: true,
        },
        visual: {
            type: Object,
            required: true,
        },
    })
</script>