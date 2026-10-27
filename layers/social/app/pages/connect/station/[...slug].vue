<template>
    <div>
        <v-card class="mx-auto">
            <v-layout>
                <v-app-bar color="pink">
                    <v-toolbar-title>{{ station?.name }}</v-toolbar-title>
                </v-app-bar>

                <v-main>
                    <v-container>
                        <v-row density="comfortable">
                            <v-col cols="12">
                                <v-card color="#952175">
                                    <div class="d-flex flex-no-wrap justify-space-between">
                                        <div class="flex-grow-1" style="min-width: 0">
                                            <v-card-title class="text-headline-small">
                                                {{ station?.file?.title }}
                                            </v-card-title>

                                            <v-card-subtitle>{{ station?.file?.description }}</v-card-subtitle>

                                            <div class="px-4">
                                                <MeeoviRating v-if="station?.id" type="station" :id="station.id" />
                                            </div>

                                            <div class="pa-4">
                                                <!-- Radio: live audio for "Live" stations, else the uploaded file (audio or video by its type) -->
                                                <MeeoviPlayer :src="getAssetURL(station?.file)" :type="station?.file?.type"
                                                    :live="station?.type === 'Live'" :title="station?.name" />
                                            </div>
                                        </div>

                                        <v-avatar class="ma-3" rounded="0" size="125">
                                            <v-img :src="getImageURL(station?.file?.image)"></v-img>
                                        </v-avatar>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-main>
            </v-layout>
        </v-card>

        <MeeoviDiscussion v-if="station?.id" type="station" :id="station.id" :title="station?.name" />
    </div>
</template>

<script setup>
import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
import { useRoute } from 'vue-router'
import { recordPlay } from '../../../composables/media/usePlayHistory'

    const {
        $directus,
        $readItems
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: station
    } = await useAsyncData('stationRaw', async () => {
        // /connect/station/<slug>, or /connect/station/<id> for stations
        // saved without a slug.
        const key = [route.params.slug].flat().join('/')
        const resp = await $directus.request($readItems('radios', {
            filter: /^\d+$/.test(key)
                ? { _or: [{ slug: { _eq: key } }, { id: { _eq: Number(key) } }] }
                : { slug: { _eq: key } },
            fields: ['*', {
                '*': ['*']
            }],
            limit: 1
        }))
        return resp?.data?.[0] || resp?.[0] || null
    }, {
        watch: [() => route.params.slug]
    })

    // The account's "Listen again" row (features/playHistory/listenAgain.vue).
    onMounted(() => recordPlay('listen', station.value?.id))
    watch(() => station.value?.id, (id) => { if (import.meta.client) recordPlay('listen', id) })

    useHead({
        title: computed(() => station.value?.name || 'Station Page')
    });
</script>