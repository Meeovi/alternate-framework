<template>
    <div class="space-media">
        <v-row v-if="items.length" dense>
            <v-col v-for="item in items" :key="item.key" cols="6" sm="4" md="3">
                <button type="button" class="space-media__tile" :title="item.name" :aria-label="`View ${item.name}`"
                    @click="open(item)">
                    <img v-if="item.kind === 'image'" :src="item.url" :alt="item.name" loading="lazy">
                    <video v-else-if="item.kind === 'video'" :src="`${item.url}#t=0.1`" muted playsinline
                        preload="metadata" />
                    <v-icon v-else icon="fas fa-music" size="x-large" />
                    <span v-if="item.kind !== 'image'" class="space-media__badge">
                        <v-icon :icon="item.kind === 'video' ? 'fas fa-play' : 'fas fa-headphones'" size="x-small" />
                    </span>
                </button>
            </v-col>
        </v-row>

        <div v-else class="center-text">
            <p>No Media yet</p>
        </div>

        <v-dialog v-model="viewer" max-width="1100">
            <v-card v-if="current">
                <v-card-title class="d-flex align-center ga-2">
                    <span class="text-truncate">{{ current.name }}</span>
                    <v-spacer />
                    <v-btn icon="fas fa-xmark" variant="text" size="small" aria-label="Close" @click="viewer = false" />
                </v-card-title>
                <div class="space-media__viewer">
                    <img v-if="current.kind === 'image'" :src="current.url" :alt="current.name">
                    <MeeoviPlayer v-else :src="current.url" :kind="current.kind" :title="current.name" />
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { getAssetURL } from '#shared/app/utils/get-asset-url'

    /**
     * The space's media: the photos, videos and audio attached to its posts
     * (posts.image_url / video_url / audio_url, uploaded to Pixanomy), plus
     * any files linked to the space itself (spaces.media → directus_files).
     *
     *   <MediaTab :space="space" />
     */
    const props = defineProps({
        space: {
            type: Object,
            default: null,
        },
    })

    const kindOfType = (type) => {
        const t = String(type || '').toLowerCase()
        if (t.startsWith('video/')) return 'video'
        if (t.startsWith('audio/')) return 'audio'
        return 'image'
    }

    const items = computed(() => {
        const out = []
        const seen = new Set()
        const add = (key, url, kind, name) => {
            if (!url || seen.has(url)) return
            seen.add(url)
            out.push({ key, url, kind, name })
        }

        for (const row of props.space?.posts ?? []) {
            const post = row?.posts_id
            if (!post || ['draft', 'archived'].includes(post.status)) continue
            const name = post.title || String(post.content || '').replace(/<[^>]*>/g, '').slice(0, 60) || 'Post'
            const image = post.image_url || post.image
            if (image) add(`post-${post.id}-image`, getAssetURL(image), 'image', name)
            if (post.video_url) add(`post-${post.id}-video`, getAssetURL(post.video_url), 'video', name)
            const audio = post.audio_url || post.audio
            if (audio) add(`post-${post.id}-audio`, getAssetURL(audio), 'audio', name)
        }

        for (const row of props.space?.media ?? []) {
            const file = row?.directus_files_id
            const id = typeof file === 'object' ? file?.id : file
            if (!id) continue
            add(`file-${id}`, getAssetURL(id), kindOfType(file?.type),
                file?.title || file?.filename_download || 'Media')
        }

        return out
    })

    const viewer = ref(false)
    const current = ref(null)
    function open(item) {
        current.value = item
        viewer.value = true
    }
</script>

<style scoped>
    .space-media__tile {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1;
        overflow: hidden;
        border: 0;
        border-radius: 8px;
        padding: 0;
        cursor: pointer;
        background: rgba(var(--v-theme-on-surface), 0.08);
    }

    .space-media__tile img,
    .space-media__tile video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .space-media__tile:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 2px;
    }

    .space-media__badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        color: #fff;
        background: rgba(0, 0, 0, 0.6);
    }

    .space-media__viewer {
        display: flex;
        justify-content: center;
        padding: 0 16px 16px;
    }

    .space-media__viewer img {
        max-width: 100%;
        max-height: 75vh;
        object-fit: contain;
    }

    .space-media__viewer > :deep(:not(img)) {
        width: 100%;
    }
</style>
