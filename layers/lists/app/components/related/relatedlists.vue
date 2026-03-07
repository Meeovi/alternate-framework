<template>
  <div>
    <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
      <v-toolbar color="transparent">
        <v-toolbar-title>Public Lists</v-toolbar-title>
      </v-toolbar>
      <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(list, index) in lists" :key="index">
          <listCard :class="['ma-4', selectedClass]" :list="list" v-if="isSelected" @click="toggle" />
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>
  </div>
</template>

<script setup>
  import {
    ref
  } from '#imports'
  import listCard from '~/components/related/list.vue'

  const content = useContentAdapter()
  const model = ref(null)

  const { data: lists } = await useAsyncData('lists', async () => {
    const opts = {
      fields: ['*', { '*': ['*'] }],
      filter: { status: { _eq: 'Public' } }
    }
    if (content && typeof content.readItems === 'function') {
      const resp = await content.readItems('lists', opts)
      return resp?.data || resp
    }
    const { $directus, $readItems } = useNuxtApp()
    return await $directus.request($readItems('lists', opts))
  })
</script>