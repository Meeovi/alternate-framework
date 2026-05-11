<template>
    <div>
        <div v-if="image?.image">
            <photoCard :media="image?.image" />
        </div>

        <div v-if="visual?.media">
            <videoCard :media="visual?.media" />
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