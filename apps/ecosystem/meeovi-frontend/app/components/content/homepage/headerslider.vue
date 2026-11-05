<template>
    <div>
        <div class="indexHeaderSlider" :style="{ '--slide-ratio': ratio }">
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
                        @load="index === 0 && measure($event)"
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

    import { computed, onMounted, ref } from 'vue'

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
    // One retry: a single failed read used to leave the slider empty, and the
    // cached home page then served that empty slider for up to a minute.
    const readSliderBlock = async () => {
        const query = () => $directus.request($readItem('page_blocks', '1', { fields: ['*', 'media.*.*'] }))
        try {
            return await query()
        } catch (e) {
            console.warn('[headerslider] reading page_blocks 1 failed, retrying:', e?.message || e)
            return await query()
        }
    }

    const {
        data: blocksSlider,
        status: slidesStatus,
        refresh: refreshSlides
    } = useAsyncData('blocksSlider', async () => {
        try {
            const resp = await readSliderBlock()
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
        } catch (e) {
            console.warn('[headerslider] no slides:', e?.message || e)
            return []
        }
    // lazy: true — a client-side navigation here (e.g. the post-login
    // redirect) isn't held up by this fetch; the server render still waits.
    }, { lazy: true })

    // The slider takes the banners' own shape (they're 1600x592) instead of a
    // fixed 500px: on phones a fixed height left a thin strip of image in a
    // tall white box. The first slide's real size replaces the default once
    // it has loaded, so differently shaped banners still fit.
    const ratio = ref(1600 / 592)
    const measure = (e) => {
        const { naturalWidth: w, naturalHeight: h } = e.target
        if (w && h) ratio.value = w / h
    }

    const failed = ref([])
    const slides = computed(() => (blocksSlider.value || []).filter((url) => !failed.value.includes(url)))

    // A page rendered (and cached) while Directus was unreachable arrives with
    // no slides: fetch them again in the browser rather than show an empty hero.
    onMounted(() => {
        if (slidesStatus.value === 'success' && !(blocksSlider.value || []).length) refreshSlides()
    })
</script>

<style scoped>
/* !important: v-carousel puts its 500px default height inline. */
.indexHeaderSlider > .v-carousel {
    height: auto !important;
    aspect-ratio: var(--slide-ratio);
}

.indexHeaderSlide {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>