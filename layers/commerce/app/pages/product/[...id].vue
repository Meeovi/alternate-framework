<template>
  <div class="contentPage">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="product">
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <div>
                <productDetails :productDetails="product" />
              </div>
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
              <v-tab value="six" v-if="product?.type === 'Grouped Product'">Products</v-tab>
              <v-tab value="seven" v-if="product?.type === 'Bundled Product'">Products</v-tab>
              <v-tab value="eight" v-if="product?.type === 'Configurable Product'">Products</v-tab>
              <v-tab value="nine" v-if="product?.product_types?.product_types_id?.name === 'Gift Card'">Redeem</v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="tab">
                <!--Product Description-->
                <v-window-item :value="productbar?.menus[0]?.value">
                  <v-card variant="text">
                    <v-card-text style="font-size: 20px;" v-dompurify-html="product?.content"></v-card-text>
                  </v-card>
                </v-window-item>

                <!--Product Reviews-->
                <v-window-item :value="productbar?.menus[1]?.value">
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
                <v-window-item :value="productbar?.menus[2]?.value">
                  <productSpecs :product="product" />
                </v-window-item>

                <!--Product FAQs-->
                <v-window-item :value="productbar?.menus[3]?.value">
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
                  <v-row v-if="product?.type === 'Grouped Product'">
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
                  <v-row v-if="product?.type === 'Bundled Product'">
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
                  <v-row v-if="product?.type === 'Configurable Product'">
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
                  <v-row v-if="product?.product_types?.product_types_id?.name === 'Gift Card'">
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
                  <spaces :space="spaces?.spaces_id" :class="['ma-4', selectedClass]" @click="toggle" />
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
      </v-row>
    </div>
    <div v-else>No product found</div>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    watch
  } from 'vue';
  import comments from '#social/app/components/blocks/comments.vue'

  import productDetails from '../../components/catalog/product/productDetails.vue'
  import productSpecs from '../../components/catalog/product/productSpecs.vue'
  import productCard from '../../components/catalog/product/productCard.vue'
  import giftCard from '../../components/catalog/product/giftCard.vue'
  import short from '#social/app/components/related/short.vue'
  import spaces from '#social/app/components/related/space.vue'
  import shop from '../../components/catalog/shops/stores.vue'

  const tab = ref(null);
  const model = ref(null);
  const error = ref(null);
  const loading = ref(false)

  // Product query
  const route = useRoute()

  const { $commerce } = useNuxtApp()

  const { data: product } = await useAsyncData('product', async () => {
    return await $commerce.getProduct(route.params.id)
  })

  // Grouped/bundled products: Magento provider currently doesn't expose
  // these specific relations via the generic interface. Fetch a small page
  // of products as a fallback so the UI can render product cards.
  const { data: groupedProducts } = await useAsyncData('groupedProducts', async () => {
    return await $commerce.getProducts({ pageSize: 6 })
  })

  const { data: bundledProducts } = await useAsyncData('bundledProducts', async () => {
    return await $commerce.getProducts({ pageSize: 6 })
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

  import { addViewed } from '../../composables/products/useRecentlyViewed'

  watch(product, (newVal) => {
    if (process.client && newVal?.id) {
      addViewed(newVal.id)
    }
  }, { immediate: true })
</script>