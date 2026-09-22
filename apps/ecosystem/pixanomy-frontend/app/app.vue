<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = computed(() => String(config.public.siteName || 'Alternate Framework Demo'))
const siteDescription = computed(() => String(config.public.siteDescription || 'Minimal alternate-search demo.'))

useHead({
  htmlAttrs: { lang: 'en' },
  title: siteName.value,
})

useSeoMeta({
  title: siteName.value,
  description: siteDescription.value,
  viewport: 'width=device-width, initial-scale=1',
})
</script>