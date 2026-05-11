<template>
  <div>
    <v-sheet class="mx-auto row align-items-stretch items-row">
      <v-toolbar title="Radio Stations from the community" color="transparent">
        <NuxtLink to="/departments/categories/stations/">All Radio Stations</NuxtLink>
      </v-toolbar>

      <div class="d-flex flex-wrap ga-2 pa-4 w-100">
        <NuxtLink
          v-for="(station, index) in stationItems"
          :key="station?.id || index"
          class="text-decoration-none"
          :to="`/departments/categories/station/${station?.id || ''}`"
        >
          <v-chip color="primary" variant="outlined">
            {{ station?.name || 'Station' }}
          </v-chip>
        </NuxtLink>
      </div>
    </v-sheet>
  </div>
</template>

<script setup>
  import {
    computed,
  } from '#imports'

  const {
    read,
  } = useNuxtApp()

  const {
    data: stationSlide,
  } = await useAsyncData('stationSlide', async () => {
    try {
      const result = await gateway.content(read('radios', {
        fields: ['id', 'name'],
        filter: {
          status: {
            _eq: 'published',
          },
        },
      }))

      return Array.isArray(result) ? result : (result?.data || [])
    } catch {
      return []
    }
  })

  const stationItems = computed(() => Array.isArray(stationSlide.value) ? stationSlide.value : [])
</script>