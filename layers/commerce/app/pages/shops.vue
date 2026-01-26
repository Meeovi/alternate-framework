<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar title="Shops on Meeovi" color="green"></v-toolbar>
      <v-tabs v-model="tab" bg-color="green" align-tabs="center">
        <v-tab v-if="menus?.active === 'Active'" v-for="(menu, index) in shopbar?.menus" :key="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item :value="shopbar?.menus[0]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for=" (stores, index) in stores" :key="index">
                    <store :store="stores" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[1]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for=" (stores, index) in stores" :key="index">
                    <store :store="stores" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="shopbar?.menus[2]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for=" (stores, index) in stores" :key="index">
                    <store :store="stores" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import store from '../components/catalog/shops/stores.vue'

  const tab = ref(null)
    const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const {
    data: stores
  } = await useAsyncData('stores', () => {
    return $directus.request($readItems('shops', {
      fields: ['*', {
        '*': ['*']
      }]
    }))
  })

  const {
    data: shopbar
  } = await useAsyncData('shopbar', () => {
    return $directus.request($readItem('navigation', '55'))
  })

  useHead({
    title: 'Shops on Meeovi',
  })
</script>