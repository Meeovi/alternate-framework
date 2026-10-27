<template>
    <div class="contentPage">
        <v-toolbar :style="`background-color: ${memoryBar?.color}; color: ${memoryBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ memoryPage?.name || 'Memories' }}
                    <v-tooltip v-if="memoryPage?.content" interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="memoryPage?.content"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
        </v-toolbar>

        <!-- Each section hides itself while it has nothing to show. -->
        <v-sheet v-if="onThisDay.length" color="transparent">
            <v-toolbar title="On this day" color="transparent" />
            <v-slide-group class="pa-4 text-center" show-arrows>
                <v-slide-group-item v-for="post in onThisDay" :key="`otd-${post.id}`">
                    <div class="ma-2 memories-slide">
                        <p class="text-caption text-medium-emphasis mb-1">{{ yearsAgo(post.date_created) }}</p>
                        <postsCard :post="post" />
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <v-sheet v-if="historyPosts.length" color="transparent">
            <v-toolbar title="Your notes" color="transparent" />
            <v-slide-group class="pa-4 text-center" show-arrows>
                <v-slide-group-item v-for="historyPost in historyPosts" :key="historyPost.id">
                    <postsCard :post="historyPost" class="ma-2 memories-slide" />
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <myRecentPurchases />

        <v-sheet v-if="comments.length" color="transparent">
            <v-toolbar title="Your comments" color="transparent" />
            <v-list lines="two" class="memories-comments" bg-color="transparent">
                <v-list-item v-for="comment in comments" :key="comment.id" :to="commentPath(comment)"
                    :title="comment.text" :subtitle="commentSubtitle(comment)" prepend-icon="fas fa-comment" />
            </v-list>
        </v-sheet>

        <watchAgain />
        <listenAgain />

        <div v-if="nothingYet" class="center-text pa-6 text-medium-emphasis">
            Your notes, purchases, comments and the things you watch and listen to will show up here.
        </div>
    </div>
</template>

<script setup>
    import { computed } from '#imports'
    import postsCard from '#social/app/components/related/post.vue'
    import myRecentPurchases from '#commerce/app/components/catalog/product/myrecentpurchases.vue'
    import watchAgain from '#social/app/components/features/playHistory/watchAgain.vue'
    import listenAgain from '#social/app/components/features/playHistory/listenAgain.vue'

    const { $directus, $readItem } = useNuxtApp()
    // useRequestFetch forwards the session cookie when this runs on the server.
    const request = useRequestFetch()
    const config = useRuntimeConfig()

    const { data: memoryPage } = await useAsyncData('memoryPage', () => {
        return $directus.request($readItem('pages', '90', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: memoryBar } = await useAsyncData('memoryBar', () => {
        return $directus.request($readItem('navigation', '90', { fields: ['*', { '*': ['*'] }] }))
    })

    // "On this day" depends on the viewer's own date (time zone), so the
    // notes load in the browser.
    const localToday = () => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    const { data: notes } = useLazyAsyncData('memories:notes', () =>
        $fetch('/api/social/memories/notes', { query: { today: localToday() } }),
    { server: false, default: () => ({ recent: [], onThisDay: [] }) })

    // The current user's own past atproto posts — the atproto match for
    // "memories" (see server/api/social/atproto/own-posts.get.ts).
    // Resolves to `{ items: [] }` (never throws) when signed out, not
    // atproto-linked, or the PDS is unreachable, so this is purely
    // additive to the Directus-backed notes above.
    const { data: atprotoHistoryPosts } = await useAsyncData('memories:atprotoOwnPosts', () => request('/api/social/atproto/own-posts'), { default: () => ({ items: [] }) })

    const onThisDay = computed(() => notes.value?.onThisDay || [])
    const historyPosts = computed(() => [
        ...(notes.value?.recent || []),
        ...(atprotoHistoryPosts.value?.items || []),
    ])

    // The member's comments live in the discussions plugin (Rocket.Chat);
    // apps without it just don't get this section.
    const discussionsApi = config.public?.meeoviDiscussions?.apiBase
    const { data: commentData } = await useAsyncData('memories:comments', () =>
        discussionsApi ? request(`${discussionsApi}/comments`).catch(() => ({ comments: [] })) : Promise.resolve({ comments: [] }),
    { default: () => ({ comments: [] }) })
    const comments = computed(() => commentData.value?.comments || [])

    // Where each discussion type's item lives.
    const ITEM_PATHS = {
        post: (id) => `/connect/note/${id}`,
        note: (id) => `/connect/note/${id}`,
        product: (id) => `/product/${id}`,
        outlet: (id) => `/outlet/${id}`,
        vibe: (id) => `/connect/vibe/${id}`,
        video: (id) => `/connect/vibe/${id}`,
        station: (id) => `/connect/station/${id}`,
        space: (id) => `/connect/space/${id}`,
        list: (id) => `/lists/list/${id}`,
    }
    const commentPath = (comment) => ITEM_PATHS[comment.type]?.(encodeURIComponent(comment.itemId)) || undefined
    const commentSubtitle = (comment) => {
        const when = comment.date ? new Date(comment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''
        const where = comment.title || `a ${comment.type === 'post' ? 'note' : comment.type}`
        return [`On ${where}`, when].filter(Boolean).join(' · ')
    }

    const yearsAgo = (date) => {
        const years = new Date().getFullYear() - new Date(date).getFullYear()
        return years === 1 ? '1 year ago today' : `${years} years ago today`
    }

    // Purchases and play history load inside their own components, so this
    // only knows about notes and comments; it's a hint, not a gate.
    const nothingYet = computed(() => !historyPosts.value.length && !comments.value.length)

    definePageMeta({
        middleware: 'auth'
    })

    useHead({
        title: 'Memories',
    })
</script>

<style scoped>
    /* A post card per slide, about the width of the old four-column grid; never wider than a phone. */
    .memories-slide {
        width: min(320px, 85vw);
    }

    .memories-comments {
        max-width: 900px;
    }
</style>
