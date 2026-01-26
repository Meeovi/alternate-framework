<template>
    <div>
        <div v-if="image?.image?.length">
            <photoCard :photo="image?.image?.filename_disk" />
        </div>

        <div v-if="visual?.media?.length">
            <videoCard :photo="visual?.media?.filename_disk" />
        </div>

        <div v-else>
            No Media Found in this Space
        </div>
    </div>
</template>

<script setup>
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