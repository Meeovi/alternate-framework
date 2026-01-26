<template>
    <v-rating size="lg" :half-increment="true" :model-value="(rating?.rating)" :max="5" />
</template>

<script setup>

    const props = defineProps({
        rating: {
            type: Number,
            default: 5
        },
    });
</script>