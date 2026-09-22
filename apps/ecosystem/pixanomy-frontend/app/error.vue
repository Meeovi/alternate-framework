<template>
  <section class="panel error-panel">
    <p class="eyebrow">Request failed</p>
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-copy">{{ message }}</p>
    <div class="results-toolbar">
      <NuxtLink to="/" class="button-secondary">Back home</NuxtLink>
      <NuxtLink to="/results" class="button">Open search demo</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  error?: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const title = computed(() => {
  const code = props.error?.statusCode
  const text = props.error?.statusMessage || 'Something went wrong'
  return code ? `${code} ${text}` : text
})

const message = computed(() => props.error?.message || 'The demo app could not complete that request.')
</script>