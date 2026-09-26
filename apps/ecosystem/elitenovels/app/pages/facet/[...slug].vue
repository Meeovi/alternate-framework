<template>
  <div>
    <PageLoader v-if="loading" />
    <div v-else>
    <!-- CHARACTER HEADER -->
    <section data-bs-version="5.1" class="features7 stepm5 cid-uLEiKNmlwj" id="afeatures7-1r">
      <div class="container-fluid">
        <div class="row justify-content-start align-items-stretch">
          <div class="card col-12 col-lg-6">
            <div class="card-wrapper">
              <h4 class="card-title mbr-fonts-style align-center display-5">
                <strong>{{ facet?.universe?.universe_id?.name || 'Unknown Universe' }}</strong>
              </h4>

              <div class="image-wrapper">
                <p class="mbr-fonts-style align-center display-5">
                  {{ facet?.name }}
                </p>
              </div>

              <p class="mbr-text mbr-fonts-style align-center display-4" v-html="facet?.description"></p>

              <div class="mbr-section-btn align-center">
                <p class="btn btn-white-outline display-7" v-if="facet?.type" v-html="facet?.type"></p>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="image-wrapper">
              <img v-if="facet?.image?.filename_disk" :src="`${$directus.url}assets/${facet?.image?.filename_disk}`"
                :alt="facet?.name" />
              <img v-else src="/assets/images/coming_soon.png" :alt="facet?.name || 'Character image placeholder'" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DETAILS -->
    <section data-bs-version="5.1" class="features5 stepm5 cid-uLEh7eZjEW" id="afeatures5-1p">
      <div class="container-fluid">
        <div class="row justify-content-start align-items-stretch">
          <div class="mbr-section-head">
            <h4 class="mbr-section-title mbr-fonts-style mb-0 display-2">Details</h4>
          </div>

          <div class="card col-12">
            <div class="card-wrapper">
              <!-- BASIC INFO -->
              <div class="item">
                <p class="item-title mbr-fonts-style display-4 character-text">Name</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">{{ facet?.name }}</p>
              </div>

              <div class="item" v-if="facet?.alias">
                <p class="item-title mbr-fonts-style display-4 character-text">Alias</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">{{ facet?.alias || 'None' }}</p>
              </div>

              <div class="item" v-if="facet?.location">
                <p class="item-title mbr-fonts-style display-4 character-text">Location</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">
                  <NuxtLink v-if="locationSlug" :to="`/facet/${locationSlug}`">{{ facet?.location || 'None' }}</NuxtLink>
                  <span v-else>{{ facet?.location || 'None' }}</span>
                </p>
              </div>

              <!-- TOPICS / TAGS (comma-separated) -->
              <div class="item" v-if="tagsList.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Topics</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">
                  <span v-for="(t, idx) in tagsList" :key="t.id || t.slug || idx">
                    <NuxtLink v-if="t.slug" :to="`/characters/category/${t.slug}`">{{ t.name }}</NuxtLink>
                    <span v-else>{{ t.name }}</span>
                    <span v-if="idx < tagsList.length - 1">, </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RELATED CONTENT -->
    <div class="characterLowerPage">
      <v-row>

        <!-- STORIES -->
        <v-col cols="12" v-if="facet?.stories?.length">
          <h3>Stories</h3>
          <v-row>
            <v-col cols="12" sm="6" lg="4" v-for="(storyItem, i) in facet.stories" :key="i">
              <story :story="storyItem?.stories_id" />
            </v-col>
          </v-row>
        </v-col>

        <!-- VIDEOS -->
        <v-col cols="12" v-if="facet?.videos?.length">
          <h3>Videos</h3>
          <v-row>
            <v-col cols="12" sm="6" lg="4" v-for="(video, i) in facet.videos" :key="i">
              <videoComponent :video="video?.videos_id" />
            </v-col>
          </v-row>
        </v-col>

        <!-- RELATED CHARACTERS & COMMENTS -->
        <v-col cols="12" v-if="isAbilities">
          <RelatedAbilities />
        </v-col>

        <!-- RELATED TYPES & COMMENTS -->
        <v-col cols="12" v-if="isTypes">
          <RelatedTypes />
        </v-col>

        <!-- RELATED PLACES & COMMENTS -->
        <v-col cols="12" v-if="isPlaces">
          <RelatedPlaces />
        </v-col>

        <!-- RELATED PLACES & COMMENTS -->
        <v-col cols="12" v-if="isItems">
          <RelatedItems />
        </v-col>

        <!-- RELATED LEVELS & COMMENTS -->
        <v-col cols="12" v-if="isLevels">
          <RelatedLevels />
        </v-col>

        <v-col cols="12">
          <comments />
        </v-col>
      </v-row>
    </div>
  </div>
  </div>
</template>

<script setup>
  import PageLoader from '~/components/partials/PageLoader.vue'
  import {
    useRoute
  } from 'vue-router'
  import {
    computed
  } from 'vue'
    import { ref, watch } from 'vue'
  import {
    useHead
  } from '#imports'
  import comments from '~/components/partials/comments.vue'
  import item from '~/components/related/facet.vue'
  import RelatedAbilities from '~/components/related/relatedabilities.vue'
  import RelatedTypes from '~/components/related/relatedtypes.vue'
  import RelatedPlaces from '~/components/related/relatedplaces.vue'
  import RelatedItems from '~/components/related/relateditems.vue'
  import RelatedLevels from '~/components/related/relatedlevels.vue'
  import videoComponent from '~/components/related/video.vue'
  import story from '~/components/related/story.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  // Fetch character data by slug
    // Normalize slug (catch-all route may give array)
    const slug = computed(() => {
      const s = route.params.slug
      if (Array.isArray(s)) return s.join('/')
      return s
    })

    // Fetch facet data by slug. Use a reactive key so the request
    // re-runs when `slug` changes (client-side navigation).
    const { data, status, error } = useLazyAsyncData(() => `facet-${slug.value}`, () => {
      return $directus.request(
        $readItems('options', {
          filter: {
            slug: {
              _eq: slug.value
            }
          },
          fields: [
            '*',
            'tags.tags_id.*',
            'character.characters_id.*',
            'universe.universe_id.*',
            'stories.stories_id.*',
            'videos.videos_id.*',
            'image.*'
          ],
        })
      )
    })

  // Handle Directus returning an array
  const facet = computed(() => data.value?.[0] || null)
  const loading = computed(() => status.value === 'pending' && !facet.value)

  // Compute normalized tags list (name, slug, id)
  const tagsList = computed(() => {
    const c = facet?.value || {}
    if (Array.isArray(c.tags) && c.tags.length) {
      return c.tags
        .map(t => t?.tags_id || t)
        .map(x => ({
          id: x?.id,
          name: x?.name || x?.title || '',
          slug: x?.slug
        }))
        .filter(x => x.name)
    }
    return []
  })

  // Create a slug from the facet.location string so we can link to `/facet/:slug`
  function slugify(text) {
    if (!text) return null
    return text.toString().trim().toLowerCase()
      .normalize('NFKD') // separate accents from letters
      .replace(/\p{Diacritic}/gu, '') // remove diacritics
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/\s+/g, '-') // replace whitespace with -
      .replace(/-+/g, '-') // collapse dashes
      .replace(/^-|-$/g, '') // trim leading/trailing dashes
  }

  const locationSlug = computed(() => {
    const loc = facet?.value?.location
    // If location is already a slug-like string (contains dash or slug property exists somewhere), prefer that
    if (!loc) return null
    // If facet has a nested object with slug, try to use it
    if (typeof loc === 'object' && loc.slug) return loc.slug
    if (typeof loc === 'string') return slugify(loc)
    return null
  })

  // Is this facet an Abilities facet? tolerant to json/string/array and trims whitespace
  const isAbilities = computed(() => {
    const t = facet.value?.type
    if (!t) return false
    if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Abilities')
    return (t || '').toString().trim() === 'Abilities'
  })

  // Is this facet an Types facet? tolerant to json/string/array and trims whitespace
  const isTypes = computed(() => {
    const t = facet.value?.type
    if (!t) return false
    if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Type')
    return (t || '').toString().trim() === 'Type'
  })

  // Is this facet an Places facet? tolerant to json/string/array and trims whitespace
  const isPlaces = computed(() => {
    const t = facet.value?.type
    if (!t) return false
    if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Places')
    return (t || '').toString().trim() === 'Places'
  })

  // Is this facet an Items facet? tolerant to json/string/array and trims whitespace
  const isItems = computed(() => {
    const t = facet.value?.type
    if (!t) return false
    if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Items')
    return (t || '').toString().trim() === 'Items'
  })

  // Is this facet an Levels facet? tolerant to json/string/array and trims whitespace
  const isLevels = computed(() => {
    const t = facet.value?.type
    if (!t) return false
    if (Array.isArray(t)) return t.some(x => (x || '').toString().trim() === 'Level')
    return (t || '').toString().trim() === 'Level'
  })

  // Dynamic page title
  useHead({
    title: computed(() => facet?.value?.name || 'Option Page')
  })
</script>