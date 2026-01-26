<template>
  <div class="contentPage">
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
                  :src="`${$directus.url}/assets/${shop?.image?.filename_disk}`" :alt="shop?.name" cover />
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

    <v-card elevation="0">
      <v-tabs v-model="tab" bg-color="info" align-tabs="center">
        <v-tab v-for="(menu, index) in shopbar?.menus" :key="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">

          <v-tabs-window-item :value="shopbar?.menus[1]?.value">
            <div v-for="(products, index) in shop?.products" :key="index">
              <productCard :product="products?.products_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[2]?.value">
            <div v-for="(showcases, index) in shop?.showcases" :key="index">
              <showcases :product="showcases?.showcases_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[3]?.value">
            <div v-for="(comments, index) in shop?.comments" :key="index">
              <comments :comments="comments?.comments_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[4]?.value">
            <div v-for="(spaces, index) in shop?.spaces" :key="index">
              <spaces :space="spaces?.spaces_id" />
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[5]?.value">
            <div v-for="(events, index) in shop?.events" :key="index">
              <events :space="events?.events_id" />
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import showcases from '~/components/catalog/product/relatedproducts.vue'
  import productCard from '~/components/catalog/product/productCard.vue'
  import comments from '#social/app/components/comments.vue'
  import spaces from '#social/app/components/space.vue'
  import events from '#social/app/components/event.vue'

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