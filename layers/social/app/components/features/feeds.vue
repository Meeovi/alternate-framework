<template>
    <div>
		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ feedsPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="feedsPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${feedBar?.color}; color: ${feedBar?.colortext} !important`">
                <v-toolbar-title>{{ feedBar?.name }}</v-toolbar-title>


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
                    <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-if="circles?.length" v-for="circlesPost in circles" :key="circlesPost.id">
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
        ref,
        computed
    } from 'vue'
    import postCard from '~/components/related/post.vue'

    const user = useSupabaseUser()

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
    } = await useAsyncData('feedsPage', () => {
        return $directus.request($readItem('pages', '34', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: posts
    } = await useAsyncData('posts', async () => {
        const resp = await $directus.request($readItems('posts', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: circles
    } = await useAsyncData('circles', async () => {
        const resp = await $directus.request($readItems('circles', {
            fields: [
                '*', 
                'posts.posts_id.*',
                'products.products_id.*',
                'users.*'
                
            ],
            filter: {
                creator: {
                    _eq: user?.id,
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: 'Activity Feed',
    })
</script>