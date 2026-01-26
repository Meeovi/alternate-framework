<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar :title="showcasebar?.name" :color="showcasebar?.color"></v-toolbar>

      <v-tabs v-model="tab" bg-color="purple">
        <div v-for="(menu, index) in showcasebar?.menus" :key="index">
          <v-tab v-if="menu?.active === 'Active'" :value="menu?.value">{{ menu?.name }}</v-tab>
        </div>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <!--Bundle Products List-->
          <v-window-item :value="showcasebar?.menus[0]?.value">
            <v-row>
              <v-col cols="4" v-for="(product, index) in bundledProducts" :key="index">
                <productCard :product="product" />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Group Products List -->
          <v-window-item :value="showcasebar?.menus[1]?.value">
            <v-row>
              <v-col cols="4" v-for="item in groupedProducts" :key="item">
                <productCard :product="item" />
              </v-col>
            </v-row>
          </v-window-item>

          <!--Bundle Products List-->
          <v-window-item :value="showcasebar?.menus[2]?.value">
            <v-row>
              <v-col cols="4" v-for="(product, index) in subscriptions" :key="index">
                <productCard :product="product" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref,
    computed
  } from 'vue'
  import productCard from '~/components/catalog/product/productCard.vue'

  const tab = ref(null);

  const { $commerce } = useNuxtApp()

  const { data: groupedProducts } = await useAsyncData('groupedProducts', async () => {
    return await $commerce.getProducts({ pageSize: 12 })
  })

  const { data: bundledProducts } = await useAsyncData('bundledProducts', async () => {
    return await $commerce.getProducts({ pageSize: 12 })
  })

  const { data: subscriptions } = await useAsyncData('subscriptions', async () => {
    return await $commerce.getProducts({ pageSize: 12 })
  })

  const {
    data: productBlocks
  } = await useAsyncData('productBlocks', () => {
    return $directus.request($readItem('page_blocks', '8', {
      fields: ['*', 'media.directus_files_id.filename_disk', 'content.*'],
    }))
  })

  const {
    data: showcasebar
  } = await useAsyncData('showcasebar', () => {
    return $directus.request($readItem('navigation', '54'))
  })

  useHead({
    title: 'Showcases',
  });
</script>