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
  import { ref } from 'vue'
  import postCard from '~/components/related/post.vue'

  const model = ref(null)
  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: note
    } = await useAsyncData('note', () => {
        return $directus.request($readItems('posts'))
    })
</script>