<template>
  <div class="contentPage">
    <v-card class="mx-auto" max-width="100%">
      <v-img class="align-end text-white" height="200" v-if="shop?.image" :src="getAssetURL(shop?.image)"
        :alt="shop?.name" cover>
        <v-card-title style="text-align: center;">{{ shop?.name }}</v-card-title>
      </v-img>

      <v-toolbar>
        <v-toolbar-title>
          <NuxtLink :to="shop?.website"></NuxtLink>
        </v-toolbar-title>

        <v-toolbar-items>
          <followBtn />

          <share />
        </v-toolbar-items>
      </v-toolbar>
    </v-card>

    <!--Product Videos-->
    <v-row>
      <v-col cols="12" v-if="shop?.shorts?.length">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(shopShort, index) in shop?.shorts"
              :key="index">
              <shortsCard :short="shopShort" @click="toggle" />

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

    <v-card elevation="0">
      <v-tabs v-model="tab" bg-color="info" align-tabs="center">
        <v-tab v-for="(menu, index) in shopbar?.menus" :key="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <template>
        <v-tabs-window v-model="tab">

          <v-tabs-window-item :value="shopbar?.menus[0]?.value">
            <div v-for="(products, index) in shop?.products" :key="index">
              <productCard :product="products?.products_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[1]?.value">
            <div v-for="(showcases, index) in shop?.showcases" :key="index">
              <showcasesCard :product="showcases?.showcases_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[2]?.value">
            <div v-for="(comments, index) in shop?.comments" :key="index">
              <commentsCard :commentId="comments?.comments_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[3]?.value">
            <div v-for="(spaces, index) in shop?.spaces" :key="index">
              <spacesCard :space="spaces?.spaces_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[4]?.value">
            <div v-for="(events, index) in shopEvents" :key="index">
              <productCard :product="events?.products_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[5]?.value">
            <section data-bs-version="5.1" class="features02 essencem5 cid-uHg1VExDxg" id="features02-aq"
              data-sortbtn="btn-primary">
              <div class="container">
                <div class="row">
                  <div class="col-12">
                    <div class="title-wrapper">
                      <h2 class="mbr-section-title mbr-fonts-style display-2">
                        <strong>{{ shop?.name }}</strong>
                      </h2>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="card-wrapper">
                      <div class="item-img">
                        <NuxtImg loading="lazy" class="align-end text-white" v-if="shop?.image"
                          :src="getAssetURL(shop?.image)" :alt="shop?.name" cover />
                        <div class="card-box">
                          <div class="icon-wrapper">
                            <span class="mbr-iconfont mobi-mbri-contact-form mobi-mbri"></span>
                          </div>
                          <h4 class="card-title mbr-fonts-style display-5">
                            <strong>{{ shop?.name }}</strong>
                          </h4>

                          <div>
                            <div>
                              <p>Email: {{ shop?.store_email }}</p>
                            </div>

                            <div>
                              <p>Phone: {{ shop?.store_phone }}</p>
                            </div>

                            <div>
                              <p>Shipping Policy: {{ shop?.store_shipping_policy }}</p>
                            </div>

                            <div>
                              <p>Address: {{ shop?.store_address }}</p>
                            </div>

                            <div>
                              <p>Country: {{ shop?.store_country }}</p>
                            </div>
                          </div>
                          <p class="card-text mbr-fonts-style display-7" v-dompurify-html="shop?.description"></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>
        </v-tabs-window>
      </template>
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
    $readItem
  } = useNuxtApp()

  const slug = computed(() => {
    const s = route.params.slug
    return Array.isArray(s) ? s[0] : s
  })

  const {
    data: shopRaw
  } = await useAsyncData('shop', () => {
    return $directus.request($readItem('shops', {
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
          _eq: slug.value
        }
      },
      limit: 1
    }))
  })

  const shop = computed(() => shopRaw.value?.[0] || null)

  const {
    data: shopEvents
  } = await useAsyncData('shopEvents', () => {
    return $directus.request($readItem('shops', {
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
          _eq: slug.value
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
    }))
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