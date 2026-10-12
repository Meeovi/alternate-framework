<template>
    <div>
        <div v-if="image?.image">
            <v-img :src="image?.image" />
        </div>

        <div v-if="visual?.media">
            <MeeoviPlayer :src="getAssetURL(visual?.media)" :type="visual?.media?.type" />
        </div>

        <div v-else>
            No Media Found in this Space
        </div>
    </div>
</template>

<script setup>
    import { getAssetURL } from '#shared/app/utils/get-asset-url'

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