<template>
  <v-container class="py-10">
    <v-row>
      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <v-card-title>{{ short?.name }}</v-card-title>
          <v-card-subtitle>
            {{ short?.creator || 'Anonymous' }} • Views: {{ short?.views || 0 }}
          </v-card-subtitle>

          <v-card-text>
            <videoPlayer :player="playerData"
              style="width: 100%; min-height: 100%;" />

            <p v-if="short?.description" class="mt-4">{{ short.description }}</p>
          </v-card-text>

          <v-card-actions>
            <LikeButton v-if="short?.id" target-type="shorts" :target-id="short.id" />
            <v-spacer />
            <createListBtn v-if="short" :item="listItem" kind="vibe" />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <comments v-if="short?.id" :comment-id="String(short.id)" :story-url="`/connect/vibe/${short.id}`" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  // Previously queried the `videos` collection (a separate, parallel
  // vibez implementation backed by MinIO — MINIO_ACCESS_KEY/SECRET_KEY/
  // BUCKET/REGION are all blank in .env, so that path can't work
  // regardless of code). shorts.vue's "View Vibe" link passes a real
  // shorts.id here, so this page needs to read the same `shorts`
  // collection shorts.vue itself uses, not `videos` — otherwise this
  // always rendered nothing (or, worse, an unrelated row if the id
  // spaces happened to overlap).
  import {
    useRoute
  } from 'vue-router'
  import comments from '../../../components/blocks/comments.vue'
  import createListBtn from '../../../components/blocks/partials/createListBtn.vue'
  import LikeButton from '../../../components/blocks/LikeButton.vue'
  import videoPlayer from '#shared/app/components/blocks/videoPlayer.vue'
  import { getAssetURL } from '#shared/app/utils/get-asset-url'
  import {
    ref,
    computed,
    onMounted
  } from '#imports'

  // Also embedded directly as a component (layers/social's livebar dialog
  // passes the clicked short's id via this prop) rather than only ever
  // being routed to as a page — route.params.id is empty in that context,
  // so it must win over the route param when given.
  const props = defineProps({
    vibe: {
      type: [String, Number],
      default: null,
    },
  })

  const route = useRoute()
  const { $directus, $readItem } = useNuxtApp()

  const short = ref(null)

  const playerData = computed(() => ({
    sources: [{ src: getAssetURL(short.value?.video) }],
    poster: getAssetURL(short.value?.thumbnail),
  }))

  // createListBtn's panel needs a resolved thumbnail URL, not the raw
  // Directus asset reference short.thumbnail holds.
  const listItem = computed(() => ({
    id: short.value?.id,
    name: short.value?.name,
    image: getAssetURL(short.value?.thumbnail),
  }))

  // [...id].vue is a catch-all route, so route.params.id is an array of
  // path segments rather than a plain string.
  const shortId = computed(() => {
    if (props.vibe !== null && props.vibe !== undefined && props.vibe !== '') return String(props.vibe)
    return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  })

  async function fetchShort() {
    short.value = await $directus.request($readItem('shorts', shortId.value, {
      fields: ['id', 'name', 'description', 'creator', 'video', 'thumbnail', 'views'],
    })).catch(() => null)
  }

  async function trackView() {
    await $fetch('/api/view-video', {
      method: 'POST',
      body: { videoId: shortId.value },
    }).catch(() => {})
  }

  onMounted(async () => {
    await fetchShort()
    await trackView()
  })
      
    definePageMeta({
        middleware: 'auth'
    })

</script>
