<template>
    <div>
        <v-card class="mx-auto" max-width="400" height="550">
            <img v-if="space?.image?.filename_disk" class="align-end text-white" height="200"
                :src="`${$directus.url}assets/${space?.image?.filename_disk}`" :alt="space?.name" />

            <img class="align-end text-white" height="200" v-else src="assets/images/background8.jpg" :alt="space?.name" />

            <v-card-title>{{ space?.name }}</v-card-title>

            <v-card-subtitle class="pt-4">
                Created: {{ new Date(space?.date_created).toLocaleDateString() }}
            </v-card-subtitle>

            <v-card-text>
                <div v-dompurify-html="space?.description"></div>
            </v-card-text>

            <v-card-actions>
                <share style="position: relative; top: 0px;" />

                <v-btn color="orange" text="Explore" :href="`/space/${space?.slug}`"></v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import share from '../blocks/share.vue'
    const {
        $directus
    } = useNuxtApp()

    const model = ref(null)
    const props = defineProps({
        space: {
            type: Object,
            required: true,
        },
    });
    const {
        space
    } = props;
</script>