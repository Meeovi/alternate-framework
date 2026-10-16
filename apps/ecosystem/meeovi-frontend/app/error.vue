<template>
  <!-- Nuxt renders this file for every error (404s from the catch-all CMS
       page, 500s…) outside of any page, so wrap it in the site layout. -->
  <NuxtLayout>
    <div class="contentPage">
      <div class="contentSection text-center py-8">
        <h1>{{ status }}</h1>
        <p class="mb-4">{{ message }}</p>
        <v-btn color="primary" @click="goHome">Go back home</v-btn>
      </div>

      <featuredProducts />

      <relatedSpaces />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import featuredProducts from '#commerce/app/components/catalog/product/featuredproducts.vue'
import relatedSpaces from '#social/app/components/related/relatedspaces.vue'

const props = defineProps<{ error: NuxtError }>()

const status = computed(() => props.error?.statusCode ?? 500)
const message = computed(() => {
  if (status.value === 404) return "We couldn't find that page."
  if (status.value === 503) return 'This page is temporarily unavailable. Please try again shortly.'
  return 'Something went wrong on our end.'
})

useHead({ title: () => (status.value === 404 ? 'Page not found' : 'Error') })

// clearError resets the error state; navigating alone would keep showing it.
const goHome = () => clearError({ redirect: '/' })
</script>
