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
                                        <div>
                                            <v-card-title class="text-headline-small">
                                                {{ station?.file?.title }}
                                            </v-card-title>

                                            <v-card-subtitle>{{ station?.file?.description }}</v-card-subtitle>

                                            <v-card-actions>
                                                <videoPlayer :player="station?.file?.filename_disk" />
                                            </v-card-actions>
                                        </div>

                                        <v-avatar class="ma-3" rounded="0" size="125">
                                            <v-img :src="getAssetURL(station?.file?.image)"></v-img>
                                        </v-avatar>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-main>
            </v-layout>
        </v-card>

        <comments />
    </div>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { useRoute } from 'vue-router'
  import comments from '../../../components/blocks/comments.vue'

    const {
        $directus,
        $readItems
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: station
    } = await useAsyncData('stationRaw', async () => {
        const resp = await $directus.request($readItems('radios', {
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
            fields: ['*', {
                '*': ['*']
            }],
            limit: 1
        }))
        return resp?.data?.[0] || resp?.[0] || null
    })

    useHead({
        title: computed(() => station.value?.name || 'Station Page')
    });
</script>