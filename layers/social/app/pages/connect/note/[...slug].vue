<template>
    <div class="contentPage">
        <section data-bs-version="5.1" class="start article2 cid-v4JqojhMIl" id="article02-b9"
            data-sortbtn="btn-primary">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-12 col-lg-6 image-wrapper">
                        <div v-if="federatedImage">
                            <img class="w-100 federatedImage" :src="federatedImage.url" :alt="federatedImage.alt || ''" />
                        </div>

                        <div v-else-if="post?.file_url || post?.file">
                            <MeeoviPlayer :src="getAssetURL(post?.file_url || post?.file)" :poster="getImageURL(post?.image_url || post?.image)" :title="post?.title" />
                        </div>

                        <div v-else-if="post?.audio_url || post?.audio">
                            <MeeoviPlayer kind="audio" :src="getAssetURL(post?.audio_url || post?.audio)" :title="post?.title" />
                        </div>

                        <div v-else-if="post?.image_url || post?.image">
                            <NuxtImg provider="cloudinary" loading="lazy" :src="getAssetURL(post?.image_url || post?.image)"
                                :alt="post?.title || 'No Title'" />
                        </div>

                        <div v-else>
                            <NuxtImg provider="cloudinary" class="w-100" :src="PLACEHOLDER_IMAGE_URL"
                                :alt="post?.title || 'No Title'" />
                        </div>

                    </div>
                    <div class="col-12 col-md-12 col-lg">
                        <div class="text-wrapper align-left">
                            <h1 class="mbr-section-title mbr-fonts-style text-black mb-4 display-2">
                                <strong class="auto-text">{{ post?.title || (federated ? `Note by ${authorName}` : '') }}</strong>
                            </h1>

                            <div v-if="!federated" class="row">
                                <div class="col-6 d-flex align-center">
                                    <MeeoviRating v-if="post?.id" type="post" :id="post.id" />
                                    <reactions class="postReactions" />
                                </div>

                                <div class="col-6">
                                    <flag class="postFlag" :report="post?.id" />
                                </div>
                            </div>

                            <!-- A Bluesky note's plain text, split so hashtags link to their page; no v-html. -->
                            <p v-if="federated" class="mbr-text align-left mbr-fonts-style mb-4 display-7 auto-text noteText">
                                <template v-for="(part, i) in withHashtags(post.text)" :key="i">
                                    <NuxtLink v-if="part.tag" :to="`/connect/hashtag/${encodeURIComponent(part.tag)}`">#{{ part.tag }}</NuxtLink>
                                    <template v-else>{{ part.text }}</template>
                                </template>
                            </p>
                            <p v-else class="mbr-text align-left mbr-fonts-style mb-4 display-7 auto-text">{{ post?.content }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section data-bs-version="5.1" class="social02 cid-v4JqDUvsT0 auto-text" id="social02-ba"
            data-sortbtn="btn-primary">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 content-head">
                        <div class="mb-5">
                            <h6 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                                <strong>Details</strong>
                            </h6>

                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-smile-face mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Author</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    <component :is="authorLink ? NuxtLink : 'span'" :to="authorLink || undefined" class="d-inline-flex align-center ga-2">
                                        <v-avatar v-if="hasAsset(post?.author?.avatar)" :image="getAssetURL(post?.author?.avatar)"></v-avatar>
                                        <v-icon v-else icon="fas fa-user-circle" size="41" />
                                        <span>{{ authorName }}</span>
                                        <span v-if="federated" class="text-medium-emphasis">@{{ post.author.handle }}</span>
                                    </component>
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-right mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Type</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    {{ federated ? 'Bluesky note' : (post?.type || 'Notes') }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-bookmark mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Published</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    {{ createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date' }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-bootstrap mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Topics</strong>
                                </h4>
                                <template v-if="federated">
                                    <h5 v-for="tag in post?.hashtags || []" :key="tag" class="card-text mbr-fonts-style display-7">
                                        <NuxtLink :to="`/connect/hashtag/${encodeURIComponent(tag)}`">#{{ tag }}</NuxtLink>
                                    </h5>
                                </template>
                                <h5 v-else class="card-text mbr-fonts-style display-7" v-for="tags in post?.tags">
                                    <tagCard :tag="tags.tags_id" />
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-growing-chart mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>{{ federated ? 'Activity' : 'Views' }}</strong>
                                </h4>
                                <h5 v-if="federated" class="card-text mbr-fonts-style display-7">
                                    {{ post.replies ?? 0 }} replies · {{ post.reposts ?? 0 }} reposts · {{ post.likes ?? 0 }} likes
                                </h5>
                                <h5 v-else class="card-text mbr-fonts-style display-7">
                                    {{ Number(post?.views || 0).toLocaleString() }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-6 col-lg-4">
                        <div class="item-wrapper">
                            <span class="mbr-iconfont m-auto mobi-mbri-share mobi-mbri"></span>
                            <div class="card-box">
                                <h4 class="card-title mbr-fonts-style mb-1 display-7">
                                    <strong>Share</strong>
                                </h4>
                                <h5 class="card-text mbr-fonts-style display-7">
                                    <share :title="post?.title || (federated ? `Note by ${authorName}` : null)" />
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="col-sm-6 col-lg-12 feedPost">
            <v-divider></v-divider>

            <!-- A Bluesky note's replies, as notes; a Meeovi note's comments -->
            <div v-if="federated" id="postComments" class="container py-6">
                <h2 class="text-h6 mb-4">Replies</h2>
                <v-row v-if="replies.length">
                    <v-col v-for="reply in replies" :key="reply.id" cols="12" sm="6" md="4" lg="3">
                        <postCard :post="reply" />
                    </v-col>
                </v-row>
                <p v-else class="text-medium-emphasis">No replies yet.</p>
            </div>
            <div v-else id="postComments"><MeeoviDiscussion v-if="post?.id" type="post" :id="post.id" :title="post?.title" /></div>
        </div>
    </div>
</template>

<script setup>
    import { getAssetURL, getImageURL, hasAsset, PLACEHOLDER_IMAGE_URL } from '#shared/app/utils/get-asset-url'
    import tagCard from '#social/app/components/related/tag.vue';
    import flag from '#social/app/components/blocks/flag.vue';
    import reactions from '#social/app/components/blocks/reactions.vue';
    import share from '#social/app/components/blocks/share.vue';
    import postCard from '#social/app/components/related/post.vue';
    import { federatedProfilePath } from '#social/app/utils/postPath';
    import {
        computed,
        onMounted,
        ref,
        resolveComponent,
        watch
    } from '#imports'

    const NuxtLink = resolveComponent('NuxtLink')

    const {
        $directus,
        $readItems
    } = useNuxtApp()
    const route = useRoute()

    // /connect/note/@<handle>/<key> is a note from Bluesky: Meeovi shows it
    // like its own notes (through the social layer's federation API), with
    // its replies, and links its author to their profile here.
    const routeKey = computed(() => {
        const param = route.params.slug
        return String(Array.isArray(param) ? param.join('/') : param || '')
    })
    const federatedRef = computed(() => {
        const match = /^@([^/]+)\/([^/]+)$/.exec(routeKey.value)
        return match ? { author: decodeURIComponent(match[1]), key: decodeURIComponent(match[2]) } : null
    })

    const {
        data: thread
    } = await useAsyncData(() => `note-thread:${routeKey.value}`, () => federatedRef.value
        ? $fetch('/api/social/federation/atproto/thread', { query: federatedRef.value }).catch(() => null)
        : Promise.resolve(null), {
        watch: [routeKey]
    })

    const {
        data: directusPost
    } = await useAsyncData('post', async () => {
        if (federatedRef.value) return null
        // /connect/note/<slug>, or /connect/note/<id> for notes saved
        // without a slug (see utils/postPath.ts).
        const key = routeKey.value
        const resp = await $directus.request($readItems('posts', {
            filter: /^\d+$/.test(key)
                ? { _or: [{ slug: { _eq: key } }, { id: { _eq: Number(key) } }] }
                : { slug: { _eq: key } },
            fields: ['*', 'author.*', 'image.*', 'file.*', 'audio.*'],
            limit: 1
        }))
        return resp?.[0] || null
    }, {
        watch: [() => route.params.slug]
    })

    const post = computed({
        get: () => thread.value?.post || directusPost.value,
        set: (value) => { directusPost.value = value },
    })
    const replies = computed(() => thread.value?.replies || [])
    const federated = computed(() => !!thread.value?.post)
    const federatedImage = computed(() => (federated.value ? post.value?.media || [] : []).find((m) => m.type === 'image') || null)
    const authorName = computed(() => post.value?.author?.displayName || post.value?.author?.name || post.value?.author?.handle || '')
    const createdAt = computed(() => post.value?.createdAt || post.value?.date_created || null)
    const authorLink = computed(() => federated.value
        ? federatedProfilePath(post.value.author)
        : (post.value?.creator_id ? `/u/${encodeURIComponent(post.value.creator_id)}` : null))

    if (federatedRef.value && !thread.value) {
        throw createError({ statusCode: 404, statusMessage: 'Note not found', fatal: true })
    }

    /** "Fly #Travel now" → [{ text: 'Fly ' }, { tag: 'Travel' }, { text: ' now' }] */
    function withHashtags(text) {
        const parts = []
        let last = 0
        for (const match of String(text || '').matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)) {
            const start = match.index + match[1].length
            if (start > last) parts.push({ text: text.slice(last, start) })
            parts.push({ tag: match[2] })
            last = start + 1 + match[2].length
        }
        if (last < String(text || '').length) parts.push({ text: text.slice(last) })
        return parts
    }

    // Cusdis comment properties derived from this page's data
    const config = useRuntimeConfig ? useRuntimeConfig() : {}
    const pageUrl = ref('')
    onMounted(() => {
        if (process.client) pageUrl.value = window.location.href
    })

    // Count this view (once per person per day; a creator's own views don't
    // count) and show the current total.
    async function countView() {
        if (federated.value || !post.value?.id) return
        const res = await $fetch(`/api/social/views/post/${post.value.id}`, { method: 'POST' }).catch(() => null)
        if (res && post.value) post.value = { ...post.value, views: res.views }
    }
    onMounted(countView)
    watch(() => post.value?.id, (id, old) => { if (id && old && id !== old) countView() })
    
    definePageMeta({
        middleware: 'auth'
    })

    useHead({
        title: computed(() => post.value?.title || (federated.value ? `Note by ${authorName.value}` : 'Note')),
    })
</script>

<style scoped>
    .noteText {
        white-space: pre-line;
        overflow-wrap: anywhere;
    }

    .federatedImage {
        border-radius: 8px;
        object-fit: cover;
    }
</style>
