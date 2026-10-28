<template>
    <div>
        <div class="wrap feedPost">
            <v-card class="card__wrap" height="550">
                <div class="cardWrapper">
                    <v-toolbar color="transparent" flat>
                        <v-toolbar-title>
                            <v-list style="position: relative; left: -16px;">
                                <v-list-item :title="authorName" :prepend-avatar="getAssetURL(post?.author?.avatar) || undefined"
                                    :href="federated ? post.author?.url : undefined" :target="federated ? '_blank' : undefined"
                                    :rel="federated ? 'noopener' : undefined">
                                    <template #subtitle>
                                        <span v-if="federated">@{{ post.author.handle }} · </span>
                                        <TimeAgo v-if="createdAt" :time="createdAt" :label="null" size="small" />
                                        <span v-else>Unknown date</span>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-toolbar-title>


                        <editMenu v-if="!federated" :post="post" />
                    </v-toolbar>

                    <div class="align-end text-white" max-height="200px" v-if="federated && federatedImage">
                        <img :src="federatedImage.preview || federatedImage.url" :alt="federatedImage.alt || ''" loading="lazy" class="federatedImage" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.file_url || post?.file">
                        <MeeoviPlayer :src="getAssetURL(post?.file_url || post?.file)" :title="post?.title" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.audio_url || post?.audio">
                        <MeeoviPlayer kind="audio" :src="getAssetURL(post?.audio_url || post?.audio)"
                            :title="post?.title" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.image_url || post?.image">
                        <NuxtImg provider="cloudinary" loading="lazy" :src="getAssetURL(post?.image_url || post?.image)"
                            :alt="post?.title || 'No Title'" />
                    </div>
                    <NuxtImg v-else class="align-end text-white" max-height="200px"
                        :src="PLACEHOLDER_IMAGE_URL" :alt="post?.title || 'No Title'" cover />

                    <v-card-title>{{ post?.title }}</v-card-title>

                    <v-card-text>
                        <!-- Plain text from the network, split so hashtags link to their page; no v-html. -->
                        <p v-if="federated" class="postText">
                            <template v-for="(part, i) in withHashtags(post.text)" :key="i">
                                <NuxtLink v-if="part.tag" :to="`/connect/hashtag/${encodeURIComponent(part.tag)}`">#{{ part.tag }}</NuxtLink>
                                <template v-else>{{ part.text }}</template>
                            </template>
                        </p>
                        <p v-else v-dompurify-html="post?.content" class="postContent"></p>
                    </v-card-text>

                    <v-card-actions v-if="federated">
                        <span class="text-caption text-medium-emphasis">
                            <v-icon icon="fas fa-reply" size="x-small" /> {{ post.replies ?? 0 }}
                            &nbsp;<v-icon icon="fas fa-retweet" size="x-small" /> {{ post.reposts ?? 0 }}
                            &nbsp;<v-icon icon="fas fa-heart" size="x-small" /> {{ post.likes ?? 0 }}
                        </span>
                        <v-spacer />
                        <v-btn v-if="post.url" :href="post.url" target="_blank" rel="noopener" size="small" variant="text">{{ originalLabel }}</v-btn>
                    </v-card-actions>

                    <v-card-actions v-else>
                        <!--Rating (rate on the post page)-->
                        <MeeoviRating v-if="post?.id" type="post" :id="post.id" summary />

                        <!--Comments-->
                        <v-btn variant="text" class="mbr-section-btn">
                            <v-btn prepend-icon="fas fa-comment" title="Comment on this post" text="Comment"
                                variant="text" :to="noteLink" :disabled="!noteLink"></v-btn>
                        </v-btn>

                        <!--<v-btn variant="text" class="mbr-section-btn">
                            <repost :post="post" />
                        </v-btn>-->

                        <v-spacer></v-spacer>

                        <!--Share-->
                        <v-btn variant="text">
                            <share />
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </div>
    </div>
</template>

<script setup>
    import {
        getAssetURL,
        PLACEHOLDER_IMAGE_URL
    } from '#shared/app/utils/get-asset-url'
    import editMenu from '#social/app/components/blocks/postEditMenu.vue';
    import share from '#social/app/components/blocks/share.vue';
    //import repost from '#social/app/components/blocks/repost/repost.vue';
    import TimeAgo from '#social/app/components/blocks/useTimeAgo.vue';
    import { postPath } from '#social/app/utils/postPath';
    import {
        computed,
        toRef
    } from '#imports'

    const {
        $sdk
    } = useNuxtApp()

    const props = defineProps({
        post: {
            type: Object,
            required: true,
        },
    });
    const post = toRef(props, 'post');
    // The post's page (slug, or id for posts saved without one).
    const noteLink = computed(() => postPath(post.value));

    // A post from another network (Bluesky, the Fediverse) as the social
    // layer's federation API returns it: { id, url, text, createdAt,
    // author: { handle, displayName, avatar, url }, media, replies, reposts,
    // likes }. Shown read-only — no rating, comments or edit menu here.
    const federated = computed(() => !!post.value?.author?.handle && typeof post.value?.text === 'string')
    const authorName = computed(() => post.value?.author?.name || post.value?.author?.displayName || post.value?.author?.handle || '')
    const createdAt = computed(() => post.value?.date_created || post.value?.createdAt || null)
    const federatedImage = computed(() => (post.value?.media || []).find((m) => m.type === 'image') || null)
    const originalLabel = computed(() => /bsky\.app/.test(post.value?.url || '') ? 'View on Bluesky' : 'View original')

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

    const fileNameOf = (file) => String(file?.filename_download || file?.title || file?.type || getAssetURL(
            file) || '')
        .toLowerCase()
    const matchesExtension = (file, extensions) => extensions.some((ext) => fileNameOf(file).endsWith(ext))
</script>

<style scoped>
    .card__wrap {
        max-width: 300px;
    }

    .align-end {
        min-height: 200px;
        max-height: 200px;
    }

    .cardWrapper img {
        max-height: 200px;
    }

    .federatedImage {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    .postText {
        white-space: pre-line;
        overflow-wrap: anywhere;
    }
</style>