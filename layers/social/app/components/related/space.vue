<template>
    <div>
        <v-card class="mx-auto" max-width="400" height="550">
            <NuxtImg provider="cloudinary" v-if="hasAsset(space?.image)" class="align-end text-white" height="200"
                :src="getAssetUrl(space?.image)" :alt="space?.name" />

            <NuxtImg provider="cloudinary" class="align-end text-white" height="200" v-else src="https://via.placeholder.com/800x200" :alt="space?.name" />

            <template>{{ space?.name }}</template>

            <v-card-text class="pt-4">
                Created: {{ new Date(space?.date_created).toLocaleDateString() }}
            </v-card-text>

            <v-card-text>
                <div v-dompurify-html="space?.description"></div>
            </v-card-text>

            <template>
                <share style="position: relative; top: 0px;" />

                <v-btn color="orange" text="Explore" :href="`/space/${space?.slug}`"></v-btn>
            </template>
        </v-card>
    </div>
</template>

<script setup>
    import { ref } from '#imports'

    import share from '../blocks/share.vue'
 const directusUrl = useDirectusUrl?.()
    const hasAsset = (file) => Boolean(getAssetUrl(file))

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
