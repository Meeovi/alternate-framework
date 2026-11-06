<template>
    <v-container class="py-10">
        <v-card elevation="2" class="pa-6">
            <v-card-title>
                <v-row align="center" justify="space-between">
                    <span>🔥 Vibez Feed</span>
                    <v-switch v-model="showMine" label="Show My Videos" inset color="primary" />
                </v-row>
            </v-card-title>

            <!-- Search, sort and filter the videos (kept in the page address) -->
            <SortFilterBar :controller="videoControls" :count="filteredVideos.length" :total="videos.length"
                noun="videos" search-label="Search videos" class="mb-4" />

                <v-divider class="my-6" />
                <h2 class="text-h6 mb-4">🔴 Live Now</h2>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-card>
                            <v-img src="https://your-owncast-domain.com/preview.jpg" height="200px" cover />
                            <v-card-title>Live Stream</v-card-title>
                            <v-card-actions>
                                <v-btn href="https://your-owncast-domain.com" target="_blank" color="red">
                                    Watch Live
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <v-divider class="my-6" />
                <h2 class="text-h6 mb-4">🎥 Videos</h2>
                <v-row>
                    <v-col v-for="video in filteredVideos" :key="video.id" cols="12" sm="6" md="4">
                        <v-card @click="trackView(video.id)">
                            <v-card-title>{{ video.title }}</v-card-title>
                            <v-img :src="getThumbnail(video)" height="200px" cover />
                            <v-card class="mt-2" variant="outlined" density="compact">
                                {{ video.visibility === 'public' ? '🌍 Public' : '🔒 Private' }} •
                                {{ formatDuration(video.duration) }} • 👁️ {{ video.view_count || 0 }}
                            </v-card>
                            <div class="mt-2">
                                <v-chip v-for="tag in video.tags" :key="tag.id" class="ma-1" size="small"
                                    color="primary" variant="outlined">
                                    {{ tag.name }}
                                </v-chip>

                                <v-btn icon @click.stop="toggleLike(video)" :color="video.liked ? 'red' : 'grey'"
                                    class="ml-2">
                                    <v-icon>{{ video.liked ? 'fas fa-heart' : 'far fa-heart' }}</v-icon>
                                </v-btn>
                                <span>{{ video.reaction_count || 0 }}</span>

                                <v-btn icon @click.stop="openComments(video)" class="ml-2">
                                    <v-icon>far fa-comment</v-icon>
                                </v-btn>
                                <span>{{ video.comment_count || 0 }}</span>
                            </div>
                            <template #footer>
                                <v-btn :href="getVideoUrl(video)" target="_blank" color="primary"
                                    :disabled="video.status !== 'ready'">
                                    Watch
                                </v-btn>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>

                <v-alert v-if="filteredVideos.length === 0" type="info" class="mt-6">
                    No videos match your filters.
                </v-alert>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, watchEffect } from '#imports'
import SortFilterBar from '#shared/app/components/SortFilterBar.vue'
import { byDate, byNumber, byText, useSortFilter } from '#shared/app/composables/useSortFilter'

const { $sdk, $directus, $readItem, $readItems, $createItem, $deleteItem } = useNuxtApp()
const config = useRuntimeConfig()
const { user, fetchSession } = useAuth()
await fetchSession()

const readItems = (collection, opts) => $directus.request($readItems(collection, opts))
const createItem = (collection, data) => $directus.request($createItem(collection, data))
const deleteItem = (collection, id) => $directus.request($deleteItem(collection, id))

const getCurrentUserId = () => user.value?.id || user.value?.userId || null

const videos = ref([])
const tags = ref([])
const showMine = ref(false)

async function fetchTags() {
    try {
        const data = await $directus.request($readItems('tags', { fields: ['id', 'name'] }))
        tags.value = data?.data || data || []
    } catch (e) {
        console.error('Failed to fetch tags', e)
    }
}

async function fetchVideos() {
    try {
        const filter = {}
        const currentUserId = getCurrentUserId()
        if (showMine.value && currentUserId) {
            filter.user_id = { _eq: currentUserId }
        } else {
            filter.visibility = { _eq: 'public' }
        }

        // Newest first; the bar re-sorts in the page.
        const sort = ['-date_created']

        // tags is the videos_tags junction: `tags.id`/`tags.name` were refused
        // by Directus (no `name` on the junction), so no video ever loaded.
        const resp = await $directus.request($readItems('videos', { filter, sort, fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name'] }))
        const data = resp?.data || resp || []
        videos.value = (data || []).map((v) => ({
            ...v,
            tags: (v.tags || []).map((row) => row?.tags_id).filter((tag) => tag?.id),
            liked: false,
            reaction_count: v.reaction_count || 0,
            comment_count: v.comment_count || 0,
        }))

        // fetch counts and user reactions per video
        await Promise.all(
            videos.value.map(async (v) => {
                try {
                    const resp = await $directus.request($readItems('reactions', { filter: { video_id: { _eq: v.id } } }))
                    v.reaction_count = resp?.data?.length || resp?.length || 0

                    if (currentUserId) {
                        const me = await $directus.request($readItems('reactions', { filter: { video_id: { _eq: v.id }, user_id: { _eq: currentUserId } }, limit: 1 }))
                        const meData = me?.data || me || []
                        v.liked = (meData && meData.length > 0) || false
                    }

                    const commentsResp = await $directus.request($readItems('comments', { filter: { video_id: { _eq: v.id } } }))
                    v.comment_count = commentsResp?.data?.length || commentsResp?.length || 0
                } catch (e) {
                    // non-fatal per-video
                }
            })
        )
    } catch (e) {
        console.error('Failed to fetch videos', e)
        videos.value = []
    }
}

watchEffect(() => {
    // run fetches when filters change
    fetchTags()
    fetchVideos()
})

const videoName = (video) => video?.title || video?.name || ''
const videoControls = useSortFilter({
    id: 'vibez',
    sorts: [
        { value: 'newest', title: 'Newest', compare: byDate((v) => v?.date_created) },
        { value: 'oldest', title: 'Oldest', compare: byDate((v) => v?.date_created, false) },
        { value: 'views', title: 'Most viewed', compare: byNumber((v) => v?.view_count ?? 0, true) },
        { value: 'likes', title: 'Most liked', compare: byNumber((v) => v?.reaction_count ?? 0, true) },
        { value: 'comments', title: 'Most comments', compare: byNumber((v) => v?.comment_count ?? 0, true) },
        { value: 'name', title: 'Name: A to Z', compare: byText(videoName) },
    ],
    search: (v) => [videoName(v), v?.description, ...(v?.tags || []).map((t) => t?.name)].join(' '),
    filters: [{
        key: 'tags',
        title: 'Tags',
        multiple: true,
        // Only tags some loaded video has.
        options: () => (tags.value || [])
            .filter((tag) => videos.value.some((v) => v.tags?.some((t) => t.id === tag.id)))
            .map((tag) => ({ value: String(tag.id), title: tag.name })),
        match: (v, value) => !!v.tags?.some((t) => String(t.id) === value),
    }, {
        key: 'visibility',
        title: 'Visibility',
        options: [{ value: 'public', title: 'Public' }, { value: 'private', title: 'Private' }],
        match: (v, value) => (v?.visibility === 'public' ? 'public' : 'private') === value,
    }],
})
const filteredVideos = computed(() => videoControls.apply(videos.value))

function getVideoUrl(video) {
    return `https://${config.public.minioEndpoint}/vibez-transcoded/${video.minio_key}`
}

function getThumbnail(video) {
    return `https://${config.public.minioEndpoint}/thumbnails/${video.id}.jpg`
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Once per person per day; a creator's own views don't count.
async function trackView(videoId) {
    await $fetch(`/api/social/views/shorts/${videoId}`, { method: 'POST' }).catch(() => null)
}

async function toggleLike(video) {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return

    try {
        const existing = await $directus.request($readItems('reactions', { filter: { video_id: { _eq: video.id }, user_id: { _eq: currentUserId } }, limit: 1 }))
        const existingId = (existing?.data?.[0]?.id) || (existing?.[0]?.id) || null

        if (existingId) {
            await deleteItem('reactions', existingId)
            video.liked = false
            video.reaction_count = Math.max(0, (video.reaction_count || 0) - 1)
        } else {
            const resp = await $directus.request($createItem('reactions', { video_id: video.id, user_id: currentUserId }))
            const createdId = resp?.data?.id || resp?.id || null
            if (createdId) {
                video.liked = true
                video.reaction_count = (video.reaction_count || 0) + 1
            }
        }
    } catch (e) {
        console.error('Failed to toggle like', e)
    }
}

function openComments(video) {
    // route to details page; keep simple for now
    // e.g. navigate to /connect/vibe/:id from parent if router available
    console.log('Open comments for', video.id)
}
</script>