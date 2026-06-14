<template>
  <div>
    <v-toolbar :color="list?.color || 'primary'" dark>
      <v-toolbar-title>{{ list?.name || 'List' }}</v-toolbar-title>
    </v-toolbar>

    <div v-if="error" class="error pa-4">Failed to load list.</div>
    <div v-else-if="!list" class="pa-4">Loading...</div>
    <div v-else class="pa-4">
      <DataGrid :data="list?.posts" />

    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useRoute
  } from 'vue-router'

  const route = useRoute();
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: list,
    error
  } = await useAsyncData('list', async () => {
    const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
    const resp = await $directus.request($readItems('lists', {
      filter: {
        slug: {
          _eq: slug
        }
      },
      fields: ['*', 'posts.posts_id.*', 'image.*', 'owner.*', 'members.user.*',
        'products.products_id.*', 'lists.lists_id.*', 'media.*'
      ],
      limit: 1
    }))
    return resp?.data?.[0] || resp?.[0] || null
  })

  useHead({
    title: computed(() => list?.value?.name || 'List')
  })

  definePageMeta({
    //middleware: ['auth']
  })
</script>