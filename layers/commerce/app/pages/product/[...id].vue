<template>
  <div class="contentPage">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="product">
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">

              <!--If the Product is a digital product-->
              <div
                v-if="hasVideoLink || productTypeNames.includes('Audio') || productTypeNames.includes('Video') || productTypeNames.includes('Course')">
                <!-- A video added by link plays in its platform's player (meeovi-video-bookmarks) -->
                <template v-if="hasVideoLink">
                  <component :is="videoEmbed" v-if="videoEmbed !== 'VideoEmbed'" :embed-url="product.video_link_embed_url"
                    :provider="product.video_link_provider" :title="product?.name" />
                  <p class="mt-2 text-medium-emphasis">
                    <a :href="product.video_link_url" target="_blank" rel="noopener nofollow ugc">Watch on {{ videoLinkLabel }}</a>
                  </p>
                </template>
                <!-- A Video product's tagged products pop up over it at their moment -->
                <MeeoviPlayer v-else ref="playerRef" :src="getAssetURL(product?.file)" :type="product?.file?.type"
                  :kind="productTypeNames.includes('Audio') ? 'audio' : undefined"
                  :poster="getImageURL(product?.image)" :title="product?.name"
                  @timeupdate="currentTime = $event">
                  <template v-if="isVideo && videoProducts.items.value.length" #overlay>
                    <vibeProductPins :items="videoProducts.items.value" :time="currentTime" />
                  </template>
                </MeeoviPlayer>
              </div>

              <!--If the Product is a Gift Card-->
              <div v-else-if="productTypeNames.includes('Gift Card')">
                <giftCard :gift="product" />
              </div>

              <!--If the Product/Content is a Radio Station-->
              <div v-else-if="productTypeNames.includes('Radio')">
                <radioCard :radio="product" />
              </div>

              <!--If the Product is any other type-->
              <div v-else>
                <productDetails :productDetails="product" @discussion="openDiscussion" />
              </div>

              <!-- Players, gift cards and radio stations don't show productDetails
                   (which has its own Report button). -->
              <div v-if="!showsDetails && canonicalProductKey(product)" class="d-flex justify-end mt-2">
                <ReportToModerators network="meeovi" :subject="{ kind: 'product', id: canonicalProductKey(product) }" />
              </div>
            </v-col>

            <!--Product Videos-->
            <v-col cols="12" v-if="product?.product_videos?.length">
              <v-sheet class="mx-auto">
                <v-slide-group v-model="videoModel" class="pa-4" selected-class="bg-success" show-arrows>
                  <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                    v-for="(prodVideo, index) in product?.product_videos" :key="index">
                    <MeeoviPlayer
                      :src="getAssetURL(prodVideo?.product_videos_id?.video || prodVideo?.product_videos_id?.file || prodVideo?.product_videos_id)"
                      :title="prodVideo?.product_videos_id?.name" @click="toggle" />

                    <div class="d-flex fill-height align-center justify-center">
                      <v-scale-transition>
                        <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                      </v-scale-transition>
                    </div>
                  </v-slide-group-item>
                </v-slide-group>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>

        <!-- Products in this video (products_tagged; the video's seller tags them) -->
        <v-col cols="12" v-if="isVideo && (videoProducts.items.value.length || videoProducts.canEdit.value)">
          <vibeProductList :items="videoProducts.items.value" :can-edit="videoProducts.canEdit.value"
            title="Products in this video" noun="video" @edit="taggerOpen = true" @seek="seek" />
          <vibeProductTagger v-if="videoProducts.canEdit.value" v-model="taggerOpen" noun="video"
            :items="videoProducts.items.value" :current-time="currentTime" :saving="taggerSaving"
            :error="videoProducts.error.value" @save="saveTags" />
        </v-col>

        <v-col cols="12">
          <!-- scroll-margin clears the sticky header when Discussion scrolls here -->
          <v-card id="discussion" elevation="0" style="scroll-margin-top: 80px;">
            <v-tabs v-model="tab" :bg-color="productbar?.color">
              <div v-for="(menu, index) in productbar?.menus" :key="index">
                <v-tab v-if="menu?.active === 'Active'" :value="menu?.value">{{ menu?.name }}</v-tab>
              </div>
              <!-- <v-tab value="four">FAQS</v-tab>
            <v-tab value="five">Compare</v-tab>-->
              <v-tab value="six" v-if="productTypeNames.includes('Grouped Product')">Products</v-tab>
              <v-tab value="seven"
                v-if="productTypeNames.includes('Bundled Product')">Products</v-tab>
              <v-tab value="eight"
                v-if="productTypeNames.includes('Configurable Product')">Products</v-tab>
              <v-tab value="nine" v-if="productTypeNames.includes('Gift Card')">Redeem</v-tab>
              <v-tab value="ten"
                v-if="productTypeNames.includes('Subscription')">Details</v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="tab">
                <!--Product Description-->
                <v-window-item :value="productbar?.menus?.[0]?.value">
                  <v-card variant="text">
                    <v-card-text style="font-size: 20px;" v-dompurify-html="product?.content || product?.description"></v-card-text>
                  </v-card>
                </v-window-item>

                <!--Product Reviews-->
                <v-window-item :value="productbar?.menus?.[1]?.value">
                  <!---<div v-if="product?.reviews?.items?.length > 0">
                  <div v-for="(review, index) in product?.reviews?.items" :key="index">
                    <productReviews :review="review" />
                  </div>
                </div>-->
                  <MeeoviDiscussion v-if="product?.id" type="product" :id="product.id" :title="product?.name" />
                </v-window-item>

                <!--Product Specifications-->
                <v-window-item :value="productbar?.menus?.[2]?.value">
                  <productSpecs :product="product" />
                </v-window-item>

                <!--Product FAQs-->
                <v-window-item :value="productbar?.menus?.[3]?.value">
                  <v-expansion-panels v-for="(faqs, index) in product?.faqs?.faqs_id" :key="index">
                    <v-expansion-panel :title="faqs.question" :text="faqs.answer">
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-window-item>

                <!--Product Compare List
                <v-window-item :value="productbar?.menus[4]?.value">
                  <productCompare />
                </v-window-item>-->

                <!-- Group Products List -->
                <v-window-item value="six">
                  <v-row v-if="productTypeNames.includes('Grouped Product')">
                    <v-col cols="4" v-for="item in groupedProducts?.products" :key="item">
                      <productCard :product="item?.products_id" />
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col cols="12">
                      <p>No products in this group.</p>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!--Bundle Products List-->
                <v-window-item value="seven">
                  <v-row v-if="productTypeNames.includes('Bundled Product')">
                    <v-col cols="4" v-for="(product, index) in bundledProducts?.products" :key="index">
                      <productCard :product="product?.products_id" />
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col cols="12">
                      <p>No products in this bundle.</p>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!--Configurable Products List-->
                <v-window-item value="eight">
                  <v-row v-if="productTypeNames.includes('Configurable Product')">
                    <v-col cols="4" v-for="(product, index) in configurableProducts?.products" :key="index">
                      <productCard :product="product?.products_id" />
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col cols="12">
                      <p>No products in this configuration.</p>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!--Gift Cards Redeem Information-->
                <v-window-item value="nine">
                  <v-row v-if="productTypeNames.includes('Gift Card')">
                    <v-col cols="12">
                      <giftCard :gift="product" />
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col cols="12">
                      <p>Not a valid Gift Card.</p>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!--Subscription Information-->
                <v-window-item value="ten">
                  <v-row v-if="productTypeNames.includes('Subscription')">
                    <v-col cols="12">
                      <subscriptionCard :subscription="product" />
                    </v-col>
                  </v-row>

                  <v-row v-else>
                    <v-col cols="12">
                      <p>Not a valid Subscription.</p>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Discovery: the creator's other videos (and vibez), or the seller's other products -->
        <v-col cols="12" v-if="sellerLookupKey">
          <moreFromSeller :product-key="sellerLookupKey" :kind="isVideo ? 'videos' : 'products'" />
        </v-col>

        <v-col cols="12">
          <!--Crossell Products-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>This product goes great together with...</h4>
            <!--Crossell Products-->
            <v-slide-group v-model="crossSellModel" class="pa-4" selected-class="bg-success" show-arrows>
              <v-slide-group-item v-for="(crossSell, index) in product?.cross_sell_products" :key="index"
                v-slot="{ isSelected, toggle, selectedClass }">
                <productCard :product="crossSell?.products_id" :class="['ma-4', selectedClass]" @click="toggle" />
                <div class="d-flex fill-height align-center justify-center">
                  <v-scale-transition>
                    <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                  </v-scale-transition>
                </div>
              </v-slide-group-item>
            </v-slide-group>
          </v-sheet>

          <!--Related Products-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>Related Products</h4>
            <div v-if="product?.related_products?.length > 0">
              <v-slide-group v-model="relatedModel" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(relatedProduct, index) in product?.related_products" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <productCard :product="relatedProduct?.products_id" :class="['ma-4', selectedClass]"
                    @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                    </v-scale-transition>
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </div>
            <div v-else>
              <p>No related products available.</p>
            </div>
          </v-sheet>

          <!--Product featured in Shops-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>Product featured in these Shops</h4>
            <div v-if="product?.shops?.length > 0">
              <v-slide-group v-model="shopsModel" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(shops, index) in product?.shops" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <shop :shop="shops?.shops_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                    </v-scale-transition>
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </div>
            <div v-else>
              <p>Not featured in any shops.</p>
            </div>
          </v-sheet>

          <!--Product featured in Vibez-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>Product featured in these Vibez</h4>
            <div v-if="product?.shorts?.length > 0">
              <v-slide-group v-model="shortsModel" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(shorts, index) in product?.shorts" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <short :short="shorts?.shorts_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                    </v-scale-transition>
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </div>
            <div v-else>
              <p>Not featured in any shorts.</p>
            </div>
          </v-sheet>

          <!--Product featured in Spaces-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>Product featured in these Spaces</h4>
            <div v-if="product?.spaces?.length > 0">
              <v-slide-group v-model="spacesModel" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(spaces, index) in product?.spaces" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <spacesCard :space="spaces?.spaces_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                    </v-scale-transition>
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </div>
            <div v-else>
              <p>Not featured in any spaces.</p>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" v-if="productComparison.length > 1">
          <h4>Compare with similar products</h4>
          <productCompare :products="productComparison" />
        </v-col>
      </v-row>
    </div>
    <div v-else>No product found</div>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    watch,
    resolveComponent
  } from 'vue';
  import radioCard from '#social/app/components/related/radio.vue'
  import productDetails from '../../components/catalog/product/productDetails.vue'
  import productSpecs from '../../components/catalog/product/productSpecs.vue'
  import productCard from '../../components/catalog/product/productCard.vue'
  import giftCard from '../../components/catalog/product/giftCard.vue'
  import subscriptionCard from '../../components/catalog/product/subscriptionCard.vue'
  import short from '#social/app/components/related/short.vue'
  import spacesCard from '#social/app/components/related/space.vue'
  import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
  import shop from '../../components/catalog/shops/stores.vue'
  import productCompare from '../../components/catalog/product/compare.vue'
  import { CommerceBackendRegistry } from 'alternate-sdk'
  import { canonicalProductKey, parseProductKey } from '../../utils/productKey'
  import ReportToModerators from '#social/app/components/blocks/ReportToModerators.vue'
  import { PRODUCT_FIELDS } from '../../utils/productFields'
  // A product card's fields, for the cross-sell and related products sliders.
  const CARD_FIELDS = ['id', 'name', 'slug', 'sku', 'mageos_sku', 'source', 'price', 'image', 'image_url', 'seller_name', 'seller_username', 'download_url', 'allow_free_download']
  import { authClient } from '#auth/lib/auth-client'
  import moreFromSeller from '../../components/catalog/product/moreFromSeller.vue'
  import vibeProductPins from '#social/app/components/features/vibeSections/shop/vibeProductPins.vue'
  import vibeProductList from '#social/app/components/features/vibeSections/shop/vibeProductList.vue'
  import vibeProductTagger from '#social/app/components/features/vibeSections/shop/vibeProductTagger.vue'
  import { useVibeProducts } from '#social/app/composables/vibez/useVibeProducts'

  const tab = ref(null);
  // Each v-slide-group needs its own model — they used to all share one
  // `model` ref, so selecting/toggling an item in any slider fed a change
  // back into every other slider's modelValue at once. Vuetify's
  // VSlideGroup reacts to modelValue changes by re-checking scroll offset
  // and can write back an adjusted value, so N sliders watching the same
  // ref bounced updates off each other — on a layout change (e.g. a
  // window resize) this cascaded into "Maximum recursive updates
  // exceeded in component <VSlideGroup>", a hydration crash, and a 500.
  const videoModel = ref(null);
  const crossSellModel = ref(null);
  const relatedModel = ref(null);
  const shopsModel = ref(null);
  const shortsModel = ref(null);
  const spacesModel = ref(null);
  const error = ref(null);
  const loading = ref(false)

  // Product query
  const route = useRoute()

  // [...id].vue is a catch-all route, so route.params.id is an array of
  // segments — Directus's readItem() expects a scalar primary key, not an
  // array, so this must be unwrapped before every lookup below.
  const productId = computed(() =>
    Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  )

  // product_types is a M2M relation (an array of junction rows), not a
  // single object — `product?.product_types?.product_types_id?.name` was
  // reading a property off an array and always evaluating to undefined,
  // so every type-specific branch in this template (digital-content
  // player, gift card, radio station, grouped/bundled/configurable tabs)
  // silently never matched. Collected once here into a plain list of
  // names so the template can just check membership.
  const productTypeNames = computed(() =>
    (product.value?.product_types || [])
      .map((pt) => pt?.product_types_id?.name)
      .filter(Boolean)
  )
  // Same order as the template: players, gift cards and radio stations
  // replace productDetails.
  const showsDetails = computed(() => !/^https:\/\//.test(String(product.value?.video_link_embed_url || ''))
    && !['Audio', 'Video', 'Course', 'Gift Card', 'Radio'].some((name) => productTypeNames.value.includes(name)))

  const {
    $directus,
    $readItem,
    $readItems
  } = useNuxtApp()


  // Keyed by the product: with a fixed key, moving from one product to
  // another inside the site (a similar or recently viewed product) reused
  // the first product's data and the page never changed.
  const {
    data: product
  } = await useAsyncData(() => `product-${productId.value}`, async () => {
    // Named columns, not '*': see utils/productFields.ts (uncached 13–21 s → about 3 s).
    const baseFields = [...PRODUCT_FIELDS,
      'showcases.showcases_id.*',
      'comments.comments_id.*',
      'shorts.shorts_id.*',
      // Only what's shown: a category's `*` carried the ids of every product
      // in it, and cost 3–4 s a read on its own.
      'categories.categories_id.id', 'categories.categories_id.name', 'categories.categories_id.slug',
      'spaces.spaces_id.*',
      'shops.shops_id.*',
      'product_types.product_types_id.*',
      'product_videos.product_videos_id.*',
      // Without these, cross_sell_products/related_products come back as
      // junction rows with no nested product — every card in those two
      // sliders rendered with product=undefined.
      ...CARD_FIELDS.map((f) => `cross_sell_products.products_id.${f}`),
      ...CARD_FIELDS.map((f) => `related_products.products_id.${f}`),
      // products_tags junction — unexpanded it's bare row ids, which gave
      // <RelatedTag> an undefined tag.
      'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug',
      'image.*',
    ]

    // `magento:<sku>`: a product the commerce backend owns (see
    // utils/productKey.ts) — read it from that backend's adapter.
    const backendKey = parseProductKey(String(productId.value ?? ''))
    if (backendKey) {
      const backend = CommerceBackendRegistry.get(backendKey.backend)
      const found = backend ? await backend.request({ method: 'GET', collection: 'products', key: backendKey.key }).catch(() => null) : null
      if (!found) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
      // The store adapter doesn't return a free product's download; the
      // Directus mirror keeps it (download_url, set only when the product is
      // free and the seller allows it), so the Download button can show.
      // A linked video's player comes from the mirror too (video_link_* fields).
      const MIRROR_FIELDS = ['download_url', 'video_link_url', 'video_link_embed_url', 'video_link_provider', 'video_link_id', 'product_types.product_types_id.name']
      const mirrored = await $directus.request($readItems('products', {
        filter: { mageos_sku: { _eq: backendKey.key } },
        fields: MIRROR_FIELDS,
        limit: 1,
      })).catch(() => null)
      const row = (mirrored?.data ?? mirrored)?.[0]
      if (!row) return found
      return {
        ...found,
        download_url: found.download_url || row.download_url || undefined,
        ...(row.video_link_embed_url ? {
          video_link_url: row.video_link_url, video_link_embed_url: row.video_link_embed_url,
          video_link_provider: row.video_link_provider, video_link_id: row.video_link_id,
          product_types: found.product_types?.length ? found.product_types : row.product_types,
        } : {}),
      }
    }

    try {
      return await $directus.request($readItem('products', productId.value, {
        fields: [...baseFields, 'currency.currency_id.*']
      })).catch(() => {
        // The Directus `currency` collection is currently returning a server
        // error on any request that expands currency.currency_id.* — fall
        // back to the raw foreign key so the product page still renders
        // instead of failing outright. Remove this fallback once that
        // collection is fixed on the Directus side.
        return $directus.request($readItem('products', productId.value, {
          fields: [...baseFields, 'currency.currency_id']
        }))
      })
    } catch (directusError) {
      // Directus doesn't have this id — either the record was removed, or
      // it's a bare key from a commerce backend (a search hit by sku). Ask
      // each enabled backend, which return Directus-shaped products. The
      // lookup is by id/sku (never slug) — backends don't all expose one.
      const key = String(productId.value)
      for (const backend of CommerceBackendRegistry.list()) {
        if (backend.id === 'directus' || !backend.isEnabled()) continue
        const found = await backend.request({ method: 'GET', collection: 'products', key }).catch(() => null)
        if (found) return found
      }
      throw directusError
    }
  })

  // A Video product is also the site's video page.
  const isVideo = computed(() => productTypeNames.value.includes('Video'))
  // A video added by link (video_link_* fields, @mframework/meeovi-video-bookmarks).
  const hasVideoLink = computed(() => /^https:\/\//.test(String(product.value?.video_link_embed_url || '')))
  const videoEmbed = resolveComponent('VideoEmbed')
  const VIDEO_LINK_LABELS = { youtube: 'YouTube', vimeo: 'Vimeo', dailymotion: 'Dailymotion', tiktok: 'TikTok', peertube: 'PeerTube' }
  const videoLinkLabel = computed(() => VIDEO_LINK_LABELS[product.value?.video_link_provider] || 'its site')
  // The product's key for the discovery and tagging lookups: a store
  // product's `magento:<sku>`, else its Directus id.
  const sellerLookupKey = computed(() => (product.value ? canonicalProductKey(product.value) : ''))

  // "Products in this video": same tags, pins and tagger as shoppable vibez
  // (composables/vibez/useVibeProducts.ts), stored per video product.
  const videoKey = computed(() => (isVideo.value ? sellerLookupKey.value : null))
  const videoProducts = useVibeProducts(videoKey, '/api/social/videos')
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
    if (await videoProducts.save(tags)) taggerOpen.value = false
    taggerSaving.value = false
  }

  // readItem fetches a single item by primary key and doesn't accept a
  // filter param at all (confirmed: throws 403) — these three need
  // readItems instead, filtering on id + product_types together so the
  // result is only non-empty when this specific product really is that
  // type. `products.products_id.*` also isn't a real field — there's no
  // self-referential relation on `products` for "which products make up
  // this bundle/group" in the live schema, so that sub-products list
  // can't be populated from real data; dropped rather than requesting a
  // nonexistent field.
  const {
    data: groupedProducts
  } = await useAsyncData(() => `groupedProducts-${productId.value}`, async () => {
    const results = await $directus.request($readItems('products', {
      fields: ['*', 'image.*'],
      filter: {
        id: { _eq: productId.value },
        product_types: {
          product_types_id: {
            name: { _eq: "Grouped Product" }
          }
        }
      },
      limit: 1
    }))
    return results?.[0] ?? null
  })

  const {
    data: bundledProducts
  } = await useAsyncData(() => `bundledProducts-${productId.value}`, async () => {
    const results = await $directus.request($readItems('products', {
      fields: ['*', 'image.*'],
      filter: {
        id: { _eq: productId.value },
        product_types: {
          product_types_id: {
            name: { _eq: "Bundled Product" }
          }
        }
      },
      limit: 1
    }))
    return results?.[0] ?? null
  })

  const {
    data: configurableProducts
  } = await useAsyncData(() => `configurableProducts-${productId.value}`, async () => {
    const results = await $directus.request($readItems('products', {
      fields: ['*', 'image.*'],
      filter: {
        id: { _eq: productId.value },
        product_types: {
          product_types_id: {
            name: { _eq: "Configurable Product" }
          }
        }
      },
      limit: 1
    }))
    return results?.[0] ?? null
  })

  const categoryIds = computed(() => {
    return (product.value?.categories || [])
      .map((category) => category?.categories_id?.id)
      .filter((id) => id !== undefined && id !== null)
  })

  const {
    data: similarProducts
  } = await useAsyncData('similarProducts', () => {
    if (!product.value?.id || !categoryIds.value.length) {
      return Promise.resolve([])
    }

    return $directus.request($readItems('products', {
      // products has no `manufacturer` relation: asking for it made Directus
      // refuse the whole query, so the comparison never had similar products.
      fields: [...PRODUCT_FIELDS,
        'image.*',
        'categories.categories_id.id', 'categories.categories_id.name',
      ],
      filter: {
        _and: [{
            id: {
              _neq: product.value.id
            } // Exclude the current product
          },
          {
            categories: {
              categories_id: {
                id: {
                  _in: categoryIds.value
                } // Match any of the current product's category IDs
              }
            }
          }
        ]
      },
      limit: 2 // Compare against the top 2 similar products
    }))
  }, {
    watch: [categoryIds]
  })

  // The current product plus its top 2 similar products, for side-by-side comparison
  const productComparison = computed(() => {
    if (!product.value) return []
    return [product.value, ...(similarProducts.value || [])]
  })

  const {
    data: productBlocks
  } = await useAsyncData('productBlocks', () => {
    return $directus.request($readItem('page_blocks', '8', {
      fields: ['*', 'media.directus_files_id.filename_disk', 'content.*'],
    }))
  })

  const {
    data: productbar
  } = await useAsyncData('productbar', () => {
    return $directus.request($readItem('navigation', '52'))
  })

  // "Discussion" beside the rating (and a link to /product/<key>#discussion):
  // the comments are in the Reviews tab, so open it and scroll to the tabs.
  const openDiscussion = async () => {
    const reviews = productbar.value?.menus?.[1]?.value
    if (reviews) tab.value = reviews
    await nextTick()
    document.getElementById('discussion')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // On a page opened at #discussion, after the router's own hash scroll
  // (which ignores the header and ran last otherwise).
  onMounted(() => {
    if (route.hash === '#discussion') onNuxtReady(() => setTimeout(openDiscussion, 300))
  })

  // "Recently Viewed" on the home page: a signed-in member's product views
  // are kept with their account (play history, kind `view`).
  const recordView = async (item) => {
    const key = canonicalProductKey(item)
    if (!key) return
    const { data } = await authClient.getSession().catch(() => ({ data: null }))
    if (!data?.user) return
    $fetch('/api/social/play-history', { method: 'POST', body: { kind: 'view', id: key } }).catch(() => {})
  }
  onMounted(() => onNuxtReady(() => recordView(product.value)))
  watch(() => product.value?.id, (id, previous) => { if (id && previous && id !== previous) recordView(product.value) })

  useHead({
    title: computed(() => product?.value?.name || 'Product Page')
  })
</script>