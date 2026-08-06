<template>
    <div class="contentPage">
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
                <div ref="postsScrollContainer" class="feed-scroll-container">
                    <v-row class="media-container-row">
                        <template v-if="posts?.length">
                            <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                                <postCard :post="post" />
                            </v-col>
                        </template>
                        <div class="center-text" v-else-if="!loadingPosts">No Activity yet</div>
                    </v-row>
                    <div v-if="loadingPosts" class="text-center py-4">
                        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                    </div>
                </div>
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
    import { authClient } from "#auth/lib/auth-client";
    import { useInfiniteScroll } from '@vueuse/core'

    const { data: session } = await authClient.useSession();

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: feedBar
    } = await useAsyncData('feedBar', async () => {
        const resp = await $directus.request($readItem('navigation', '32', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const {
        data: feedsPage
    } = await useAsyncData('feedsPage', async () => {
        const resp = await $directus.request($readItem('pages', '34', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const posts = ref([])
    const postsPage = ref(1)
    const postsLimit = ref(10)
    const loadingPosts = ref(false)
    const hasMorePosts = ref(true)
    const postsScrollContainer = ref(null)

    const {
        data: circles
    } = await useAsyncData('circles', async () => {
        const resp = await $directus.request($readItems('circles', {
            fields: ['*', 'posts.posts_id.*', 'products.products_id.*', 'users.*'],
            filter: {
                creator: {
                    _eq: session.user?.id
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    const loadPosts = async (page) => {
        if (loadingPosts.value || !hasMorePosts.value) return

        loadingPosts.value = true
        try {
            const resp = await $directus.request($readItems('posts', {
                fields: ['*', {
                    '*': ['*']
                }],
                filter: {
                    author: {
                        _eq: session.user?.id
                    }
                },
                limit: postsLimit.value,
                page: page
            }))

            const newPosts = resp?.data ?? resp ?? []
            if (newPosts.length === 0) {
                hasMorePosts.value = false
            } else {
                posts.value.push(...newPosts)
                postsPage.value = page + 1
            }
        } finally {
            loadingPosts.value = false
        }
    }

    const loadMorePosts = () => {
        loadPosts(postsPage.value)
    }

    useInfiniteScroll(postsScrollContainer, loadMorePosts, {
        distance: 200,
    })

    useHead({
        title: computed(() => feedsPage.value?.name || 'Feeds')
    })

    definePageMeta({
        //middleware: ['authenticated']
    })
</script>

<style scoped>
.feed-scroll-container {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}
</style>