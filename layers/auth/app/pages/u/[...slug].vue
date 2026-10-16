<template>
    <v-card class="contentPage" rounded="lg" border flat>
        <v-toolbar color="primary" extended flat>
            <template v-slot:prepend>

            </template>
        </v-toolbar>

        <v-card class="mx-auto mt-n16 mb-4 profilePage" elevation="2" min-height="100vh" max-width="80%">
            <!-- A bare <template> (no v-if/v-for/v-slot) renders as an inert HTML <template>: nothing shows -->
            <template v-if="profile">
                <v-toolbar>
                    <div style="padding-left: 10px; display: flex; align-items: center;">
                        <v-avatar v-if="avatar" :image="avatar" size="32" />
                        <v-icon v-else icon="fas fa-user-circle" />
                        <v-toolbar-title style="padding-left: 5px;" :text="profile?.name || 'User'"></v-toolbar-title>
                        <span v-if="profile?.username" class="text-medium-emphasis pl-2">@{{ profile.username }}</span>
                    </div>

                    <template v-slot:append>
                        <!-- Content and settings menus are only for the profile's owner -->
                        <div v-if="isOwner" class="d-flex ga-1">
                            <!-- Your Seller's Content Menu (Visible only to sellers) -->
                            <v-menu v-if="session?.user?.role === 'seller'">
                                <template v-slot:activator="{ props }">
                                    <v-btn color="primary" v-bind="props" title="Your Content" icon="fas fa-pen-to-square">
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item v-for="(item, index) in sellerMenus?.menus" :key="index" :value="index">
                                        <NuxtLink :to="item.url">
                                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        </NuxtLink>
                                    </v-list-item>
                                </v-list>
                            </v-menu>

                            <!-- Manage Your Content Menu -->
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn color="primary" v-bind="props" title="Manage your Content" icon="fas fa-pen-to-square">
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item v-for="(item, index) in profileMenus?.menus" :key="index" :value="index">
                                        <NuxtLink :to="item.url">
                                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        </NuxtLink>
                                    </v-list-item>
                                </v-list>
                            </v-menu>

                            <!-- Settings Menu -->
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn color="primary" v-bind="props" icon="fas fa-ellipsis-vertical"
                                        title="More Options">
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item v-for="(item, index) in profileSettings?.menus" :key="index"
                                        :value="index">
                                        <NuxtLink :to="item.url">
                                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        </NuxtLink>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                </v-toolbar>

                <!-- v-tab renders a <button>: no nested v-btn (invalid HTML, breaks hydration) -->
                <v-tabs v-model="tab" align-tabs="center">
                    <v-tab v-for="(menu, index) in profileNav?.menus" :key="index" :value="menu?.value"
                        :style="profileNav?.colortext ? `color: ${profileNav.colortext} !important` : undefined">
                        {{ menu?.name }}
                    </v-tab>
                </v-tabs>

                <v-tabs-window v-model="tab" class="pa-4">

                    <!--User Notes-->
                    <v-tabs-window-item :value="profileNav?.menus?.[0]?.value">
                        <v-row v-if="profile?.notes?.length">
                            <v-col cols="12" sm="6" md="4" v-for="note in profile.notes" :key="note.id">
                                <RelatedPost :post="toPost(note)" />
                            </v-col>
                        </v-row>
                        <div class="center-text" v-else>No notes yet</div>
                    </v-tabs-window-item>

                    <!--User About Me Section-->
                    <v-tabs-window-item :value="profileNav?.menus?.[1]?.value">
                        <v-card class="mx-auto" max-width="720" flat>
                            <v-card-item>
                                <template v-slot:prepend>
                                    <v-avatar v-if="avatar" :image="avatar" size="72" />
                                    <v-icon v-else icon="fas fa-user-circle" size="72" />
                                </template>
                                <v-card-title class="text-h5">{{ profile?.name }}</v-card-title>
                                <v-card-subtitle v-if="profile?.profession || profile?.company">
                                    {{ [profile?.profession, profile?.company].filter(Boolean).join(' · ') }}
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <p v-if="profile?.description" class="profileText">{{ profile.description }}</p>
                                <p v-else class="text-medium-emphasis">
                                    {{ isOwner ? 'Add a description to your profile to tell people about yourself.' : 'No description yet.' }}
                                </p>
                                <p v-if="profile?.memberSince" class="text-medium-emphasis mt-4">
                                    Member since {{ formatDate(profile.memberSince) }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-tabs-window-item>

                    <!--User Vibez Section-->
                    <v-tabs-window-item :value="profileNav?.menus?.[2]?.value">
                        <v-row v-if="profile?.vibez?.length">
                            <v-col cols="12" sm="6" md="3" v-for="vibe in profile.vibez" :key="vibe.id">
                                <RelatedShort :short="vibe" />
                            </v-col>
                        </v-row>
                        <div class="center-text" v-else>No vibez yet</div>
                    </v-tabs-window-item>

                    <!--User Connect with me Section (linktree-style list of links)-->
                    <v-tabs-window-item :value="profileNav?.menus?.[3]?.value">
                        <div class="profileLinks mx-auto">
                            <div class="text-center mb-6">
                                <v-avatar v-if="avatar" :image="avatar" size="88" class="mb-2" />
                                <div class="text-h6">{{ profile?.name }}</div>
                                <div v-if="profile?.username" class="text-medium-emphasis">@{{ profile.username }}</div>
                            </div>

                            <template v-if="profile?.links?.length">
                                <v-btn v-for="(link, index) in profile.links" :key="index" :href="link.url"
                                    target="_blank" rel="noopener noreferrer" :prepend-icon="link.icon"
                                    class="profileLink mb-3" size="x-large" variant="outlined" rounded="xl" block>
                                    <div class="d-flex flex-column align-start text-left">
                                        <span>{{ link.title }}</span>
                                        <span v-if="link.description" class="text-caption text-medium-emphasis">
                                            {{ link.description }}</span>
                                    </div>
                                </v-btn>
                            </template>
                            <div class="center-text" v-else>No links yet</div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </template>
        </v-card>
    </v-card>
</template>

<script setup>
    // <RelatedPost> / <RelatedShort> are the social layer's related/post.vue and
    // related/short.vue, auto-registered by Nuxt. Don't import them via #social:
    // this page is in the auth layer, which elitenovels and pixanomy also build,
    // and they don't extend the social layer (no #social alias → build fails).
    import { getAssetURL, PLACEHOLDER_IMAGE_URL } from '#shared/app/utils/get-asset-url'

    const route = useRoute()
    const auth = useAuth()
    const {
        data: session
    } = await auth.getSession()
    const {
        $directus,
        $readItem
    } = useNuxtApp()

    // /u/<user id>, /u/<username> or /u/<profile slug>
    const slug = computed(() => {
        const param = route.params.slug
        return String(Array.isArray(param) ? param[0] : param || '')
    })

    const {
        data: profile,
        error
    } = await useFetch(() => `/api/profiles/${encodeURIComponent(slug.value)}`, {
        key: `profile:${slug.value}`
    })

    // related/post.vue expects a full post (author, date_created, image_url…).
    const toPost = (note) => ({
        ...note,
        description: note.excerpt,
        date_created: note.date,
        image_url: note.image,
        // Notes are filtered by creator_id = this profile; postEditMenu uses it
        // to show "edit" only to the author.
        creator_id: profile.value?.id,
        author: {
            name: profile.value?.name,
            avatar: profile.value?.image
        }
    })

    const isOwner = computed(() => !!session?.user?.id && session.user.id === profile.value?.id)
    const avatar = computed(() => getAssetURL(profile.value?.image))

    const formatDate = (value) => {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Deep query parameters to ensure relational fields ('menus') are returned fully populated
    const queryParams = {
        fields: ['*', 'menus.*']
    }

    const {
        data: profileNav
    } = await useAsyncData('profileNav', () => {
        return $directus.request($readItem('navigation', '36', queryParams))
    })

    // Start on the first tab on the server too, so SSR and hydration agree.
    const tab = ref(profileNav.value?.menus?.[0]?.value || '')

    const {
        data: profileMenus
    } = await useAsyncData('profileMenus', () => {
        return $directus.request($readItem('navigation', '146', queryParams))
    })

    const {
        data: profileSettings
    } = await useAsyncData('profileSettings', () => {
        return $directus.request($readItem('navigation', '148', queryParams))
    })

    const {
        data: sellerMenus
    } = await useAsyncData('sellerMenus', () => {
        return $directus.request($readItem('navigation', '147', queryParams))
    })

    useHead({
        title: computed(() => profile.value?.name || 'User Profile'),
    })
</script>

<style scoped>
    .profileText {
        white-space: pre-line;
    }

    .profileLinks {
        max-width: 560px;
    }

    .profileLink {
        height: auto !important;
        min-height: 56px;
        padding-top: 8px;
        padding-bottom: 8px;
        text-transform: none;
        justify-content: flex-start;
    }
</style>
