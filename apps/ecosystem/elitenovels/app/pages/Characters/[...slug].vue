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
              <h4 class="card-title mbr-fonts-style align-center display-5" v-if="character">
                <strong> {{ character?.name }}</strong>
              </h4>

              <div class="image-wrapper">
                <p class="mbr-fonts-style align-center display-5">
                  {{ universeName }}
                </p>
              </div>

              <p class="mbr-text mbr-fonts-style align-center display-4" v-html="character?.description"></p>

              <!-- Type Chips -->
              <div class="mbr-section-btn align-center" v-if="isMonster && typeNames.length">
                <v-chip v-for="(t, i) in typeNames" :key="i" class="ma-1" color="deep-purple accent-4"
                  text-color="white" label link :to="`/facet/${t.toLowerCase()}`">
                  {{ t }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="image-wrapper">
              <img v-if="character?.image?.filename_disk"
                :src="`${$directus.url}assets/${character.image.filename_disk}`" :alt="character.name" />
              <img v-else src="/assets/images/coming_soon.png"
                :alt="character?.name || 'Character image placeholder'" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CHARACTER DETAILS -->
    <section data-bs-version="5.1" class="features5 stepm5 cid-uLEh7eZjEW" id="afeatures5-1p">
      <div class="container-fluid">
        <div class="row justify-content-start align-items-stretch">
          <div class="mbr-section-head">
            <h4 class="mbr-section-title mbr-fonts-style mb-0 display-2">Character Details</h4>
          </div>

          <div class="card col-12">
            <div class="card-wrapper">
              <!-- BASIC INFO -->
              <div class="item">
                <p class="item-title mbr-fonts-style display-4 character-text">Name</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">{{ character?.name }}</p>
              </div>

              <div class="item" v-if="character?.type === 'Individual'">
                <p class="item-title mbr-fonts-style display-4 character-text">Age</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">{{ character?.age || 'Unknown' }}</p>
              </div>

              <div class="item">
                <p class="item-title mbr-fonts-style display-4 character-text">Alias</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">{{ character?.alias || 'None' }}</p>
              </div>

              <!-- TYPE (Monster Only) -->
              <div class="item" v-if="isMonster && typeNames.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Type</p>
                <div class="mbr-text mbr-fonts-style display-4 character-text">
                  <v-chip v-for="(t, i) in typeNames" :key="i" class="ma-1" color="indigo" text-color="white" label link
                    :to="`/facet/${t.toLowerCase()}`">
                    {{ t }}
                  </v-chip>
                </div>
              </div>

              <!-- LEVEL (Monster Only) -->
              <div class="item" v-if="isMonster && levelNames.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Level</p>
                <div class="mbr-text mbr-fonts-style display-4 character-text">
                  <v-chip v-for="(lvl, i) in levelNames" :key="i" class="ma-1" color="blue-grey" text-color="white"
                    label link :to="`/facet/${lvl.toLowerCase()}`">
                    {{ lvl }}
                  </v-chip>
                </div>
              </div>

              <!-- AFFILIATES -->
              <div class="item" v-if="affiliatesList.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Affiliates</p>
                <p class="mbr-text mbr-fonts-style display-4 character-text">
                  <span v-for="(af, idx) in affiliatesList" :key="af.id || af.slug || idx">
                    <NuxtLink v-if="af.slug" :to="`/characters/${af.slug}`">{{ af.name }}</NuxtLink>
                    <span v-else>{{ af.name }}</span>
                    <span v-if="idx < affiliatesList.length - 1">, </span>
                  </span>
                </p>
              </div>

              <!-- ABILITIES -->
              <div class="item" v-if="abilitiesList.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Abilities</p>
                <div class="mbr-text mbr-fonts-style display-4 character-text">
                  <v-chip v-for="(ability, index) in abilitiesList" :key="ability.slug || ability.name || index"
                    class="ma-1" color="teal" text-color="white" label link
                    :to="`/facet/${ability.slug || ability.name.toLowerCase()}`">
                    {{ ability.name }}
                  </v-chip>
                </div>
              </div>

              <!-- TOPICS / TAGS -->
              <div class="item" v-if="tagsList.length">
                <p class="item-title mbr-fonts-style display-4 character-text">Topics</p>
                <div class="mbr-text mbr-fonts-style display-4 character-text">
                  <v-chip v-for="(t, idx) in tagsList" :key="t.id || t.slug || idx" class="ma-1" color="deep-orange"
                    text-color="white" label link :to="`/characters/category/${t.slug || t.name.toLowerCase()}`">
                    {{ t.name }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RELATED CONTENT -->
    <div class="characterLowerPage">
      <v-row>
        <v-col cols="12">
          <relatedcharacters />
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
    computed,
    ref,
    watch
  } from 'vue'
  import {
    useHead
  } from '#imports'
  import comments from '~/components/partials/comments.vue'
  import relatedcharacters from '~/components/related/relatedcharacters.vue'

  const route = useRoute()
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  // normalize slug
  const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug)

  // Reactive key: refetches whenever the slug changes
  const {
    data,
    status,
    error
  } = useLazyAsyncData(
    () => `character-${slug.value}`,
    async () => {
      return await $directus.request(
        $readItems('characters', {
          filter: {
            slug: {
              _eq: slug.value
            }
          },
          fields: [
            '*',
            'tags.tags_id.*',
            'character_options.options_id.*',
            'videos.videos_id.*',
            'universe.universe_id.*',
            'stories.stories_id.*',
            'image.*',
            'affiliates.characters_id.*',
            'abilities.abilities_id.*'
          ]
        })
      )
    }
  )


  const character = computed(() => data.value?.[0] || null)
  const loading = computed(() => status.value === 'pending' && !character.value)

  function normalizeType(value) {
    if (!value) return []
    if (Array.isArray(value)) return value.map(v => v.trim().toLowerCase())
    return [value.toString().trim().toLowerCase()]
  }

  const abilitiesList = computed(() => {
    const c = character.value || {}
    if (!Array.isArray(c.character_options)) return []
    return c.character_options
      .filter(o => normalizeType(o?.options_id?.type).includes('abilities'))
      .map(o => ({
        name: o.options_id?.name || '',
        slug: o.options_id?.slug || null
      }))
  })

  const affiliatesList = computed(() => {
    const c = character.value || {}
    if (!Array.isArray(c.affiliates)) return []
    return c.affiliates
      .map(a => a?.characters_id || a)
      .filter(a => a?.name)
      .map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug
      }))
  })

  const tagsList = computed(() => {
    const c = character.value || {}
    if (!Array.isArray(c.tags)) return []
    return c.tags
      .map(t => t?.tags_id || t)
      .filter(t => t?.name)
      .map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug
      }))
  })

  const universeName = computed(() => {
    const u = character.value?.universe
    if (!u) return 'Unknown Universe'
    const candidate = Array.isArray(u) ? (u[0] || {}) : u
    const nested = candidate.universe_id || candidate
    return nested?.name || 'Unknown Universe'
  })

  const isMonster = computed(() => {
    const c = character.value || {}
    if (typeof c.type === 'string') return c.type.trim().toLowerCase() === 'monster'
    if (Array.isArray(c.type)) return c.type.map(t => t.trim().toLowerCase()).includes('monster')
    if (Array.isArray(c.character_options)) {
      return c.character_options.some(o => normalizeType(o?.options_id?.type).includes('monster'))
    }
    return false
  })

  const typeNames = computed(() => {
    const c = character.value || {}
    if (!Array.isArray(c.character_options)) return []
    return c.character_options
      .filter(o => normalizeType(o?.options_id?.type).includes('type'))
      .map(o => o.options_id?.name)
      .filter(Boolean)
  })

  const levelNames = computed(() => {
    const c = character.value || {}
    if (!Array.isArray(c.character_options)) return []
    return c.character_options
      .filter(o => normalizeType(o?.options_id?.type).includes('level'))
      .map(o => o.options_id?.name)
      .filter(Boolean)
  })

  useHead({
    title: computed(() => character.value?.name || 'Character Page')
  })
</script>