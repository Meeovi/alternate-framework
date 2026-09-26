<template>
    <div class="indexHeaderSlider">
        <v-carousel hide-delimiters show-arrows="hover" :continuous="true" v-if="blocksSlider?.length">
            <div v-for="(media, index) in blocksSlider?.media" :key="index">
                <v-carousel-item :src="`${$directus.url}assets/${media?.directus_files_id?.filename_disk}`"
                    cover></v-carousel-item>
            </div>
        </v-carousel>

        <section data-bs-version="5.1" class="header1 stepm5 cid-uLE5K3b3Rw mbr-fullscreen" id="aheader2-1c">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(86, 47, 105);"></div>

            <div class="mt-auto mb-auto container-fluid">
                <div class="row">
                    <div class="col-12 justify-content-center d-flex flex-wrap">
                        <h1 class="mbr-section-title mbr-fonts-style align-left w-100 display-1">
                            <strong><em>{{ blocksSlider?.callout?.[0]?.title }}</em></strong>
                        </h1>
                        <div class="img-wrapper">
                            <img src="../../assets/images/logoalpha-640x400.png" alt="Celestial Guardians">
                        </div>
                        <h2 class="mbr-section-subtitle mbr-fonts-style mb-0 align-right w-100 display-1">
                            <strong><em>{{ blocksSlider?.callout?.[1]?.title }}</em></strong>
                        </h2>
                    </div>
                </div>
            </div>
            <div class="container-fluid">
                <p class="mbr-text mbr-fonts-style mb-0 align-left display-4" v-html="blocksSlider?.description"></p>
                <div class="mbr-section-btn align-left mt-3">
                    <a class="btn btn-info display-4" href="/stories">
                        Find your story!
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: blocksSlider
    } = useLazyAsyncData('blocksSlider', () => {
        return $directus.request($readItem('blocks', '8', {
            fields: ['*', 'media.*.*'],
        }))
    })
</script>