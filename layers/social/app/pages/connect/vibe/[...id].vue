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
            <!-- Shoppable vibez: tagged products pop up over the video at their moment -->
            <!-- Members who opted in to WebTorrent (Settings → Accounts) stream it peer-to-peer -->
            <MeeoviPlayer ref="playerRef" :src="p2p.src.value" :poster="playerData.poster" :title="short?.name"
              @timeupdate="currentTime = $event">
              <template v-if="vibeProducts.items.value.length" #overlay>
                <vibeProductPins :items="vibeProducts.items.value" :time="currentTime" />
              </template>
            </MeeoviPlayer>

            <p v-if="short?.description" class="mt-4">{{ short.description }}</p>

            <vibeProductList class="mt-4" :items="vibeProducts.items.value" :can-edit="vibeProducts.canEdit.value"
              @edit="taggerOpen = true" @seek="seek" />
          </v-card-text>

          <v-card-actions>
            <MeeoviRating v-if="short?.id" type="shorts" :id="short.id" />
            <FediverseCounts v-if="short?.id" type="vibe" :id="short.id" class="ml-2" />
            <WebTorrentPeers :source="p2p" class="ml-2" />
            <v-spacer />
            <watchLaterBtn v-if="short?.id" :short-id="short.id" />
            <createListBtn v-if="short" :item="listItem" kind="vibe" />
          </v-card-actions>
        </v-card>
        <vibeProductTagger v-if="vibeProducts.canEdit.value" v-model="taggerOpen" :items="vibeProducts.items.value"
          :current-time="currentTime" :saving="taggerSaving" :error="vibeProducts.error.value" @save="saveTags" />
      </v-col>

      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <MeeoviDiscussion v-if="short?.id" type="vibe" :id="short.id" :title="short?.name" />
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
  import createListBtn from '../../../components/blocks/partials/createListBtn.vue'
  import watchLaterBtn from '../../../components/features/watchLater/watchLaterBtn.vue'
  import { recordPlay } from '../../../composables/media/usePlayHistory'
  import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
  import FediverseCounts from '../../../components/blocks/FediverseCounts.vue'
  import vibeProductPins from '../../../components/features/vibeSections/shop/vibeProductPins.vue'
  import vibeProductList from '../../../components/features/vibeSections/shop/vibeProductList.vue'
  import vibeProductTagger from '../../../components/features/vibeSections/shop/vibeProductTagger.vue'
  import { useVibeProducts } from '../../../composables/vibez/useVibeProducts'
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
    src: getAssetURL(short.value?.video_url || short.value?.video),
    poster: getImageURL(short.value?.thumbnail_url || short.value?.thumbnail),
  }))
  // The peer-to-peer stream when the member opted in and it's running, else the file itself.
  const p2p = useWebTorrentSource(() => playerData.value.src)

  // createListBtn's panel needs a resolved thumbnail URL, not the raw
  // Directus asset reference short.thumbnail holds.
  const listItem = computed(() => ({
    id: short.value?.id,
    name: short.value?.name,
    image: getAssetURL(short.value?.thumbnail_url || short.value?.thumbnail),
  }))

  // [...id].vue is a catch-all route, so route.params.id is an array of
  // path segments rather than a plain string.
  const shortId = computed(() => {
    if (props.vibe !== null && props.vibe !== undefined && props.vibe !== '') return String(props.vibe)
    return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  })

  // Shoppable vibez (composables/vibez/useVibeProducts.ts)
  const vibeProducts = useVibeProducts(shortId)
  const playerRef = ref(null)
  const currentTime = ref(0)
  const taggerOpen = ref(false)
  const taggerSaving = ref(false)
  function seek(seconds) {
    const media = playerRef.value?.media
    if (!media) return
    media.currentTime = seconds
    playerRef.value?.play?.()
  }
  async function saveTags(tags) {
    taggerSaving.value = true
    if (await vibeProducts.save(tags)) taggerOpen.value = false
    taggerSaving.value = false
  }

  async function fetchShort() {
    short.value = await $directus.request($readItem('shorts', shortId.value, {
      fields: ['id', 'name', 'description', 'creator', 'video', 'video_url', 'thumbnail', 'thumbnail_url', 'views'],
    })).catch(() => null)
  }

  // Once per person per day; a creator's own views don't count.
  async function trackView() {
    if (!short.value?.id) return
    const res = await $fetch(`/api/social/views/shorts/${short.value.id}`, { method: 'POST' }).catch(() => null)
    if (res && short.value) short.value = { ...short.value, views: res.views }
  }

  onMounted(async () => {
    await fetchShort()
    // The account's "Watch again" row (features/playHistory/watchAgain.vue).
    recordPlay('watch', short.value?.id)
    await trackView()
  })
      
    definePageMeta({
        middleware: 'auth'
    })

</script>
