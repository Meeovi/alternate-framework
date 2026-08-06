<template>
    <div>
        <v-card :title="thought?.title" :subtitle="post?.date_created ? new Date(post?.date_created).toLocaleDateString() : 'Unknown date'" :text="thought?.description">

            <v-card-actions>
                <share />
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import share from '#social/app/components/blocks/share.vue';

    const props = defineProps({
        thought: {
            type: Object,
            required: true,
        },
    });
</script>