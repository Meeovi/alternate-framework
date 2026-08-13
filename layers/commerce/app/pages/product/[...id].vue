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
                v-if="productTypeNames.includes('Audio') || productTypeNames.includes('Video') || productTypeNames.includes('Course')">
                <videoPlayer :player="product" />
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
                <productDetails :productDetails="product" />
              </div>
            </v-col>

            <!--Product Videos-->
            <v-col cols="12" v-if="product?.product_videos?.length">
              <v-sheet class="mx-auto">
                <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                  <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                    v-for="(prodVideo, index) in product?.product_videos" :key="index">
                    <videoPlayer :player="prodVideo?.product_videos_id" @click="toggle" />

                    <div class="d-flex fill-height align-center justify-center">
                      <v-scale-transition>
                        <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                      </v-scale-transition>
                    </div>
                  </v-slide-group-item>
                </v-slide-group>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-card elevation="0">
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
                    <v-card-text style="font-size: 20px;" v-html="product?.content"></v-card-text>
                  </v-card>
                </v-window-item>

                <!--Product Reviews-->
                <v-window-item :value="productbar?.menus?.[1]?.value">
                  <!---<div v-if="product?.reviews?.items?.length > 0">
                  <div v-for="(review, index) in product?.reviews?.items" :key="index">
                    <productReviews :review="review" />
                  </div>
                </div>-->
                  <comments :productName="product?.name"
                    :productImage="`${$directus.url}/assets/${product?.image?.filename_disk}`"
                    :productSku="product?.id" />
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

        <v-col cols="12">
          <!--Crossell Products-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>This product goes great together with...</h4>
            <!--Crossell Products-->
            <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
              <v-slide-group-item v-for="(crossSell, index) in product?.cross_sell_products" :key="index"
                v-slot="{ isSelected, toggle, selectedClass }">
                <productCard :product="crossSell?.products_id" :class="['ma-4', selectedClass]" @click="toggle" />
                <div class="d-flex fill-height align-center justify-center">
                  <v-scale-transition>
                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                  </v-scale-transition>
                </div>
              </v-slide-group-item>
            </v-slide-group>
          </v-sheet>

          <!--Related Products-->
          <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
            <h4>Related Products</h4>
            <div v-if="product?.related_products?.length > 0">
              <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(relatedProduct, index) in product?.related_products" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <productCard :product="relatedProduct?.products_id" :class="['ma-4', selectedClass]"
                    @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
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
              <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(shops, index) in product?.shops" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <shop :shop="shops?.shops_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
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
              <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(shorts, index) in product?.shorts" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <short :short="shorts?.shorts_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
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
              <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-for="(spaces, index) in product?.spaces" :key="index"
                  v-slot="{ isSelected, toggle, selectedClass }">
                  <spacesCard :space="spaces?.spaces_id" :class="['ma-4', selectedClass]" @click="toggle" />
                  <div class="d-flex fill-height align-center justify-center">
                    <v-scale-transition>
                      <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
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
    computed
  } from 'vue';
  import comments from '#social/app/components/blocks/comments.vue'
  import radioCard from '#social/app/components/related/radio.vue'
  import productDetails from '../../components/catalog/product/productDetails.vue'
  import productSpecs from '../../components/catalog/product/productSpecs.vue'
  import productCard from '../../components/catalog/product/productCard.vue'
  import giftCard from '../../components/catalog/product/giftCard.vue'
  import subscriptionCard from '../../components/catalog/product/subscriptionCard.vue'
  import short from '#social/app/components/related/short.vue'
  import spacesCard from '#social/app/components/related/space.vue'
  import videoPlayer from '#shared/app/components/blocks/videoPlayer.vue'
  import shop from '../../components/catalog/shops/stores.vue'
  import productCompare from '../../components/catalog/product/compare.vue'

  const tab = ref(null);
  const model = ref(null);
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

  const {
    $directus,
    $readItem,
    $readItems
  } = useNuxtApp()

  const {
    data: product
  } = await useAsyncData('product', () => {
    const baseFields = ['*',
      'showcases.showcases_id.*',
      'comments.comments_id.*',
      'shorts.shorts_id.*',
      'categories.categories_id.*',
      'spaces.spaces_id.*',
      'shops.shops_id.*',
      'product_types.product_types_id.*',
      'product_videos.product_videos_id.*',
      'image.*',
    ]

    return $directus.request($readItem('products', productId.value, {
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
  })

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
  } = await useAsyncData('groupedProducts', async () => {
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
  } = await useAsyncData('bundledProducts', async () => {
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
  } = await useAsyncData('configurableProducts', async () => {
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
      fields: ['*',
        'image.*',
        'categories.categories_id.*',
        'manufacturer.manufacturer_id.*',
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

  useHead({
    title: computed(() => product?.value?.name || 'Product Page')
  })
</script>