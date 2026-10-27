<template>
    <div>
        <div class="indexHeaderSlider" v-if="slides.length">
            <v-carousel hide-delimiters show-arrows="hover" :continuous="true">
                <v-carousel-item v-for="(slide, index) in slides" :key="slide" :src="slide" cover
                    :eager="index === 0" alt="" @error="failed.push(slide)"></v-carousel-item>
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

    // Directus resizes and re-encodes on request (and caches the result), so
    // a 3000px PNG upload goes out as a ~1600px WebP.
    const slideURL = (media) => {
        const url = getAssetURL(media?.file || media)
        return url && /\/assets\/[^/?]+$/.test(url) ? `${url}?width=1600&format=webp&quality=70` : url
    }

    // Asked for while the page renders on the server, so the first slide is
    // in the HTML instead of appearing after the page's JavaScript runs.
    // Slides Directus can't serve (files on a storage disk it can't read
    // answer 503) are dropped there too: with none left the intro renders
    // straight away, instead of an empty carousel that swaps to the intro
    // once the images fail in the browser. The home page is cached (isr), so
    // these checks run once a minute at most.
    const {
        data: blocksSlider
    } = useAsyncData('blocksSlider', async () => {
        try {
            const resp = await $directus.request($readItem('page_blocks', '1', {
                fields: ['*', 'media.*.*'],
            }))
            const block = resp?.data || resp || null
            const urls = (block?.media || []).map(slideURL).filter(Boolean)
            if (!import.meta.server) return urls
            const loads = await Promise.all(urls.map((url) =>
                $fetch.raw(url, { method: 'HEAD', timeout: 4000 }).then(() => true, () => false)))
            return urls.filter((_, i) => loads[i])
        } catch {
            return []
        }
    // lazy: true — a client-side navigation here (e.g. the post-login
    // redirect) isn't held up by this fetch; the server render still waits.
    }, { lazy: true })

    const failed = ref([])
    const slides = computed(() => (blocksSlider.value || []).filter((url) => !failed.value.includes(url)))
</script>
