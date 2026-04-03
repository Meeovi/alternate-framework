<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar title="Shops on Meeovi" color="green"></v-toolbar>
      <v-tabs v-model="tab" bg-color="green" align-tabs="center">
        <v-tab v-if="shopbar?.active === 'Active'" v-for="(menu, index) in shopbar?.menus" :key="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <template #header>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item :value="shopbar?.menus[0]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(shop, index) in stores" :key="index">
                    <store :store="shop" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[1]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(shop, index) in stores" :key="index">
                    <store :store="shop" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[2]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(shop, index) in stores" :key="index">
                    <store :store="shop" />
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

<script setup lang="ts">
import { useCommerceAdapter, useContentAdapter } from '#imports'
import { ref, useAsyncData, useHead, useNuxtApp } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
  import store from '../components/catalog/shops/stores.vue'

  const tab = ref(null)
  
  import { useContentFallback } from '../composables/useContent'
  const content = useContentFallback()

  const { data: stores } = await useAsyncData('stores', async () => {
    return await content.listShops({ fields: ['*', { '*': ['*'] }] })
  })

  const { data: shopbar } = await useAsyncData('shopbar', () => {
    const nuxtApp = useNuxtApp() as any
    return nuxtApp.$directus ? nuxtApp.$directus.request(nuxtApp.$readItem('navigation', '55')) : null
  })

  useHead({
    title: 'Shops on Meeovi',
  })
</script>