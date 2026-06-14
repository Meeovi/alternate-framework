<template>
    <v-row class="contentPage">
        <v-col cols="12">
            <v-card class="mx-auto" max-width="800px" elevation="0">
                <NuxtImg loading="lazy" class="align-end text-white" height="200" :src="getAssetUrl(website?.image)" :alt="website?.name" cover />
                <v-card-title>{{ website?.name }}</v-card-title>

                <v-card-subtitle class="pt-4">
                    Created: {{ new Date(website?.created_at).toLocaleDateString() }}
                </v-card-subtitle>

                <v-card-text>
                    <div>Type: {{ website?.type }}</div>

                    <div>{{ website?.note }}</div>
                </v-card-text>

                <v-card-actions>
                    <updatebookmark />

                    <v-spacer></v-spacer>
                    <v-btn color="orange" text="Visit" :href="website?.url"></v-btn>
                </v-card-actions>
            </v-card>
        </v-col>

        <v-divider></v-divider>
        <v-col cols="12">
            <comments />
        </v-col>
    </v-row>
</template>

<script setup>
import updatebookmark from '#social/app/components/features/lists/update-bookmark.vue'
import comments from '#social/app/components/blocks/comments.vue'
import { useDirectusUrl } from '#shared/app/composables/media/useDirectusUrl'

const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const directusUrl = useDirectusUrl()
const getAssetUrl = (file) => {
    const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
    if (!fileId || !directusUrl) return ''
    return `${directusUrl.replace(/\/$/, '')}/assets/${fileId}`
}

const { data: website } = await useAsyncData('website', async () => {
  const opts = { fields: ['*', { '*': ['*'] }] }
    const resp = await $directus.request($readItem('websites', route.params.id, opts))
    return resp || null
})
</script>
