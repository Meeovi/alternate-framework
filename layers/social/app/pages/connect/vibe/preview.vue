<template>
    <v-container class="py-10">
        <v-card elevation="2" class="pa-6">
            <v-card-title>🎬 Your Vibez Library</v-card-title>
            <v-card-text>
                <v-row class="mb-4" dense>
                    <v-col cols="12" sm="6" md="4">
                        <v-select v-model="selectedVisibility" :items="visibilityOptions" label="Filter by Visibility"
                            clearable />
                    </v-col>

                    <v-col cols="12" sm="6" md="8">
                        <v-autocomplete v-model="selectedTags" :items="tags" item-title="name" item-value="id"
                            label="Filter by Tags" multiple chips clearable />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col v-for="video in filteredVideos" :key="video.id" cols="12" sm="6" md="4">
                        <v-card>
                            <v-img :src="getThumbnail(video)" height="200px" cover></v-img>
                            <v-card-title>{{ video.title }}</v-card-title>
                            <v-card-subtitle>
                                Visibility: {{ video.visibility }}
                            </v-card-subtitle>
                            <v-card-text>
                                <v-chip v-for="tag in video.tags" :key="tag.id" class="ma-1" size="small"
                                    color="primary" variant="outlined">
                                    {{ tag.name }}
                                </v-chip>
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
    import { ref, computed, onMounted } from 'vue'
    import { useDirectusClient, useDirectusAuth } from '~/composables/useDirectus'

    const config = useRuntimeConfig()
    const directus = useDirectusClient()
    const { user } = useDirectusAuth()

    const videos = ref([])
    const tags = ref([])
    const selectedVisibility = ref(null)
    const selectedTags = ref([])

    const visibilityOptions = ['public', 'followers', 'circles', 'private']

    onMounted(async () => {
        if (!user.value) return

        // Fetch videos for this user and their tags
        const videoResp = await directus.items('videos').list(`filter[user_id][_eq]=${user.value.id}&sort=-created_at&fields=*,tags.id,tags.name`)
        if (videoResp && videoResp.data) videos.value = videoResp.data

        // Fetch all available tags
        const tagResp = await directus.items('tags').list()
        if (tagResp && tagResp.data) tags.value = tagResp.data
    })

    const filteredVideos = computed(() => {
        return videos.value.filter((video) => {
            const matchesVisibility = !selectedVisibility.value || video.visibility ===
                selectedVisibility.value

            const matchesTags =
                selectedTags.value.length === 0 ||
                selectedTags.value.every((tagId) =>
                    video.tags?.some((t) => t.id === tagId)
                )

            return matchesVisibility && matchesTags
        })
    })


    function getVideoUrl(video) {
        return `https://${config.public.minioEndpoint}/vibez-transcoded/${video.minio_key}`
    }

    function getThumbnail(video) {
        return `https://${config.public.minioEndpoint}/thumbnails/${video.id}.jpg`
    }
</script>