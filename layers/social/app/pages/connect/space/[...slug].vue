<template>
    <div>
        <v-card elevation="0">
            <v-toolbar class="text-white" image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
                <v-toolbar-title>
                    <h3>{{ space?.name }}</h3>
                </v-toolbar-title>

                <v-toolbar-items>
                    <v-btn class="text-white" variant="plain">
                        {{ space?.status }} Space
                    </v-btn>

                    <v-btn class="text-white" variant="plain">
                        Members: {{ space?.numberOfMembers }}
                    </v-btn>

                    <v-btn class="text-white" variant="plain" v-if="loggedIn && !isMember" @click="joinSpace">
                        Join
                    </v-btn>

                    <v-btn class="text-white" variant="plain" v-else-if="loggedIn && isMember" @click="leaveSpace">
                        Leave
                    </v-btn>

                    <v-btn v-if="userCanEditSpace" class="text-white" variant="plain" @click="goToBuilder">
                        Design Page
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-sheet>
                <v-tabs v-model="tab" align-tabs="center" style="background-color: transparent">
                    <v-tab v-for="menu in visibleTabs" :key="menu?.value" :value="menu?.value">
                        {{ menu?.name }}
                    </v-tab>

                    <template #append>
                        <v-menu v-if="overflowTabs.length">
                            <template #activator="{ props }">
                                <v-btn class="align-self-center me-4" height="100%" rounded="0" variant="plain"
                                    v-bind="props">
                                    More
                                    <v-icon icon="mdi-menu-down" end></v-icon>
                                </v-btn>
                            </template>

                            <v-list class="bg-grey-lighten-3">
                                <v-list-item v-for="menu in overflowTabs" :key="menu?.value" :title="menu?.name"
                                    @click="selectOverflowTab(menu)" />
                            </v-list>
                        </v-menu>

                        <v-btn icon="fas fa-search" variant="text" class="ml-2" @click="searchDialog = true" />
                    </template>
                </v-tabs>

                <SearchDialog v-model="searchDialog" :space="space" @search="handleSearch" />

                <!-- EXPERIENCE BUILDER PAGE -->
                <ExperienceRenderer v-if="builderPage" entity-type="space" :entity-id="space?.id"
                    :slug="route.params.slug" />

                <!-- LEGACY TABS -->
                <v-tabs-window v-else v-model="tab" class="spaceTabs">
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
    /* ------------------------------
   Imports
------------------------------ */
    import {
        ref,
        computed,
        watch,
        nextTick,
        onMounted
    } from 'vue'
    import {
        useRoute,
        useRouter,
        useAsyncData,
        useNuxtApp,
        useHead
    } from '#imports'

    import {
        useAuth
    } from '#auth/app/composables/useAuth'
    import {
        useSpace
    } from '#social/app/composables/spaces/useSpaces'
    import {
        useExperiencePage
    } from '#experience-builder/composables/useExperiencePage'

    import ExperienceRenderer from '#experience-builder/components/ExperienceRenderer.vue'
    import SearchDialog from '../../../components/blocks/groups/SearchDialog.vue'

    /* Legacy tab components */
    import AboutTab from './AboutTab.vue'
    import DiscussionTab from './DiscussionTab.vue'
    import MembersTab from './MembersTab.vue'
    import MediaTab from './MediaTab.vue'
    import ProductsTab from './ProductsTab.vue'
    import ListsTab from './ListsTab.vue'
    import SettingsTab from './SettingsTab.vue'

    /* ------------------------------
       Routing + State
    ------------------------------ */
    const route = useRoute()
    const router = useRouter()

    const tab = ref(route.query.tab || null)
    const searchDialog = ref(false)

    /* ------------------------------
       Auth
    ------------------------------ */
    const {
        user,
        loggedIn
    } = useAuth()

    /* ------------------------------
       Load Space
    ------------------------------ */
    const {
        space,
        exists
    } = await useSpace()

    /* ------------------------------
       Load Navigation Tabs
    ------------------------------ */
    const {
        $sdk
    } = useNuxtApp()

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

    /* ------------------------------
       Experience Builder Detection
    ------------------------------ */
    const {
        fetchPage
    } = useExperiencePage()
    const builderPage = ref(null)

    await useAsyncData('builderPage', async () => {
        if (!space.value?.id) return null
        try {
            const page = await fetchPage('space', space.value.id, route.params.slug)
            builderPage.value = page
            return page
        } catch {
            return null
        }
    })

    /* ------------------------------
       Tab Component Mapping
    ------------------------------ */
    const tabComponentMap = {
        about: AboutTab,
        discussion: DiscussionTab,
        post: DiscussionTab,
        member: MembersTab,
        media: MediaTab,
        product: ProductsTab,
        list: ListsTab,
        setting: SettingsTab,
        experience: ExperienceRenderer
    }

    function getTabComponent(menu) {
        if (!menu?.name) {
            return {
                template: '<div class="center-text">No content for this tab.</div>'
            }
        }

        const name = menu.name.toLowerCase()

        for (const key in tabComponentMap) {
            if (name.includes(key)) return tabComponentMap[key]
        }

        return {
            template: '<div class="center-text">No content for this tab.</div>'
        }
    }

    /* ------------------------------
       Tab Overflow Logic
    ------------------------------ */
    const visibleTabs = computed(() => (individualSpaceBar?.value?.menus || []).slice(0, 4))
    const overflowTabs = computed(() => (individualSpaceBar?.value?.menus || []).slice(4))

    function selectOverflowTab(menu) {
        tab.value = menu?.value
        nextTick(() => {
            tab.value = menu?.value
        })
    }

    /* ------------------------------
       Join / Leave Space
    ------------------------------ */
    const isMember = computed(() => {
        return space.value?.members?.some(m => m?.user?.id === user.value?.id)
    })

    async function joinSpace() {
        await $sdk.social.joinSpace(space.value.id)
        await space.refresh()
    }

    async function leaveSpace() {
        await $sdk.social.leaveSpace(space.value.id)
        await space.refresh()
    }

    /* ------------------------------
       Permissions
    ------------------------------ */
    const userCanEditSpace = computed(() => {
        return user.value?.roles?.includes('space_admin') ||
            user.value?.roles?.includes('space_owner')
    })

    function goToBuilder() {
        router.push(`/space/${route.params.slug}/builder/${route.params.slug}`)
    }

    /* ------------------------------
       Search Handler
    ------------------------------ */
    function handleSearch({
        query,
        type
    }) {
        router.push({
            path: '/results',
            query: {
                q: query,
                type,
                space: space?.value?.id || ''
            }
        })
    }

    /* ------------------------------
       Sync tab with URL
    ------------------------------ */
    watch(tab, (newTab) => {
        if (newTab) {
            router.replace({
                query: {
                    ...route.query,
                    tab: newTab
                }
            })
        }
    })

    onMounted(() => {
        if (route.query.tab) {
            tab.value = route.query.tab
        }
    })

    /* ------------------------------
       Page Title
    ------------------------------ */
    useHead({
        title: space?.value?.name || 'Space Page'
    })
</script>

<style scoped>
    .center-text {
        text-align: center;
    }
</style>