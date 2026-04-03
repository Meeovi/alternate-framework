<template>
    <div>
      <v-col cols="12">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-for="space in group" :key="space.id" v-slot="{ isSelected, toggle, selectedClass }">
              <spaceCard :space="space" :class="['ma-4', selectedClass]" v-if="isSelected" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </div>
  </template>

  <script setup>
  import { ref } from '#imports'
  import spaceCard from '#social/app/components/related/space.vue'

  const model = ref(null)
  import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'
  const { readItems } = useAdapterRequest()

  const { data: group } = await useAsyncData('group', async () => {
    const resp = await readItems('spaces')
    return resp?.data || resp || []
  })
</script>