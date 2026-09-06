<template>
    <div class="contentPage">
        <v-toolbar :style="`background-color: ${memoryBar?.color}; color: ${memoryBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ memoryPage?.name }}
                    <v-tooltip interactive>
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

        <v-row class="text-center">
            <v-col cols="3" v-for="historyPost in historyPosts" :key="historyPost.id">
                <postsCard :post="historyPost" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import { ref, computed } from '#imports'
    import postsCard from '#social/app/components/related/post.vue'
    
    const { $directus, $readItem, $readItems } = useNuxtApp()

    const route = useRoute()
    const tab = ref(null);

    const { data: memoryPage } = await useAsyncData('memoryPage', () => {
        return $directus.request($readItem('pages', '90', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: memoryBar } = await useAsyncData('memoryBar', () => {
        return $directus.request($readItem('navigation', '90', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: directusHistoryPosts } = await useAsyncData('historyPosts', async () => {
        const resp = await $directus.request($readItems('posts', { fields: ['*', { '*': ['*'] }], filter: { date_created: { _lt: new Date().toISOString() } } }))
        return resp?.data || resp || []
    })

    // The current user's own past atproto posts — the atproto match for
    // "memories" (see server/api/social/atproto/own-posts.get.ts).
    // Resolves to `{ items: [] }` (never throws) when signed out, not
    // atproto-linked, or the PDS is unreachable, so this is purely
    // additive to the Directus-backed history above.
    const { data: atprotoHistoryPosts } = await useAsyncData('memories:atprotoOwnPosts', () => $fetch('/api/social/atproto/own-posts'), { default: () => ({ items: [] }) })

    const historyPosts = computed(() => [
        ...(directusHistoryPosts.value || []),
        ...(atprotoHistoryPosts.value?.items || []),
    ])

    useHead({
        title: 'Memories Center',
    })
</script>