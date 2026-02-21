<template>
    <div>
        <UCard class="mx-auto" max-width="400" height="550">
            <img v-if="space?.image?.filename_disk" class="align-end text-white" height="200"
                :src="getAssetUrl(space?.image)" :alt="space?.name" />

            <img class="align-end text-white" height="200" v-else src="assets/images/background8.jpg" :alt="space?.name" />

            <template #header>{{ space?.name }}</template>

            <UCard-subtitle class="pt-4">
                Created: {{ new Date(space?.date_created).toLocaleDateString() }}
            </v-card-subtitle>

            <template #header>
                <div v-dompurify-html="space?.description"></div>
            </template>

            <template>
                <share style="position: relative; top: 0px;" />

                <UButton color="orange" text="Explore" :href="`/space/${space?.slug}`"></UButton>
            </template>
        </UCard>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import share from '../blocks/share.vue'
    import useAdapterRequest from '~/composables/useAdapterRequest'
    const { getAssetUrl } = useAdapterRequest()

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