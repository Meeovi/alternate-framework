<template>
  <div>
    <headerslider />
    
    <div>
      <ataglance />
      <exclusives />
      <bookcallout />
      <deals />
      <musiccallout />
      <latestproducts />
      <theatercallout />
      <featuredproducts />
      <bestsellers />
      <pixanomycallout />
      <recentlyViewed />
      <relatedstations />
      <relatedspaces />
      <relatedbrands />
      <blogcallout />
    </div>
  </div>
</template>

<script setup>
  // Everything below the hero hydrates when it scrolls into view: it is
  // still server-rendered (content and SEO unchanged), but its JS loads and
  // runs on demand instead of all of it hydrating on page load.
  import headerslider from '../components/content/homepage/headerslider.vue'
  const ataglance = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/ataglance.vue'))
  const exclusives = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/exclusives.vue'))
  const bookcallout = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/bookcallout.vue'))
  const deals = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/deals.vue'))
  const musiccallout = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/musiccallout.vue'))
  const latestproducts = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/latestproducts.vue'))
  const theatercallout = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/theatercallout.vue'))
  const featuredproducts = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/featuredproducts.vue'))
  const bestsellers = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/bestsellers.vue'))
  const pixanomycallout = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/pixanomycallout.vue'))
  const recentlyViewed = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/recentlyviewed.vue'))
  const relatedstations = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/relatedstations.vue'))
  const relatedspaces = defineLazyHydrationComponent('visible', () => import('#social/app/components/related/relatedspaces.vue'))
  const relatedbrands = defineLazyHydrationComponent('visible', () => import('#commerce/app/components/catalog/product/relatedbrands.vue'))
  const blogcallout = defineLazyHydrationComponent('visible', () => import('../components/content/homepage/blogcallout.vue'))

  useHead({
    title: 'Welcome',
  })
</script>