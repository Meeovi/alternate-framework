<template>
    <div>
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${feedBar?.color}; color: ${feedBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ feedsPage?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="feedsPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in feedBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${feedBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="feedBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[1]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>Not following anyone yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-if="circles?.length"
                        v-for="circlesPost in circles" :key="circlesPost.id">
                        <postCard :post="circlesPost?.posts_id" />
                    </v-col>

                    <div class="center-text" v-else>No Circles yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import postCard from '../../components/related/post.vue'

    const {
        user
    } = useAuth()

    const { $sdk } = useNuxtApp()
    const tab = ref(null);

    const {
        data: feedBar
    } = await useAsyncData('feedBar', async () => {
        const resp = await $sdk.content.getItem('navigation', '32', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp?.data ?? resp ?? null
    })

    const {
        data: feedsPage
    } = await useAsyncData('feedsPage', async () => {
        const resp = await $sdk.content.getItem('pages', '34', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp?.data ?? resp ?? null
    })

    const {
        data: posts
    } = await useAsyncData('posts', async () => {
        const resp = await $sdk.content.readItems('posts', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp?.data ?? resp ?? []
    })

    const {
        data: circles
    } = await useAsyncData('circles', async () => {
        const resp = await $sdk.content.readItems('circles', {
            fields: ['*', 'posts.posts_id.*', 'products.products_id.*', 'users.*'],
            filter: {
                creator: {
                    _eq: user?.id
                }
            }
        })
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: computed(() => feedsPage.value?.name || 'Feeds')
    })

    definePageMeta({
        //middleware: ['authenticated']
    })
</script>