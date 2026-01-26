<template>
    <div>
      <v-col cols="12">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-for="short in vibez" :key="short.id" v-slot="{ isSelected, toggle, selectedClass }">
              <shortsCard :short="short" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import shortsCard from '~/components/related/short.vue'

  const model = ref(null)
  const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
        data: vibez
    } = await useAsyncData('vibez', () => {
        return $directus.request($readItems('shorts'))
    })
</script>