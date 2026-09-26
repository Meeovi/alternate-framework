<template>
  <div>
    <PageLoader v-if="loading" />
    <div v-else>
    <div v-if="story">
      <div class="container my-5 py-5">
        <!-- Section: Design Block -->
        <section class="mb-10">
          <div v-if="story?.image?.filename_disk">
            <img class="img-fluid shadow-1-strong rounded-5 mb-4" height="250" width="250" :alt="story?.name"
              :src="`${$directus.url}assets/${story?.image?.filename_disk}`" cover />
          </div>

          <div v-else><img src="assets/images/coming_soon.png" :alt="story?.name"></div>

          <div class="row align-items-center mb-4">
            <div class="col-lg-7">
              <span> Published <u>{{ new Date(story?.date_created).toLocaleDateString() }}</u></span>
            </div>
          </div>

          <h1 class="fw-bold mb-4">
            {{ story?.name }}
          </h1>

          <p class="storyDesc" v-html="story?.description"></p>
        </section>
      </div>

      <div class="characterLowerPage">
        <v-row>
          <v-toolbar title="Characters in this Story" density="comfortable" color="transparent">
          </v-toolbar>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="(charItem, idx) in story?.characters" :key="charItem?.characters_id?.id || charItem?.id || idx">
            <characters :character="charItem?.characters_id || charItem" />
          </v-col>
        </v-row>
      </div>
    </div>

    <div v-else>
      <p class="storyNotFound">Story not found</p>
    </div>

    <relatedstories />
    <v-divider></v-divider>
    <comments />
  </div>
  </div>
</template>

<script setup>
  import PageLoader from '~/components/partials/PageLoader.vue'
  import comments from '~/components/partials/comments.vue'
  import characters from '~/components/related/character.vue'
  import relatedstories from '~/components/related/relatedstories.vue'
  import { computed } from 'vue'

  const route = useRoute()
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const { data, status } = useLazyAsyncData(() => `story-${route.params.slug}`, () => {
    return $directus.request($readItems('stories', {
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        }
      },
      fields: [
        '*',
        'image.*',
        'characters.characters_id.*',
        'options.options_id.*',
        'universe.universe_id.*',
        'tags.tags_id.*'
      ]
    }))
  })

  // Directus returns an array for readItems; normalize to a single story
  const story = computed(() => (Array.isArray(data.value) ? data.value[0] : data.value))
  const loading = computed(() => status.value === 'pending' && !story.value)

  useHead({
    title: computed(() => story.value?.name || 'Story Page')
  })
</script>