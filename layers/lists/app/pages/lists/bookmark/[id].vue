<template>
    <v-row class="contentPage">
        <v-col cols="12">
            <UCard class="mx-auto" max-width="800px" elevation="0">
                <NuxtImg loading="lazy" class="align-end text-white" height="200" :src="content.getAssetUrl(website?.image)" :alt="website?.name" cover />
                <template #header>{{ website?.name }}</template>

                <UCard-subtitle class="pt-4">
                    Created: {{ new Date(website?.created_at).toLocaleDateString() }}
                </v-card-subtitle>

                <template #header>
                    <div>Type: {{ website?.type }}</div>

                    <div>{{ website?.note }}</div>
                </template>

                <template>
                    <updatebookmark />

                    <v-spacer></v-spacer>
                    <UButton color="orange" text="Visit" :href="website?.url"></UButton>
                </template>
            </UCard>
        </v-col>

        <v-divider></v-divider>
        <v-col cols="12">
            <comments />
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed } from 'vue'
import updatebookmark from '#lists/app/components/lists/update-bookmark.vue'
import createListBtn from '#lists/app/components/partials/createListBtn.vue'
import comments from '#social/app/components/comments.vue'

const route = useRoute()
const content = useContentAdapter()

const { data: website } = await useAsyncData('website', async () => {
  const opts = { fields: ['*', { '*': ['*'] }] }
  if (content && typeof content.readItem === 'function') {
    const resp = await content.readItem('websites', route.params.id, opts)
    return resp?.data || resp
  }
  const { $directus, $readItem } = useNuxtApp()
  return $directus.request($readItem('websites', route.params.id, opts))
})
</script>