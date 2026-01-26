<template>
    <v-card elevation="0">
        <v-toolbar class="text-white" image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
            <v-toolbar-title><h3>{{ space?.name }}</h3></v-toolbar-title>

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

            <v-tabs-window v-model="tab" class="spaceTabs">
                <!--About Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[0]?.value">
                    <AboutSpace :group="space" />
                </v-tabs-window-item>

                <!--Posts Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[1]?.value">
                    <div v-if="space?.posts && space.posts.length">
                        <div class="text-center" v-for="(discussions, idx) in space.posts"
                            :key="discussions?.posts_id?.id || idx">
                            <SpaceFeeds :discussion="discussions?.posts_id" />
                        </div>
                    </div>

                    <div class="center-text" v-else>
                        <p>No discussions yet</p>
                    </div>
                </v-tabs-window-item>

                <!--Media Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[2]?.value">
                    <div v-if="space?.image?.length">
                        <photoCard :photo="space?.image?.filename_disk" />
                    </div>

                    <div v-if="space?.media?.length">
                        <videoCard :photo="space?.media?.filename_disk" />
                    </div>

                    <div v-else class="center-text">
                        No Media Found in {{ space?.name }}
                    </div>
                </v-tabs-window-item>

                <!--Products Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[3]?.value">
                        <v-row>
                            <v-col cols="3" v-if="space?.products?.length" v-for="products in space?.products"
                                :key="products.id">
                                <SpaceProducts :product="products?.products_id" />
                            </v-col>

                            <div class="center-text" v-else>No Products yet</div>
                        </v-row>
                </v-tabs-window-item>

                <!--Lists Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[4]?.value">
                    <v-row>
                        <v-col cols="3" v-if="space?.lists?.length" v-for="lists in space?.lists"
                            :key="lists.id">
                            <SpaceLists :list="lists?.lists_id" />
                        </v-col>

                        <div class="center-text" v-else>No Lists yet</div>
                    </v-row>
                </v-tabs-window-item>

                <!--Members Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[5]?.value">
                    <h5 class="center-text">{{ space?.name }} Administrators</h5>

                    <v-row>
                        <v-col cols="3">
                            <membersList :member="space?.owner" />
                        </v-col>
                    </v-row>

                    <h5 class="center-text">{{ space?.name }} Members</h5>

                    <v-row>
                        <v-col cols="3" v-if="space?.members?.length" v-for="members in space?.members"
                            :key="members.id">
                            <membersList :member="members?.directus_users_id" />
                        </v-col>

                        <div class="center-text" v-else>No Members yet</div>
                    </v-row>
                </v-tabs-window-item>

                <!--Settings Tab-->
                <v-tabs-window-item :value="individualSpaceBar?.menus[6]?.value">
                    <v-sheet>
                        <SpaceSettings />
                    </v-sheet>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-sheet>
    </v-card>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import AboutSpace from '~/components/blocks/groups/about.vue'
    import SpaceFeeds from '~/components/related/post.vue'
    import photoCard from '#shared/app/components/media/imageCard.vue'
    import videoCard from '#shared/app/components/media/mediaCard.vue'
    import SpaceProducts from '#commerce/app/components/catalog/product/productCard.vue'
    import SpaceLists from '#lists/app/components/related/list.vue'
    import membersList from '~/components/related/memberList.vue'
    import SpaceSettings from '@/components/features/spaceSections/crud/update-space.vue'

    const route = useRoute();
    const tab = ref(null)
    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

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
                'members.directus_users_id.*',
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


    useHead({
        title: space?.value?.name || 'Space Page',
    })
</script>