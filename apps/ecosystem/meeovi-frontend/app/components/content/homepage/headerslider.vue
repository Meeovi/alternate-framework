<template>
    <div>
        <div class="indexHeaderSlider">
            <v-carousel hide-delimiters show-arrows="hover" :continuous="true">
                <!-- A plain <img>, not the item's :src (a v-img): v-img keeps its image at
                     display:none until its own load handler fires, and the server-rendered
                     first slide usually finishes loading before the page hydrates, so the
                     handler never fired and the hero stayed blank (4 November). -->
                <!-- eager: the first item renders its content on the server instead of after boot.
                     The others render when first shown, so their images need no lazy-loading. -->
                <v-carousel-item v-for="(slide, index) in slides" :key="slide" :eager="index === 0">
                    <img class="indexHeaderSlide" :src="slide" alt=""
                        :fetchpriority="index === 0 ? 'high' : 'auto'"
                        @error="failed.push(slide)">
                </v-carousel-item>
            </v-carousel>
        </div>
    </div>
</template>

<script setup>
    const nuxtApp = useNuxtApp()
    const { $directus, $readItem, $readItems } = nuxtApp

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
    // answer 503) are dropped there too, instead of leaving a broken slide
    // until the image fails in the browser. The home page is cached (isr), so
    // these checks run once a minute at most.
    const {
        data: blocksSlider
    } = useAsyncData('blocksSlider', async () => {
        try {
            const resp = await $directus.request($readItem('page_blocks', '1', {
                fields: ['*', 'media.*.*'],
            }))
            const block = resp?.data || resp || null
            // getAssetURL reads the runtime config, and on the server the Nuxt
            // context is often gone after the await above: it threw, the catch
            // returned no slides, and the page rendered with an empty slider
            // (most full page loads; client-side navigations were fine).
            const urls = await nuxtApp.runWithContext(() => (block?.media || []).map(slideURL).filter(Boolean))
            if (!import.meta.server) return urls
            // Only an answer from Directus that the file is broken drops a
            // slide. A slow answer doesn't: while the home page renders,
            // Directus is busy with its other requests and resizing a slide
            // took over 4 s, which dropped every slide (29 October). A slide
            // that really fails in the browser is still removed by @error.
            const loads = await Promise.all(urls.map((url) =>
                $fetch.raw(url, { method: 'HEAD', timeout: 4000 }).then(() => true, (e) => !(e?.response?.status >= 400))))
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

<style scoped>
.indexHeaderSlider > .v-carousel {
    height: 100%;
}

/* Whole image visible, centred in the carousel (what `contain` did on the v-img). */
.indexHeaderSlide {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>