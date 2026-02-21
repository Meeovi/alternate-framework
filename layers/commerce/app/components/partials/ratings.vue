<template>
    <v-rating size="lg" :half-increment="true" :model-value="(rating?.rating)" :max="5" />
</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

    const props = defineProps({
        rating: {
            type: Number,
            default: 5
        },
    });
</script>