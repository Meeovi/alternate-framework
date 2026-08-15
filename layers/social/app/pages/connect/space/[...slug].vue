<template>
    <div class="contentPage">
        <v-card elevation="0">
            <v-toolbar class="text-white" image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
                <v-toolbar-title>
                    <h3>{{ space?.name }}</h3>
                </v-toolbar-title>

                <v-toolbar-items>
                    <v-btn class="text-white" variant="plain">{{ space?.status }} Space</v-btn>

                    <v-btn class="text-white" variant="plain">Members: {{ space?.numberOfMembers }}</v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-sheet>

                <v-tabs v-model="tab" align-tabs="center" style="background-color: transparent">
                    <div v-for="(menu, index) in individualSpaceBar?.menus" :key="index">
                        <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
                    </div>
                </v-tabs>

                <SearchDialog v-model="searchDialog" :space="space" @search="handleSearch" />

                <v-tabs-window v-model="tab" class="spaceTabs">
                    <!--Posts Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[0]?.value">
                        <div v-if="space?.posts && space.posts.length">
                            <div class="text-center" v-for="(discussions, idx) in space.posts"
                                :key="discussions?.posts_id?.id || idx">
                                <postsCard :post="discussions?.posts_id" />
                            </div>
                        </div>

                        <div class="center-text" v-else>
                            <p>No discussions yet</p>
                        </div>
                    </v-tabs-window-item>

                    <!--About Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[1]?.value">
                        <AboutTab :space="space" />
                    </v-tabs-window-item>

                    <!--Members Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[2]?.value" id="SpaceMembers">
                        <h5 class="center-text">{{ space?.name }} Administrators</h5>

                        <v-row>
                            <v-col cols="3">
                                <MembersTab :member="space?.owner" />
                            </v-col>
                        </v-row>

                        <h5 class="center-text">{{ space?.name }} Members</h5>

                        <v-row>
                            <v-col cols="3" v-if="space?.members?.length" v-for="members in space?.members"
                                :key="members.id">
                                <MembersTab :member="members?.directus_users_id" />
                            </v-col>

                            <div class="center-text" v-else>
                                <p>No Members yet</p>
                            </div>    
                        </v-row>
                    </v-tabs-window-item>

                    <!--Media Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[3]?.value">

                        <v-row v-if="space?.media?.length">
                            <v-col cols="3" v-for="media in space?.media" :key="media.id">
                                <MediaTab :media="media?.media_id" />
                            </v-col>
                        </v-row>

                        <div class="center-text" v-else>
                            <p>No Media yet</p>
                        </div>
                    </v-tabs-window-item>

                    <!--Products Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[4]?.value">
                        <v-row>
                            <v-col cols="3" v-if="space?.products?.length" v-for="products in space?.products"
                                :key="products.id">
                                <productCard :product="products?.products_id" />
                            </v-col>

                            <div class="center-text" v-else>
                                <p>No Products yet</p>
                            </div>
                        </v-row>
                    </v-tabs-window-item>

                    <!--Lists Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[5]?.value">
                        <v-row>
                            <v-col cols="3" v-if="space?.lists?.length" v-for="lists in space?.lists" :key="lists.id">
                                <listsCard :list="lists?.lists_id" />
                            </v-col>

                            <div class="center-text" v-else>
                                <p>No Lists yet</p>
                            </div>
                        </v-row>
                    </v-tabs-window-item>

                    <!--Settings Tab-->
                    <v-tabs-window-item :value="individualSpaceBar?.menus[6]?.value">
                        <v-sheet>
                            <SettingsTab />
                        </v-sheet>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-sheet>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'
    import AboutTab from '../../../components/blocks/groups/about.vue'
    import postsCard from '../../../components/features/feed/posts.vue'
    import MembersTab from '../../../components/related/memberList.vue'
    import MediaTab from '../../../components/blocks/groups/media.vue'
    import productCard from '#commerce/app/components/catalog/product/products.vue'
    import listsCard from '../../../components/features/lists/lists.vue'
    import SettingsTab from './SettingsTab.vue'
    import {
        useAuth
    } from '#auth/app/composables/useAuth'
    import SearchDialog from '../../../components/blocks/groups/SearchDialog.vue'

    const route = useRoute();
    const router = useRouter();
    const tab = ref(null)
    const searchDialog = ref(false)
    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

    const {
        user,
        loggedIn
    } = useAuth()

    const {
        data: space
    } = await useAsyncData('space', () => {
        return $directus.request($readItems('spaces', {
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
            fields: [
                '*',
                'posts.posts_id.*',
                'image.*',
                'owner.*',
                'members.*',
                'products.products_id.*',
                'lists.lists_id.*',
                'media.*'
            ],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })

    const {
        data: individualSpaceBar
    } = await useAsyncData('individualSpaceBar', () => {
        return $directus.request($readItem('navigation', '83', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    // Search dialog handler
    function handleSearch({
        query,
        type
    }) {
        // Navigate to /results with query and type, and optionally space id
        router.push({
            path: '/results',
            query: {
                q: query,
                type,
                space: space?.value?.id || space?.id || ''
            }
        })
    }

    useHead({
        title: space?.value?.name || 'Space Page',
    })
</script>

<style scoped>
    .center-text {
        text-align: center;
    }
</style>