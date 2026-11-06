<template>
    <div>
        <div class="wrap feedPost">
            <v-card class="card__wrap" height="550">
                <div class="cardWrapper">
                    <v-toolbar color="transparent" flat>
                        <v-toolbar-title>
                            <v-list style="position: relative; left: -16px;">
                                <!-- The author's profile on Meeovi (a Bluesky author's too: /u/<handle>) -->
                                <v-list-item :title="authorName" :prepend-avatar="getAssetURL(post?.author?.avatar) || undefined"
                                    :to="authorLink || undefined">
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

                    <!-- Bluesky notes: covered or blurred by their moderation labels -->
                    <ModerationCover :moderation="federated ? post?.moderation : null">
                    <div class="align-end text-white" max-height="200px" v-if="federated && federatedImage">
                        <NuxtLink :to="noteLink || undefined">
                            <img :src="federatedImage.preview || federatedImage.url" :alt="federatedImage.alt || ''" loading="lazy" class="federatedImage" />
                        </NuxtLink>
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.file_url || post?.file">
                        <MeeoviPlayer :src="getAssetURL(post?.file_url || post?.file)" :title="post?.title" />
                    </div>

                    <div class="align-end text-white" max-height="200px" v-else-if="post?.audio_url || post?.audio">
                        <MeeoviPlayer kind="audio" :src="getAssetURL(post?.audio_url || post?.audio)"
                            :title="post?.title" />
                    </div>

                    <NuxtLink v-else-if="post?.image_url || post?.image" :to="noteLink || undefined" class="align-end text-white d-block">
                        <NuxtImg provider="cloudinary" loading="lazy" :src="getAssetURL(post?.image_url || post?.image)"
                            :alt="post?.title || 'No Title'" />
                    </NuxtLink>
                    <NuxtLink v-else :to="noteLink || undefined" class="d-block">
                        <NuxtImg class="align-end text-white" max-height="200px"
                            :src="PLACEHOLDER_IMAGE_URL" :alt="post?.title || 'No Title'" cover />
                    </NuxtLink>

                    <v-card-title v-if="post?.title">
                        <NuxtLink :to="noteLink || undefined" class="noteTitle">{{ post.title }}</NuxtLink>
                    </v-card-title>

                    <!-- Clicking the text opens the note (links inside it still go where they point) -->
                    <v-card-text :class="{ noteText: !!noteLink }" @click="openNote">
                        <!-- Plain text from the network, split so hashtags link to their page; no v-html. -->
                        <p v-if="federated" class="postText">
                            <template v-for="(part, i) in withHashtags(post.text)" :key="i">
                                <NuxtLink v-if="part.tag" :to="`/connect/hashtag/${encodeURIComponent(part.tag)}`">#{{ part.tag }}</NuxtLink>
                                <template v-else>{{ part.text }}</template>
                            </template>
                        </p>
                        <p v-else v-dompurify-html="post?.content" class="postContent"></p>
                    </v-card-text>
                    </ModerationCover>

                    <v-card-actions>
                        <template v-if="federated">
                            <!-- Replies open on the note's page; likes and reposts are counts only -->
                            <v-btn variant="text" size="small" prepend-icon="fas fa-reply" :to="noteLink || undefined"
                                :title="`Replies to this note`">{{ post.replies ?? 0 }}</v-btn>
                            <span class="text-caption text-medium-emphasis noteCount" title="Reposts">
                                <v-icon icon="fas fa-retweet" size="x-small" /> {{ post.reposts ?? 0 }}
                            </span>
                            <span class="text-caption text-medium-emphasis noteCount" title="Likes">
                                <v-icon icon="fas fa-heart" size="x-small" /> {{ post.likes ?? 0 }}
                            </span>
                            <!-- Meeovi members' rating of this Bluesky/Fediverse note (rate on its page) -->
                            <MeeoviRating v-if="target" :type="target.type" :id="target.id" summary />
                        </template>

                        <template v-else>
                            <!--Rating (rate on the note page)-->
                            <MeeoviRating v-if="target" :type="target.type" :id="target.id" summary />

                            <!--Comments, on the note page-->
                            <v-btn prepend-icon="fas fa-comment" title="Comment on this note" text="Comment"
                                variant="text" class="mbr-section-btn" :to="noteLink ? `${noteLink}#postComments` : undefined"
                                :disabled="!noteLink"></v-btn>
                        </template>

                        <v-spacer></v-spacer>

                        <!--Share the note's page-->
                        <share v-if="noteLink" :url="noteLink" :title="post?.title || `Note by ${authorName}`" />
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
    import ModerationCover from '#social/app/components/blocks/ModerationCover.vue';
    import { federatedProfilePath, noteTarget, postPath } from '#social/app/utils/postPath';
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
    // The note's page on Meeovi (slug, or id for notes saved without one;
    // /connect/note/@<handle>/<key> for a Bluesky note).
    const noteLink = computed(() => postPath(post.value));
    // What its rating is stored under: a Meeovi note's post id, or a
    // Bluesky/Fediverse note's key (type `note`).
    const target = computed(() => noteTarget(post.value));

    // A note from Bluesky as the social layer's federation API returns it:
    // { id, network, text, createdAt, author: { handle, displayName,
    // avatar }, media, replies, reposts, likes }. Meeovi is its client: the
    // card links to the note and author on Meeovi, never to bsky.app. No
    // rating, comments or edit menu (those are for Meeovi notes).
    const federated = computed(() => !!post.value?.author?.handle && typeof post.value?.text === 'string')
    const authorName = computed(() => post.value?.author?.name || post.value?.author?.displayName || post.value?.author?.handle || '')
    // A Meeovi note's author is its creator (app user id → /u/<id>).
    const authorLink = computed(() => federated.value
        ? federatedProfilePath(post.value.author)
        : (post.value?.creator_id ? `/u/${encodeURIComponent(post.value.creator_id)}` : null))
    const createdAt = computed(() => post.value?.date_created || post.value?.createdAt || null)
    const federatedImage = computed(() => (post.value?.media || []).find((m) => m.type === 'image') || null)

    function openNote(event) {
        if (!noteLink.value || event.target?.closest?.('a, button')) return
        navigateTo(noteLink.value)
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

    .noteTitle {
        color: inherit;
        text-decoration: none;
    }

    .noteText {
        cursor: pointer;
    }

    .noteCount {
        margin-inline: 6px;
    }

    .postText {
        white-space: pre-line;
        overflow-wrap: anywhere;
    }
</style>