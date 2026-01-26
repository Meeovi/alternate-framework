<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ radioPage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="radioPage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <div v-for="(result, index) in stations" :key="index">
            <stationCard style="margin: 10px;" :radio="result" />
        </div>
    </div>
</template>

<script setup>
    import {
        ref,
    } from 'vue';
    import stationCard from '~/components/related/radio.vue'

    const model = ref(null);
    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

    const {
        data: radioPage
    } = await useAsyncData('radioPage', () => {
        return $directus.request($readItem('pages', '97', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: stations
    } = await useAsyncData('stations', () => {
        return $directus.request($readItems('radios', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Meeovi Radio',
    })
</script>