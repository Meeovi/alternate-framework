<template>
  <div>
    <v-toolbar v-if="loggedIn === true" :color="hellobar?.color" class="helloBar"
      :style="`color: ${hellobar?.colortext}`">
      <v-toolbar-title>{{ hellobar?.description }} {{ user?.name }}</v-toolbar-title>

      <div v-for="(menu, index) in hellobar?.menus" :key="index">
        <v-toolbar-items v-if="menu?.active === 'Active'" class="helloBar-items">
          <NuxtLink :style="`color: ${hellobar?.colortext}`" :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-toolbar-items>
      </div>
    </v-toolbar>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { readMe } from '@mframework/adapter-directus'
  import { loggedIn, useSession } from '#auth/lib/auth-client'

  const {
    $directus,
    $readItem
  } = useNuxtApp()
  const { data: session } = await useSession(useFetch)
  const user = computed(() => session.value?.user ?? null)

  let authUser = null
  try {
    authUser = await $directus.request(readMe())
  } catch (error) {
    authUser = null
  }

  const {
    data: hellobar
  } = await useAsyncData('hellobar', () => {
    return $directus.request($readItem('navigation', '50'))
  })
</script>