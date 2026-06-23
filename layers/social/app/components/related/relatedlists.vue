<template>
  <div>
    <v-sheet class="mx-auto sliderLists row align-items-stretch items-row justify-content-center">
      <v-toolbar color="transparent">
        <v-toolbar-title>Public Lists</v-toolbar-title>
      </v-toolbar>
      <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
        <v-slide-group-item v-slot="{ toggle, selectedClass }" v-for="(list, index) in listsPub" :key="index">
          <listCard :class="['ma-4', selectedClass]" :list="list" @click="toggle" />
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>
  </div>
</template>

<script setup>
  import {
    ref
  } from '#imports'
  import listCard from './list.vue'

  const model = ref(null)

  const { $sdk } = useNuxtApp()

  const {
    data: listsPub
  } = await useAsyncData('listsPub', () => {
    return $sdk.content.readItems('lists', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        status: {
          _eq: 'Public'
        },
        type: {
          _eq: 'List'
        }
      },
    })
  })
</script>