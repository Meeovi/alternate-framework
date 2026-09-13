<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>{{ integration?.name }}</v-toolbar-title>

      <v-toolbar-items>
        <v-btn title="Uninstall integration" text="Uninstall integration" variant="text"></v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <div class="contentSection">
      <v-card elevation="0">
        <v-img class="align-end text-white" height="200" src="assets/images/background4.jpg" cover>
          <v-card-title style="font-size: 35px;">{{ integration?.name }}</v-card-title>
        </v-img>

        <v-card-subtitle class="pt-4">
          Published: {{ integration?.date_created ? new Date(integration.date_created).toLocaleDateString() : '' }}
        </v-card-subtitle>

        <v-card-text v-dompurify-html="integration?.content"></v-card-text>

        <v-card-actions>
          <share />
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  definePageMeta({ middleware: 'seller' })

  import {
    ref,
    watch
  } from 'vue'
  import Pagebar from '../components/menus/page/pagebar.vue'
  import share from '#social/app/components/blocks/share.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems,
  } = useNuxtApp()

  const {
    data: integration
  } = await useAsyncData('integration', async () => {
    const result = await $directus.request($readItems('integrations', {
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

  watch(() => route.params.slug, async () => {
    await refreshNuxtData('integration')
  })

  useHead({
    title: () => integration.value?.name || 'Integration',
  })

  useSeoMeta({
    title: () => integration.value?.name || 'Integration',
    description: () => integration.value?.description || 'E-Commerce application built with Nuxt & Shopify',
    ogTitle: () => integration.value?.name || 'Integration',
    ogDescription: () => integration.value?.description || 'E-Commerce application built with Nuxt & Shopify',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent('Nuxt', {
    title: () => integration.value?.name || 'Nuxt Commerce',
    description: () => integration.value?.description ||
      'A high-performance, server-rendered E-commerce app built with Nuxt & Shopify',
    theme: '#4ADE80',
    headline: '',
    colorMode: 'dark',
  })
</script>
