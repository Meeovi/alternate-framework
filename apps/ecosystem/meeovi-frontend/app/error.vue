<template>
  <!-- Nuxt renders this file for every error (404s from the catch-all CMS
       page, 500s…) outside of any page, so wrap it in the site layout. -->
  <NuxtLayout>
    <div class="contentPage">
      <section data-bs-version="5.1" class="header4 cid-u48BYncuPn mbr-fullscreen" id="header4-87">
        <div class="container">
          <div class="row">
            <div class="content-wrap">
              <h1 class="mbr-section-title mbr-fonts-style mbr-white mb-3 display-1">
                <strong>{{ status }}</strong></h1>

              <p class="mbr-fonts-style mbr-text mbr-white mb-3 display-7">
                {{ message }}
              </p>

              <div class="mbr-section-btn"><a class="btn btn-primary display-4" @click="goHome" href="/">Go Back
                  home</a></div>
            </div>
          </div>

      <featuredProducts />

      <relatedSpaces />          
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
  import type {
    NuxtError
  } from '#app'
  import featuredProducts from '#commerce/app/components/catalog/product/featuredproducts.vue'
  import relatedSpaces from '#social/app/components/related/relatedspaces.vue'

  const props = defineProps < {
    error: NuxtError
  } > ()

  const status = computed(() => props.error?.statusCode ?? 500)
  const message = computed(() => {
    if (status.value === 404) return "We couldn't find that page."
    if (status.value === 503) return 'This page is temporarily unavailable. Please try again shortly.'
    return 'Something went wrong on our end.'
  })

  useHead({
    title: () => (status.value === 404 ? 'Page not found' : 'Error')
  })

  // clearError resets the error state; navigating alone would keep showing it.
  const goHome = () => clearError({
    redirect: '/'
  })
</script>