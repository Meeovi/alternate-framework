<template>
  <section class="panel error-panel" style="background-image: url('./assets/images/desk-and-supplies.jpg-816x544.jpg')">
    <p class="eyebrow">Request failed</p>
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-copy">{{ message }}</p>
    <div class="results-toolbar">
      <NuxtLink to="/" class="button-secondary">Back home</NuxtLink>
      <NuxtLink to="https://app.pixanomy.com" class="button">Open Dashboard</NuxtLink>
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

<style>
 .page-title, .page-copy, .results-toolbar a, .eyebrow {
  text-align: center;
  width: 100%;
  margin-top: 25%;
 }
</style>