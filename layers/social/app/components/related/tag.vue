<template>
    <div>
        <div class="text-center">
            <v-chip class="ma-2" label :to="`/hashtag/${tag?.slug}`">
                {{ tag?.name }}
            </v-chip>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        tag: {
            type: Object,
            required: true,
        },
    });
    const {
        tag
    } = props;
</script>