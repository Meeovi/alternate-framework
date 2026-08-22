<template>
  <div class="contentPage">
    <v-card class="mx-auto" max-width="100%">
      <v-img class="align-end text-white" height="300" v-if="shop?.image" :src="getAssetURL(shop?.image)"
        :alt="shop?.name" cover>
        <v-card-title style="text-align: center;">{{ shop?.name }}</v-card-title>
      </v-img>

      <v-img class="align-end text-white" height="300" v-else src="https://placehold.net/6-800x600.png"
        :alt="shop?.name" cover>
        <v-card-title style="text-align: center;">{{ shop?.name }}</v-card-title>
      </v-img>
      <v-toolbar>
        <v-toolbar-title>
          <NuxtLink :to="shop?.website">{{ shop?.website }}</NuxtLink>
        </v-toolbar-title>

        <v-toolbar-items style="position: relative; top: 7px; padding-right: 5px;">
          <followBtn style="position: relative; top: 13px; padding-right: 5px;" />

          <share />
        </v-toolbar-items>
      </v-toolbar>
    </v-card>

    <!--Product Videos-->
    <v-row>
      <v-col cols="12" v-if="shop?.shorts?.length">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
              v-for="(shopShort, index) in shop?.shorts" :key="index">
              <shortsCard :short="shopShort" @click="toggle" />

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

    <v-card elevation="0">
      <v-tabs v-model="tab" :bg-color="shopbar?.color" align-tabs="center">
        <v-tab v-if="shopbar?.menus?.length" v-for="(menu, index) in shopbar?.menus" :key="index" :value="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item :value="0">
          <div v-if="shop?.products?.length" v-for="(products, index) in shop?.products" :key="index">
            <productCard :product="products?.products_id" />
          </div>

          <div class="text-center">{{ shop?.name }} has no products available</div>
        </v-tabs-window-item>

        <v-tabs-window-item :value="1">
          <div v-if="shop?.showcases?.length" v-for="(showcases, index) in shop?.showcases" :key="index">
            <showcasesCard :product="showcases?.showcases_id" />
          </div>

          <div class="text-center">{{ shop?.name }} has no showcases available</div>
        </v-tabs-window-item>

        <v-tabs-window-item :value="2">
          <div v-if="shop?.comments?.length" v-for="(comments, index) in shop?.comments" :key="index">
            <commentsCard :commentId="comments?.comments_id" />
          </div>

          <div class="text-center">{{ shop?.name }} has no comments available</div>
        </v-tabs-window-item>

        <v-tabs-window-item :value="3">
          <div v-if="shop?.spaces?.length" v-for="(spaces, index) in shop?.spaces" :key="index">
            <spacesCard :space="spaces?.spaces_id" />
          </div>

          <div class="text-center">{{ shop?.name }} has no spaces available</div>
        </v-tabs-window-item>

        <v-tabs-window-item :value="4">
          <div v-if="shopEvents?.length" v-for="(events, index) in shopEvents" :key="index">
            <productCard :product="events?.products_id" />
          </div>

          <div class="text-center">{{ shop?.name }} has no events available</div>
        </v-tabs-window-item>

        <v-tabs-window-item :value="5">
          <v-card class="mx-auto" elevation="0" max-width="100%">
            <v-toolbar image="https://placehold.net/9-800x600.png">
              <v-toolbar-title style="text-align: center; color: white;">About {{ shop?.name }}</v-toolbar-title>
            </v-toolbar>
            <v-card-subtitle class="pt-4">
              <p v-if="shop?.store_email">Email: {{ shop?.store_email }}</p>

              <p v-else>Email: Not provided</p>
            </v-card-subtitle>

            <v-card-text>
              <div v-if="shop?.store_phone">
                <p>Phone: {{ shop?.store_phone }}</p>
              </div>

              <div v-else>
                <p>Phone: Not provided</p>
              </div>

              <div v-if="shop?.store_address">
                <p>Address: {{ shop?.store_address }}</p>
              </div>

              <div v-else>
                <p>Address: Not provided</p>
              </div>

              <div v-if="shop?.store_country">
                <p>Country: {{ shop?.store_country }}</p>
              </div>

              <div v-else>
                <p>Country: Not provided</p>
              </div>

              <div v-if="shop?.store_shipping_policy">
                <p>Shipping Policy: {{ shop?.store_shipping_policy }}</p>
              </div>

              <div v-else>
                <p>Shipping Policy: Not provided</p>
              </div>

              <p class="card-text mbr-fonts-style display-7" v-dompurify-html="shop?.description"></p>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </div>
</template>

<script setup>
  import {
    getAssetURL
  } from '#shared/app/utils/get-asset-url'
  import {
    ref
  } from '#imports'
  import showcasesCard from '#commerce/app/components/catalog/product/relatedproducts.vue'
  import productCard from '../../components/catalog/product/productCard.vue'
  import commentsCard from '#social/app/components/blocks/comments.vue'
  import spacesCard from '#social/app/components/related/space.vue'
  import shortsCard from '#social/app/components/related/short.vue'
  import followBtn from '#social/app/components/blocks/FollowButton.vue'
  import share from '#social/app/components/blocks/share.vue'

  const route = useRoute();
  const tab = ref(null);
  const {
    $directus,
    $readItem,
    $readItems
  } = useNuxtApp()

  const {
    data: shop
  } = await useAsyncData('shop', async () => {
    const result = await $directus.request($readItems('shops', {
      fields: ['*',
        'media.*',
        'spaces.spaces_id.*',
        'events.events_id.*',
        'products.products_id.*',
        'products.products_id.image.*',
        'showcases.showcases_id.*',
        'comments.comments_id.*',
        'shorts.shorts_id.*',
        'image.*',
        'country.country_id.*'
      ],
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        }
      },
      limit: 1
    }))
    return Array.isArray(result) ? result[0] : null
  })

  const {
    data: shopEvents
  } = await useAsyncData('shopEvents', async () => {
    const result = await $directus.request($readItems('shops', {
      fields: ['*',
        'media.*',
        'spaces.spaces_id.*',
        'events.events_id.*',
        'products.products_id.*',
        'products.products_id.image.*',
        'showcases.showcases_id.*',
        'comments.comments_id.*',
        'shorts.shorts_id.*',
        'image.*',
        'country.country_id.*'
      ],
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        },
        products: {
          products_id: {
            products_types: {
              products_types_id: {
                name: {
                  _eq: 'Event'
                }
              }
            }
          }
        }
      },
      limit: 1
    }))
    return Array.isArray(result) ? result[0]?.products : []
  })

  const {
    data: shopbar
  } = await useAsyncData('shopbar', () => {
    return $directus.request($readItem('navigation', '55'))
  })

  definePageMeta({
    layout: 'nolive',
  });

  useHead({
    title: computed(() => shop.value?.name || 'Shop Page')
  })
</script>