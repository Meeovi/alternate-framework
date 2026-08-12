<template>
    <div>
        <v-card class="mx-auto" max-width="400">
            <v-img v-if="store?.image" class="align-end" height="200" :src="getAssetURL(store?.image)" :alt="store?.name || 'Store Name'" cover>
                <v-card-title>{{ store?.name }}</v-card-title>
            </v-img>

             <v-img v-else class="align-end" height="200" src="https://placehold.net/product-600x400.png" :alt="store?.name || 'Store Name'" cover>
                <v-card-title>{{ store?.name }}</v-card-title>
            </v-img>           

            <v-card-subtitle class="pt-4">
                {{ store?.type }}
            </v-card-subtitle>

            <v-card-text>
                <div>{{ store?.description }}</div>
            </v-card-text>

            <v-card-actions>
                <share />

                <v-btn color="orange" :href="`/outlet/${store?.slug}`" text="Explore"></v-btn>
            </v-card-actions>
        </v-card>
    </div>

</template>

<script setup>
    import {
        getAssetURL
    } from '#shared/app/utils/get-asset-url'
    import share from '#social/app/components/blocks/share.vue'

    const props = defineProps({
        store: {
            type: Object,
            required: true,
        },
    });
</script>