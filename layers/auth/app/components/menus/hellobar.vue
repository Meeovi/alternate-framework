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
  import useContent from '#shared/app/composables/content/useContent'
  const auth = useAuth()
  await auth.fetchSession()

  const content = useContent()
  const loggedIn = computed(() => Boolean(auth.loggedIn.value))
  const user = computed(() => auth.user.value ?? null)

  const {
    data: hellobar
  } = await useAsyncData('hellobar', () => {
    return content.readItem('navigation', '50')
  })
</script>