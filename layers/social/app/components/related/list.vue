<template>
    <div>
        <v-card class="mx-auto" max-width="400">
            <v-img v-if="list?.image" class="align-end text-white" height="200" :src="getAssetURL(list?.image)" :alt="list?.name"
                cover>
                <v-card-title>{{ list?.name }}</v-card-title>
            </v-img>

            <v-img v-else class="align-end text-white" height="200" src="https://placehold.net/1-800x600.png" :alt="list?.name"
                cover>
                <v-card-title>{{ list?.name }}</v-card-title>
            </v-img>            
            <v-card-subtitle class="pt-4">
                {{ list?.description }}
            </v-card-subtitle>

            <v-card-text>
                <div>{{ list?.type }}</div>
            </v-card-text>

            <v-card-actions>
                <share />

                <v-btn style="right: 5px; bottom: 2px;" color="orange" text="View" :href="`/lists/list/${list?.slug}`"></v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
    import {
        getAssetURL
    } from '#shared/app/utils/get-asset-url'
    import share from '#social/app/components/blocks/share.vue'

    defineProps({
        list: {
            type: Object,
            required: true,
        },
    })

    const {
        $sdk
    } = useNuxtApp()
</script>