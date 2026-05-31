<template>
    <div>
      <v-col cols="12">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-for="post in note" :key="post" v-slot="{ isSelected, toggle, selectedClass }">
              <postCard :post="post" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from '#imports'
import useContent from '#shared/app/composables/content/useContent'
  import postCard from '#social/app/components/related/post.vue'

  const model = ref(null)
 const { readItems } = useContent()

  const { data: note } = await useAsyncData('note', async () => {
    const resp = await readItems('posts')
    return resp?.data || resp || []
  })
</script>
