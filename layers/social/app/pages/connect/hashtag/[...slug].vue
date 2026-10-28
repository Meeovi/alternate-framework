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
            <h2 v-if="products.length && posts.length" class="text-h6 mb-2">Posts on Bluesky</h2>
            <div v-if="pending && !posts.length" class="d-flex justify-center pa-8">
                <v-progress-circular indeterminate />
            </div>

            <v-alert v-else-if="error" type="warning" variant="tonal">
                Posts from Bluesky aren't available right now. Please try again later.
            </v-alert>

            <h2 v-else-if="!posts.length" class="text-center text-h6 pa-8">No posts on Bluesky with <b>#{{ tag }}</b> yet.</h2>

            <v-row v-else>
                <v-col v-for="post in posts" :key="post.id" cols="12" md="6" lg="4">
                    <v-card class="hashtag-post h-100" variant="outlined">
                        <v-card-item>
                            <template #prepend>
                                <v-avatar size="40" :image="post.author.avatar" color="grey-lighten-2">
                                    <span v-if="!post.author.avatar">{{ initial(post.author) }}</span>
                                </v-avatar>
                            </template>
                            <v-card-title class="text-body-1 font-weight-bold">
                                <a :href="post.author.url" target="_blank" rel="noopener">{{ post.author.displayName || post.author.handle }}</a>
                            </v-card-title>
                            <v-card-subtitle>@{{ post.author.handle }} · {{ when(post.createdAt) }}</v-card-subtitle>
                        </v-card-item>

                        <v-card-text>
                            <!-- Plain text from the network, split so hashtags link here; no v-html. -->
                            <p class="hashtag-post__text">
                                <template v-for="(part, i) in withHashtags(post.text)" :key="i">
                                    <NuxtLink v-if="part.tag" :to="`/connect/hashtag/${encodeURIComponent(part.tag)}`">#{{ part.tag }}</NuxtLink>
                                    <template v-else>{{ part.text }}</template>
                                </template>
                            </p>
                            <div v-if="images(post).length" class="hashtag-post__media">
                                <img v-for="media in images(post).slice(0, 4)" :key="media.url" :src="media.preview || media.url"
                                    :alt="media.alt || ''" loading="lazy" />
                            </div>
                        </v-card-text>

                        <v-card-actions>
                            <span class="text-caption text-medium-emphasis">
                                <v-icon icon="fas fa-reply" size="x-small" /> {{ post.replies ?? 0 }}
                                &nbsp;<v-icon icon="fas fa-retweet" size="x-small" /> {{ post.reposts ?? 0 }}
                                &nbsp;<v-icon icon="fas fa-heart" size="x-small" /> {{ post.likes ?? 0 }}
                            </span>
                            <v-spacer />
                            <v-btn v-if="post.url" :href="post.url" target="_blank" rel="noopener" size="small" variant="text">View on Bluesky</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import productCard from '#commerce/app/components/catalog/product/productCard.vue'

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
const posts = computed(() => data.value?.posts ?? [])

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

const images = (post: FederatedPost) => (post.media || []).filter((m) => m.type === 'image')
const initial = (author: FederatedPost['author']) => (author.displayName || author.handle || '?').charAt(0).toUpperCase()
const when = (iso: string) => {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "Fly #Travel now" → [{ text: 'Fly ' }, { tag: 'Travel' }, { text: ' now' }] */
function withHashtags(text: string): { text?: string, tag?: string }[] {
    const parts: { text?: string, tag?: string }[] = []
    let last = 0
    for (const match of text.matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)) {
        const start = match.index! + match[1]!.length
        if (start > last) parts.push({ text: text.slice(last, start) })
        parts.push({ tag: match[2] })
        last = start + 1 + match[2]!.length
    }
    if (last < text.length) parts.push({ text: text.slice(last) })
    return parts
}

useHead({ title: computed(() => `#${tag.value}`) })
</script>

<style scoped>
.hashtag-post__text {
    white-space: pre-line;
    overflow-wrap: anywhere;
}

.hashtag-post__media {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px;
    margin-top: 8px;
}

.hashtag-post__media img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 6px;
}
</style>
