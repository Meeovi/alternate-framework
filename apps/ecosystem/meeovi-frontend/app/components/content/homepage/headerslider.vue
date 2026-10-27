<template>
    <div>
        <div class="indexHeaderSlider" v-if="slides.length">
            <v-carousel hide-delimiters show-arrows="hover" :continuous="true">
                <div v-for="slide in slides" :key="slide">
                    <v-carousel-item :src="slide" cover @error="failed.push(slide)"></v-carousel-item>
                </div>
            </v-carousel>
        </div>

        <div v-else>
            <intro />
        </div>
    </div>
</template>

<script setup>
    import intro from './intro.vue'
    const { $directus, $readItem, $readItems } = useNuxtApp()

    import { getAssetURL } from '#shared/app/utils/get-asset-url'

    import { computed, ref } from 'vue'

    // lazy: true — don't block the whole page (and any navigateTo() landing
    // here, e.g. the post-login redirect) on this one section's fetch; it
    // renders its own placeholder (the `v-else` <intro/>) until data arrives.
    const {
        data: blocksSlider
    } = useAsyncData('blocksSlider', async () => {
        try {
            const resp = await $directus.request($readItem('page_blocks', '1', {
                fields: ['*', 'media.*.*'],
            }))
            return resp?.data || resp || null
        } catch {
            return null
        }
    }, { lazy: true })

    // Slides whose image fails to load (e.g. a Directus file on a storage
    // disk it can't serve, which answers 503) are dropped; with none left
    // the intro shows instead of an empty 500px carousel.
    const failed = ref([])
    const slides = computed(() => (blocksSlider.value?.media || [])
        .map((media) => getAssetURL(media?.file || media))
        .filter((url) => url && !failed.value.includes(url)))
</script>