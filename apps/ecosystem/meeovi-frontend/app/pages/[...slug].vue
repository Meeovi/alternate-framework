<template>
  <div class="contentPage">
    <Pagebar v-if="page && page.type !== 'Page'" :about="page.name" />
    
    <component :is="customPage" v-if="customPage" />

    <div v-else class="contentSection">
      <v-card elevation="0">
        <v-card-text v-dompurify-html:cms="page?.content"></v-card-text>

        <v-card-actions class="pt-4" style="width: 100% !important;">
          Published: {{ page?.date_created ? new Date(page.date_created).toLocaleDateString() : '' }} &middot;

          Updated: {{ page?.date_updated ? new Date(page.date_updated).toLocaleDateString() : '' }}
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  import Pagebar from '#ui/app/components/menus/page/pagebar.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems,
  } = useNuxtApp()

  // `/about/team` arrives as ['about', 'team'].
  const slug = [].concat(route.params.slug || []).join('/')
  const customPages = import.meta.glob('../components/content/*.vue', {
    eager: true,
    import: 'default'
  })
  const customPage = customPages[`../components/content/${slug}.vue`]
  const hasCustomPage = Boolean(customPage)

  const {
    data: page,
    error
  } = await useAsyncData(`page-${slug}`, async () => {
    if (hasCustomPage) return null

    const result = await $directus.request($readItems('pages', {
      filter: {
        slug: {
          _eq: slug
        }
      },
      fields: '*',
      limit: 1
    }))
    return (Array.isArray(result) ? result[0] : null) ?? null
  })

  // This page catches every URL nothing else claims — answer a real 404
  // (not an empty 200 page) when the CMS has no page for it.
  if (error.value && !hasCustomPage) {
    throw createError({
      statusCode: 503,
      statusMessage: 'This page is temporarily unavailable',
      fatal: true
    })
  }
  if (!page.value && !hasCustomPage) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
      fatal: true
    })
  }

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