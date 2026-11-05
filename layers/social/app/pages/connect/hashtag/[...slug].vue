<template>
    <div>
        <section data-bs-version="5.1" class="header3 cid-v0mS4gj9NP" id="header3-e">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="left-side col-12 col-md">
                        <h1 class="mbr-section-title mbr-fonts-style l1 display-5">#{{ tag }}</h1>
                        <div class="line"></div>
                        <p class="mbr-section-subtitle mbr-fonts-style l2 display-4">
                            <NuxtLink to="/" class="text-success">Home</NuxtLink>
                            &nbsp;/
                            <NuxtLink to="/connect/hashtags" class="text-success">Hashtags</NuxtLink>&nbsp;/ #{{ tag }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <v-container v-if="products.length" class="hashtag-products">
            <h2 class="text-h6 mb-2">Products tagged #{{ tag }}</h2>
            <v-row>
                <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
                    <productCard :product="product" />
                </v-col>
            </v-row>
        </v-container>

        <v-container class="hashtag-posts">
            <h2 v-if="products.length && posts.length" class="text-h6 mb-2">Notes tagged #{{ tag }}</h2>
            <div v-if="pending && !posts.length" class="d-flex justify-center pa-8">
                <v-progress-circular indeterminate />
            </div>

            <v-alert v-else-if="error && !posts.length" type="warning" variant="tonal">
                Notes aren't available right now. Please try again later.
            </v-alert>

            <h2 v-else-if="!posts.length" class="text-center text-h6 pa-8">No notes with <b>#{{ tag }}</b> yet.</h2>

            <v-row v-else>
                <v-col v-for="post in posts" :key="post.id" cols="12" sm="6" md="4" lg="3">
                    <postCard :post="post" />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import productCard from '#commerce/app/components/catalog/product/productCard.vue'
import postCard from '#social/app/components/related/post.vue'

/**
 * Posts with this hashtag from atproto (Bluesky), through the social layer's
 * network-neutral federation API:
 *
 *   GET /api/social/federation/atproto/search?q=%23<tag>&limit=40
 *     → { posts: FederatedPost[] }
 *
 * That route (layers/social/server/api/social/federation/[network]/search.get.ts)
 * looks up the 'atproto' network that @mframework/meeovi-atproto registers and
 * calls its searchPosts(), which runs app.bsky.feed.searchPosts with the
 * plugin's service account (client.ts). A "#tag" query matches that hashtag.
 * The same call works for any registered network (e.g. 'activitypub').
 * Each one is shown as a note with the social layer's note card
 * (related/post.vue), which links it and its author to their pages on
 * Meeovi (Meeovi is a Bluesky client — nothing links out to bsky.app; the
 * note's page credits the original). Fediverse notes are added the same way.
 *
 * Server code can use the plugin's client directly instead:
 *   import { useAtprotoClient } from '@mframework/meeovi-atproto/client'
 *   const { posts } = await useAtprotoClient().searchPosts({ query: '#travel', limit: 25 })
 *
 * Products come from Directus: published products linked to the tag
 * (products.tags → products_tags), matched on the tag's slug or name.
 */

type FederatedPost = {
    id: string
    network?: string
    url?: string
    text: string
    createdAt: string
    author: { handle: string, displayName?: string, avatar?: string, url?: string }
    media?: { url: string, preview?: string, alt?: string, type: string }[]
    replies?: number
    reposts?: number
    likes?: number
}

definePageMeta({ middleware: 'auth' })

const route = useRoute()
// /connect/hashtag/travel → "travel" (a leading # is tolerated).
const tag = computed(() => {
    const raw = Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || '')
    return decodeURIComponent(raw).replace(/^#+/, '').trim()
})

const { data, pending, error } = await useFetch<{ posts: FederatedPost[] }>('/api/social/federation/atproto/search', {
    query: { q: computed(() => `#${tag.value}`), limit: 40 },
    key: computed(() => `hashtag:atproto:${tag.value.toLowerCase()}`),
    default: () => ({ posts: [] }),
})
// The Fediverse too (a hashtag timeline on the configured instance). Not
// awaited: a slow instance doesn't hold up the page. Both networks' notes
// open on Meeovi and credit their original on the note's page.
const { data: fediverse } = useFetch<{ posts: FederatedPost[] }>('/api/social/federation/activitypub/search', {
    query: { q: computed(() => `#${tag.value}`), limit: 20 },
    key: computed(() => `hashtag:activitypub:${tag.value.toLowerCase()}`),
    default: () => ({ posts: [] }),
    lazy: true,
})
const posts = computed(() => [...(data.value?.posts ?? []), ...(fediverse.value?.posts ?? [])]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)))

const { $directus, $readItems } = useNuxtApp()
const { data: productRows } = await useAsyncData(
    () => `hashtag:products:${tag.value.toLowerCase()}`,
    () => $directus.request($readItems('products', {
        filter: {
            status: { _eq: 'published' },
            _or: [
                { tags: { tags_id: { slug: { _eq: tag.value.toLowerCase() } } } },
                { tags: { tags_id: { name: { _eq: tag.value } } } },
            ],
        },
        fields: ['*', 'image.*', 'shops.shops_id.name', 'shops.shops_id.slug'],
        sort: ['-id'],
        limit: 24,
    })).catch(() => []),
    { default: () => [], watch: [tag] },
)
const products = computed(() => (productRows.value || []) as Record<string, any>[])

useHead({ title: computed(() => `#${tag.value}`) })
</script>
