<template>
  <v-card class="mx-auto" max-width="400">
    <v-img class="align-end text-white" height="200" src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" cover>
      <v-card-title>{{ address?.name }}</v-card-title>
    </v-img>

    <v-card-subtitle class="pt-4">
      Type: {{ address?.type }}
    </v-card-subtitle>

    <v-card-text>
      <div>{{ address?.address }}</div>

      <div>{{ address?.city }} {{ address?.country }} {{ address?.postalcode }}</div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="orange" text="Edit"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import {
    ref
  } from '#imports'

  const props = defineProps({
    address: {
      type: Object,
      required: true
    }
  })
</script>