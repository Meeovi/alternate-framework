<template>
  <div class="contentPage">
    <Pagebar v-if="page?.type !== 'Page'" :about="page?.name" />

    <div class="contentSection">
      <v-card elevation="0">
        <v-card-subtitle class="pt-4" style="width: 100% !important;">
          Published: {{ page?.date_created ? new Date(page.date_created).toLocaleDateString() : '' }} &middot;

          Updated: {{ page?.date_updated ? new Date(page.date_updated).toLocaleDateString() : '' }}
        </v-card-subtitle>

        <v-card-text v-dompurify-html="page?.content"></v-card-text>

        <v-card-actions>
          
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import Pagebar from '../components/menus/page/pagebar.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems,
  } = useNuxtApp()

  const {
    data: page
  } = await useAsyncData(`page-${route.params.slug}`, async () => {
    const result = await $directus.request($readItems('pages', {
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        }
      },
      fields: '*',
      limit: 1
    }))
    return Array.isArray(result) ? result[0] : null
  })

  useHead({
    title: () => page.value?.name || 'Page',
  })

  useSeoMeta({
    title: () => page.value?.name || 'Page',
    description: () => page.value?.description || 'E-Commerce application built with Nuxt & Shopify',
    ogTitle: () => page.value?.name || 'Page',
    ogDescription: () => page.value?.description || 'E-Commerce application built with Nuxt & Shopify',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent('Nuxt', {
    title: () => page.value?.name || 'Nuxt Commerce',
    description: () => page.value?.description ||
      'A high-performance, server-rendered E-commerce app built with Nuxt & Shopify',
    theme: '#4ADE80',
    headline: '',
    colorMode: 'dark',
  })

  definePageMeta({
    layout: 'nolive',
    key: (route) => route.fullPath,
  })
</script>