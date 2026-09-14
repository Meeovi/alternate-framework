<template>
  <div>
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Check out these Spaces from the community" color="transparent">
          <NuxtLink to="/connect/spaces/">All Spaces</NuxtLink>
        </v-toolbar>
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
  import {
    ref
  } from '#imports'
  import spaceCard from '#social/app/components/related/space.vue'

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const model = ref(null)

  // lazy: true — see layers/commerce/.../product/headerslider.vue's
  // comment on the same pattern.
  const {
    data: group
  } = useAsyncData('group', () => {
    return $directus.request($readItems('spaces', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        status: {
          _eq: 'Public'
        },
      },
    }))
  }, { lazy: true })
</script>