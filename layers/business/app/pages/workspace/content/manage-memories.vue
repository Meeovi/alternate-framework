<template>
  <div>
    <!-- The signed-in user's past posts (Directus `posts`; admins see all) —
         see meeoviTables.memories in nuxt.config.ts. -->
    <MeeoviTable collection="memories" height="calc(100vh - 420px)" :hide="['summary', 'target_audience', 'date_published']" />

    <!-- Their own Bluesky posts — view-only, managed on Bluesky. -->
    <v-card v-if="blueskyPosts.length" elevation="0" class="mt-4">
      <v-card-title>From Bluesky</v-card-title>
      <v-list lines="two">
        <v-list-item v-for="post in blueskyPosts" :key="post.id" :href="post.url" target="_blank" rel="noopener"
          :title="post.content || '(no text)'" :subtitle="formatDate(post.date_created)">
          <template #append>
            <v-icon icon="fas fa-arrow-up-right-from-square" size="small" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Manage Memories' })

type BlueskyPost = { id: string, content?: string, url: string, date_created?: string }

// `{ items: [] }` when not linked to Bluesky (layers/social own-posts endpoint).
const { data } = await useAsyncData('workspace:memories:bluesky',
  () => useRequestFetch()<{ items: BlueskyPost[] }>('/api/social/atproto/own-posts'),
  { default: () => ({ items: [] }) })
const blueskyPosts = computed(() => data.value?.items ?? [])

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '')
</script>
