<template>
  <div class="explore">
    <v-toolbar>
      <v-toolbar-title>Explore</v-toolbar-title>
    </v-toolbar>

    <!-- Content: trending hashtags from the atproto network. -->
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Trending Hashtags" color="transparent">
          <NuxtLink to="/connect/hashtags/">All Hashtags</NuxtLink>
        </v-toolbar>
        <div class="text-center pa-4">
          <template v-if="hashtags?.length">
            <div v-for="hashtag in hashtags" :key="hashtag.id" class="d-inline-block">
              <tagChip :tag="hashtag" />
            </div>
          </template>
          <div v-else class="center-text">No hashtags yet</div>
        </div>
      </v-sheet>
    </v-col>

    <latestProducts />

    <relatedSpaces />

    <!-- Content: public lists published by the community. -->
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Public Notes from the Federation" color="transparent">
          <NuxtLink to="/connect/lists/">All Lists</NuxtLink>
        </v-toolbar>
        <v-slide-group v-model="listsModel" class="pa-4" selected-class="bg-success" show-arrows="always">
          <v-slide-group-item v-for="post in notes" :key="post.id"
            v-slot="{ isSelected, toggle, selectedClass }">
            <div class="d-flex align-items-stretch" :class="selectedClass" @click="toggle">
              <postCard :post="post" />
              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </div>
          </v-slide-group-item>
        </v-slide-group>
        <div v-if="!publicLists.length" class="center-text pa-4">No public notes yet</div>
      </v-sheet>
    </v-col>

    <!-- Content: public lists published by the community. -->
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Public Lists from the community" color="transparent">
          <NuxtLink to="/connect/lists/">All Lists</NuxtLink>
        </v-toolbar>
        <v-slide-group v-model="listsModel" class="pa-4" selected-class="bg-success" show-arrows="always">
          <v-slide-group-item v-for="list in publicLists" :key="list.id"
            v-slot="{ isSelected, toggle, selectedClass }">
            <div class="d-flex align-items-stretch" :class="selectedClass" @click="toggle">
              <listCard :list="list" class="ma-4" />
              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </div>
          </v-slide-group-item>
        </v-slide-group>
        <div v-if="!publicLists.length" class="center-text pa-4">No public lists yet</div>
      </v-sheet>
    </v-col>

    <!-- Products: the events behind the /departments/events/ page. -->
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Latest Events" color="transparent">
          <NuxtLink to="/departments/events/">All Events</NuxtLink>
        </v-toolbar>
        <v-slide-group v-model="eventsModel" class="pa-4" selected-class="bg-success" show-arrows="always">
          <v-slide-group-item v-for="product in eventProducts" :key="product.id"
            v-slot="{ isSelected, toggle, selectedClass }">
            <div class="d-flex align-items-stretch" :class="selectedClass" @click="toggle">
              <productCard :product="product" class="ma-4" />
              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </div>
          </v-slide-group-item>
        </v-slide-group>
        <div v-if="!eventProducts.length" class="center-text pa-4">No events yet</div>
      </v-sheet>
    </v-col>

    <!-- Products: the video products behind the /departments/category/videos/ page. -->
    <v-col cols="12">
      <v-sheet class="mx-auto row align-items-stretch items-row">
        <v-toolbar title="Videos from the community" color="transparent">
          <NuxtLink to="/departments/category/videos/">All Videos</NuxtLink>
        </v-toolbar>
        <v-slide-group v-model="videosModel" class="pa-4" selected-class="bg-success" show-arrows="always">
          <v-slide-group-item v-for="product in videoProducts" :key="product.id"
            v-slot="{ isSelected, toggle, selectedClass }">
            <div class="d-flex align-items-stretch" :class="selectedClass" @click="toggle">
              <productCard :product="product" class="ma-4" />
              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </div>
          </v-slide-group-item>
        </v-slide-group>
        <div v-if="!videoProducts.length" class="center-text pa-4">No videos yet</div>
      </v-sheet>
    </v-col>
  </div>
</template>

<script setup>
  import {
    computed,
    ref
  } from 'vue';
  import latestProducts from '#commerce/app/components/catalog/product/latestproducts.vue'
  import productCard from '#commerce/app/components/catalog/product/productCard.vue'
  import relatedSpaces from '#social/app/components/related/relatedspaces.vue'
  import listCard from '#social/app/components/related/list.vue'
  import postCard from '#social/app/components/related/post.vue'
  import tagChip from '#social/app/components/related/tag.vue'

  const model = ref(null)
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  // Each slide group owns its own selection model — sharing one `model`
  // across them made selecting a card in one group change the highlight
  // in the others.
  const listsModel = ref(null)
  const eventsModel = ref(null)
  const videosModel = ref(null)

  // Directus answers with `{ data: [...] }` on some routes and a bare
  // array on others; normalise to an array so the templates can always
  // iterate (and `length` always reads).
  const asRows = (resp) => (Array.isArray(resp) ? resp : (resp?.data || []))

  // Content — notes (posts) from the atproto network, served by
  // /api/social/atproto/explore-posts (the social layer's public
  // atproto feed, normalized into the same shape post.vue renders for
  // Directus `posts` rows). Resolves to `{ items: [] }` when the PDS is
  // unreachable, so this is purely additive — never an error.
  const {
    data: atprotoNotes
  } = await useAsyncData('explore:atprotoNotes', () => $fetch('/api/social/atproto/explore-posts?limit=6'), { default: () => ({ items: [] }) })

  // Content — trending hashtags from the atproto network, served by
  // /api/social/atproto/trending-hashtags (the same source the
  // /connect/hashtags page merges into its listing).
  const {
    data: atprotoHashtags
  } = await useAsyncData('explore:atprotoHashtags', () => $fetch('/api/social/atproto/trending-hashtags'), { default: () => ({ items: [] }) })

  const notes = computed(() => atprotoNotes.value?.items || [])
  const hashtags = computed(() => (atprotoHashtags.value?.items || []).slice(0, 15))

  // Content — public lists. Same collection and `status` value the
  // /lists page renders for its "Public Lists" tab.
  const {
    data: publicLists
  } = await useAsyncData('explore:public-lists', async () => {
    try {
      const resp = await $directus.request($readItems('lists', {
        fields: ['*', 'image.*'],
        filter: {
          status: {
            _eq: 'Public'
          }
        },
        sort: '-date_created',
        limit: 10,
      }))
      return asRows(resp)
    } catch {
      return []
    }
  })

  // Products — the events the /departments/events/ page shows: the Events
  // department's own products plus the products typed as "Event" (the
  // department page renders those as its separate "Events" group).
  const {
    data: eventProducts
  } = await useAsyncData('explore:event-products', async () => {
    try {
      const resp = await $directus.request($readItems('products', {
        fields: ['*', 'image.*', 'shops.shops_id.name'],
        filter: {
          status: {
            _eq: 'published'
          },
          _or: [{
            departments: {
              departments_id: {
                slug: {
                  _eq: 'events'
                }
              }
            }
          }, {
            product_types: {
              product_types_id: {
                name: {
                  _eq: 'Event'
                }
              }
            }
          }]
        },
        sort: '-created_at',
        limit: 10,
      }))
      return asRows(resp)
    } catch {
      return []
    }
  })

  // Products — the video products behind /departments/category/videos/.
  // Matched on the "Video" product type, and on the "videos" category
  // when a category of that slug exists, so the section shows what the
  // linked page shows.
  const {
    data: videoProducts
  } = await useAsyncData('explore:video-products', async () => {
    try {
      const resp = await $directus.request($readItems('products', {
        fields: ['*', 'image.*', 'shops.shops_id.name'],
        filter: {
          status: {
            _eq: 'published'
          },
          _or: [{
            product_types: {
              product_types_id: {
                name: {
                  _eq: 'Video'
                }
              }
            }
          }, {
            categories: {
              categories_id: {
                slug: {
                  _eq: 'videos'
                }
              }
            }
          }]
        },
        sort: '-created_at',
        limit: 10,
      }))
      return asRows(resp)
    } catch {
      return []
    }
  })

  useHead({
    title: 'Explore'
  })
</script>
