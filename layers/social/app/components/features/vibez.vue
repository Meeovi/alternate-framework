<template>
    <v-container class="py-10">
        <v-card elevation="2" class="pa-6">
            <template #header>
                <v-row align="center" justify="space-between">
                    <span>🔥 Vibez Feed</span>
                    <v-switch v-model="showMine" label="Show My Videos" inset color="primary" />
                </v-row>
            </template>

            <template #default>
                <v-row class="mb-4" dense>
                    <v-col cols="12" sm="6" md="4">
                        <v-select v-model="sortBy" :items="['recency', 'popularity']" label="Sort By" clearable />
                    </v-col>

                    <v-col cols="12" sm="6" md="8">
                        <v-autocomplete v-model="selectedTags" :items="tags" item-title="name" item-value="id"
                            label="Filter by Tags" multiple chips clearable />
                    </v-col>
                </v-row>

                <v-divider class="my-6" />
                <h2 class="text-h6 mb-4">🔴 Live Now</h2>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-card>
                            <v-img src="https://your-owncast-domain.com/preview.jpg" height="200px" cover />
                            <template #header>Live Stream</template>
                            <template>
                                <v-btn href="https://your-owncast-domain.com" target="_blank" color="red">
                                    Watch Live
                                </v-btn>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>

                <v-divider class="my-6" />
                <h2 class="text-h6 mb-4">🎥 Videos</h2>
                <v-row>
                    <v-col v-for="video in filteredVideos" :key="video.id" cols="12" sm="6" md="4">
                        <v-card @click="trackView(video.id)">
                            <template #header>{{ video.title }}</template>
                            <template #default>
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
                                        <v-icon>{{ video.liked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                                    </v-btn>
                                    <span>{{ video.reaction_count || 0 }}</span>

                                    <v-btn icon @click.stop="openComments(video)" class="ml-2">
                                        <v-icon>mdi-comment-outline</v-icon>
                                    </v-btn>
                                    <span>{{ video.comment_count || 0 }}</span>
                                </div>
                            </template>
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
            </template>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, watchEffect } from '#imports'
import useDirectusRequest from '#social/app/composables/useDirectusRequest'

const { readItems, createItem, deleteItem } = useDirectusRequest()
const config = useRuntimeConfig()

const user = useSupabaseUser()

const videos = ref([])
const tags = ref([])
const selectedTags = ref([])
const showMine = ref(false)
const sortBy = ref('recency')

async function fetchTags() {
    try {
        const data = await readItems('tags', { fields: ['id', 'name'] })
        tags.value = data?.data || data || []
    } catch (e) {
        console.error('Failed to fetch tags', e)
    }
}

async function fetchVideos() {
    try {
        const filter = {}
        if (showMine.value && user) {
            filter.user_id = { _eq: user.id }
        } else {
            filter.visibility = { _eq: 'public' }
        }

        const sort = sortBy.value === 'popularity' ? ['-view_count'] : ['-created_at']

        const resp = await readItems('videos', { filter, sort, fields: ['*', 'tags.id', 'tags.name'] })
        const data = resp?.data || resp || []
        videos.value = (data || []).map((v) => ({ ...v, liked: false, reaction_count: v.reaction_count || 0, comment_count: v.comment_count || 0 }))

        // fetch counts and user reactions per video
        await Promise.all(
            videos.value.map(async (v) => {
                try {
                    const resp = await readItems('reactions', { filter: { video_id: { _eq: v.id } } })
                    v.reaction_count = resp?.data?.length || resp?.length || 0

                    if (userStore.user) {
                        const me = await readItems('reactions', { filter: { video_id: { _eq: v.id }, user_id: { _eq: userStore.user.id } }, limit: 1 })
                        const meData = me?.data || me || []
                        v.liked = (meData && meData.length > 0) || false
                    }

                    const commentsResp = await readItems('comments', { filter: { video_id: { _eq: v.id } } })
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

const filteredVideos = computed(() =>
    videos.value.filter((video) =>
        selectedTags.value.length === 0 || selectedTags.value.every((tagId) => video.tags?.some((t) => t.id === tagId))
    )
)

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

async function trackView(videoId) {
    await fetch('/api/view-video', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' }
    })
}

async function toggleLike(video) {
    const user = userStore.user
    if (!user) return

    try {
        const existing = await readItems('reactions', { filter: { video_id: { _eq: video.id }, user_id: { _eq: user.id } }, limit: 1 })
        const existingId = (existing?.data?.[0]?.id) || (existing?.[0]?.id) || null

        if (existingId) {
            await deleteItem('reactions', existingId)
            video.liked = false
            video.reaction_count = Math.max(0, (video.reaction_count || 0) - 1)
        } else {
            const resp = await createItem('reactions', { video_id: video.id, user_id: user.id })
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