<template>
    <v-container class="py-10">
        <v-card elevation="2" class="pa-6">
            <v-card-title>
                <v-row align="center" justify="space-between">
                    <span>🔥 Vibez Feed</span>
                    <v-switch v-model="showMine" label="Show My Videos" inset color="primary" />
                </v-row>
            </v-card-title>

            <v-card-text>
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
                            <v-img :src="getThumbnail(video)" height="200px" cover />
                            <v-card-title>{{ video.title }}</v-card-title>
                            <v-card-subtitle>
                                {{ video.visibility === 'public' ? '🌍 Public' : '🔒 Private' }} •
                                {{ formatDuration(video.duration) }} • 👁️ {{ video.view_count || 0 }}
                            </v-card-subtitle>
                            <v-card-text>
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
                            </v-card-text>
                            <v-card-actions>
                                <v-btn :href="getVideoUrl(video)" target="_blank" color="primary"
                                    :disabled="video.status !== 'ready'">
                                    Watch
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <v-alert v-if="filteredVideos.length === 0" type="info" class="mt-6">
                    No videos match your filters.
                </v-alert>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

const { $directus, $readItems, $readItem, $createItem, $deleteItem } = useNuxtApp()
const config = useRuntimeConfig()

const user = useSupabaseUser()

const videos = ref([])
const tags = ref([])
const selectedTags = ref([])
const showMine = ref(false)
const sortBy = ref('recency')

async function fetchTags() {
    try {
        const { data } = await $directus.request($readItems('tags', { fields: ['id', 'name'] }))
        tags.value = data || []
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

        const { data } = await $directus.request(
            $readItems('videos', {
                filter,
                sort,
                fields: ['*', 'tags.id', 'tags.name']
            })
        )

        videos.value = (data || []).map((v) => ({ ...v, liked: false, reaction_count: v.reaction_count || 0, comment_count: v.comment_count || 0 }))

        // fetch counts and user reactions per video
        await Promise.all(
            videos.value.map(async (v) => {
                try {
                    const resp = await $directus.request($readItems('reactions', { filter: { video_id: { _eq: v.id } } }))
                    v.reaction_count = resp?.data?.length || 0

                    if (userStore.user) {
                        const me = await $directus.request(
                            $readItems('reactions', { filter: { video_id: { _eq: v.id }, user_id: { _eq: userStore.user.id } }, limit: 1 })
                        )
                        v.liked = (me?.data && me.data.length > 0) || false
                    }

                    const commentsResp = await $directus.request($readItems('comments', { filter: { video_id: { _eq: v.id } } }))
                    v.comment_count = commentsResp?.data?.length || 0
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
        const existing = await $directus.request(
            $readItems('reactions', { filter: { video_id: { _eq: video.id }, user_id: { _eq: user.id } }, limit: 1 })
        )
        const existingId = existing?.data?.[0]?.id || null

        if (existingId) {
            await $directus.request($deleteItem('reactions', existingId))
            video.liked = false
            video.reaction_count = Math.max(0, (video.reaction_count || 0) - 1)
        } else {
            const resp = await $directus.request($createItem('reactions', { video_id: video.id, user_id: user.id }))
            if (resp?.id) {
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