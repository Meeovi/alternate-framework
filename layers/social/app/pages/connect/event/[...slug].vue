<template>
    <div>
        <section data-bs-version="5.1" class="start article05 cid-uW9KTJQpyO" id="article05-c">
            <div class="container">
                <div class="row justify-content-center align-items-center">
                    <div class="col-12">
                        <div class="card-wrapper">
                            <div class="row">
                                <div class="col-12 col-md-12 col-lg-5 image-wrapper">
                                    <img v-if="event?.image" class="w-100" :src="getAssetUrl(event?.image)" :alt="event?.name">

                                    <img v-else src="../../../assets/images/backgraund-trend.jpg" :alt="event?.name" />
                                </div>
                                <div class="col-12 col-lg col-md-12">
                                    <div class="text-wrapper align-left">
                                        <p class="mbr-text mbr-fonts-style mb-4 display-7">{{ event?.start_time }} {{ event?.end_time }}</p>
                                        <h1 class="mbr-section-title mbr-fonts-style mb-4 display-2">
                                            <strong>{{ event?.name }}</strong>
                                        </h1>
                                        <p class="mbr-text mbr-fonts-style mb-4 display-7">{{ event?.location }}</p>
                                        <p class="mbr-text mbr-fonts-style mb-4 display-7" v-dompurify-html="event?.description"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <v-sheet elevation="4">
            <v-tabs color="primary" align-tabs="center" v-model="tab">
                <v-tab value="one">About</v-tab>
                <v-tab value="two">Discussion</v-tab>
                <v-tab value="three">Settings</v-tab>
            </v-tabs>

            <v-divider></v-divider>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                    <AboutEvent :event="event?.value" />
                </v-tabs-window-item>
                <v-tabs-window-item value="two">
                    <div class="text-center">
                        <div v-if="event?.posts && event.posts.length">
                            <div v-for="(eposts, idx) in event.posts" :key="eposts?.posts_id?.id || idx">
                                <post :post="eposts?.posts_id" />
                            </div>
                        </div>

                        <div v-else>
                            <p>No discussions yet</p>
                        </div>
                    </div>
                </v-tabs-window-item>
                <v-tabs-window-item value="three">
                    <v-sheet class="pa-5">Three</v-sheet>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'
    import AboutEvent from '#social/app/components/blocks/events/about.vue'
    //import DiscussionEvent from '#social/app/components/blocks/events/discussion.vue'

    const route = useRoute();
    const tab = ref(null);
const { readItems, getAssetUrl } = useSdkContentAdapter()

    const { data: event } = await useAsyncData('event', async () => {
        const resp = await readItems('events', {
            filter: { slug: { _eq: `${route.params.slug}` } },
            fields: ['*'],
            limit: 1
        })
        return resp?.data?.[0] || resp?.[0] || null
    })

    useHead({
        title: event?.value?.name || 'Event Page',
    })
</script>