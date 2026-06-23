<template>
    <div>
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
                    <v-tab v-for="menu in visibleTabs" :key="menu?.value" :value="menu?.value">
                        {{ menu?.name }}
                    </v-tab>

                    <template #append>
                        <v-menu v-if="overflowTabs.length">
                            <template v-slot:activator="{ props }">
                                <v-btn class="align-self-center me-4" height="100%" rounded="0" variant="plain"
                                    v-bind="props">
                                    More
                                    <v-icon icon="mdi-menu-down" end></v-icon>
                                </v-btn>
                            </template>
                            <v-list class="bg-grey-lighten-3">
                                <v-list-item v-for="menu in overflowTabs" :key="menu?.value" :title="menu?.name"
                                    @click="selectOverflowTab(menu)"></v-list-item>
                            </v-list>
                        </v-menu>
                        <v-btn icon="fas fa-search" variant="text" class="ml-2" @click="searchDialog = true"></v-btn>
                    </template>
                </v-tabs>

                <SearchDialog
                    v-model="searchDialog"
                    :space="space"
                    @search="handleSearch"
                />

                <v-tabs-window v-model="tab" class="spaceTabs">
                    <v-tabs-window-item v-for="menu in (individualSpaceBar?.menus || [])" :key="menu?.value"
                        :value="menu?.value">
                        <component :is="getTabComponent(menu)" :space="space" :user="user" :loggedIn="loggedIn" />
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
    import {
        normalizeSpaceRecord,
        resolveUserRelation
    } from '#social/app/composables/content/socialMappers'

    import AboutTab from './AboutTab.vue'
    import DiscussionTab from './DiscussionTab.vue'
    import MembersTab from './MembersTab.vue'
    import MediaTab from './MediaTab.vue'
    import ProductsTab from './ProductsTab.vue'
    import ListsTab from './ListsTab.vue'
    import SettingsTab from './SettingsTab.vue'
    import {
        useAuth
    } from '#auth/app/composables/useAuth'
    // Map tab names to components
    const tabComponentMap = {
        about: AboutTab,
        discussion: DiscussionTab,
        post: DiscussionTab,
        member: MembersTab,
        media: MediaTab,
        product: ProductsTab,
        list: ListsTab,
        setting: SettingsTab
    }

    function getTabComponent(menu) {
        if (!menu?.name) return {
            template: '<div class="center-text">No content for this tab.</div>'
        }
        const name = menu.name.toLowerCase()
        for (const key in tabComponentMap) {
            if (name.includes(key)) return tabComponentMap[key]
        }
        // fallback
        return {
            template: '<div class="center-text">No content for this tab.</div>'
        }
    }

    const route = useRoute();
    const router = useRouter();
    const tab = ref(route.query.tab || null)
    const searchDialog = ref(false)
    const { $sdk } = useNuxtApp()
    const {
        user,
        loggedIn
    } = useAuth()

    const {
        data: space
    } = await useAsyncData('space', async () => {
        const resp = await $sdk.content.readItems('spaces', {
            filter: {
                slug: {
                    _eq: `${route.params.slug}`
                }
            },
            fields: ['*', 'posts.posts_id.*', 'image.*', 'owner.*', 'members.user.*',
                'products.products_id.*', 'lists.lists_id.*', 'media.*'
            ],
            limit: 1
        })
        return normalizeSpaceRecord(resp?.[0] || null)
    })

    const {
        data: individualSpaceBar
    } = await useAsyncData('individualSpaceBar', async () => {
        const resp = await $sdk.content.getItem('navigation', '83', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp || null
    })

    // Tab overflow logic

    // Watch tab and update query param
    watch(tab, (newTab) => {
        if (newTab) {
            router.replace({ query: { ...route.query, tab: newTab } })
        }
    })

    // On mount, set tab from query if present
    onMounted(() => {
        if (route.query.tab) {
            tab.value = route.query.tab
        }
    })

    // Search dialog handler
    function handleSearch({ query, type }) {
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
    import {
        computed,
        nextTick,
        watch,
        onMounted
    } from 'vue'
    import SearchDialog from '../../../components/blocks/groups/SearchDialog.vue'
    const visibleTabs = computed(() => (individualSpaceBar?.value?.menus || []).slice(0, 4))
    const overflowTabs = computed(() => (individualSpaceBar?.value?.menus || []).slice(4))

    function selectOverflowTab(menu) {
        tab.value = menu?.value
        nextTick(() => {
            tab.value = menu?.value
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